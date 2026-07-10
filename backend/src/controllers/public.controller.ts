import { Request, Response } from "express";
import { PropertyModel } from "../models/Property.model.js";
import { UserModel } from "../models/User.model.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const PUBLIC_FIELDS = "title type listingType price area bedrooms bathrooms location city address description images status views inquiries ownerId amenities saleDetails isHighlighted highlightedAt createdAt updatedAt";

const PUBLIC_DEALER_FIELDS = "name company phone licenseNumber verified createdAt";

async function attachDealerStats(dealers: Array<{ _id: unknown; [key: string]: unknown }>) {
  const ids = dealers.map(d => String(d._id));
  if (ids.length === 0) return [];

  const stats = await PropertyModel.aggregate<{ _id: string; count: number; cities: string[]; inquiries: number }>([
    { $match: { ownerId: { $in: ids }, status: { $in: ["active", "pending"] } } },
    {
      $group: {
        _id: "$ownerId",
        count: { $sum: 1 },
        cities: { $addToSet: "$city" },
        inquiries: { $sum: "$inquiries" },
      },
    },
  ]);

  const statMap = new Map(stats.map(s => [s._id, s]));

  return dealers.map(d => {
    const id = String(d._id);
    const s = statMap.get(id);
    return {
      _id: id,
      name: d.name,
      company: d.company ?? "",
      phone: d.phone ?? "",
      licenseNumber: d.licenseNumber ?? "",
      verified: Boolean(d.verified),
      memberSince: d.createdAt,
      totalProperties: s?.count ?? 0,
      totalInquiries: s?.inquiries ?? 0,
      cities: (s?.cities ?? []).filter(Boolean),
    };
  });
}

export const getPublicDealers = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query;
  const filter: Record<string, unknown> = { role: "dealer" };

  if (search) {
    const q = { $regex: String(search), $options: "i" };
    filter.$or = [{ name: q }, { company: q }, { phone: q }];
  }

  const dealers = await UserModel.find(filter)
    .select(PUBLIC_DEALER_FIELDS)
    .sort({ verified: -1, createdAt: -1 })
    .lean();

  const data = await attachDealerStats(dealers);
  res.json({ success: true, count: data.length, data });
});

export const getPublicDealer = asyncHandler(async (req: Request, res: Response) => {
  const dealer = await UserModel.findOne({ _id: req.params.id, role: "dealer" })
    .select(PUBLIC_DEALER_FIELDS)
    .lean();

  if (!dealer) {
    res.status(404).json({ success: false, message: "Dealer not found" });
    return;
  }

  const [data] = await attachDealerStats([dealer]);
  res.json({ success: true, data });
});

export const getPublicProperty = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const property = await PropertyModel.findOne({ _id: id, status: { $in: ["active", "pending"] } })
    .select(PUBLIC_FIELDS);
  if (!property) {
    res.status(404).json({ success: false, message: "Property not found or no longer available" });
    return;
  }
  res.json({ success: true, data: property });
});

export const getPublicProperties = asyncHandler(async (req: Request, res: Response) => {
  const { listingType, type, city, minPrice, maxPrice, search, limit } = req.query;

  const filter: Record<string, unknown> = { status: { $in: ["active", "pending"] } };
  if (listingType) filter.listingType = listingType;
  if (type)        filter.type        = type;
  if (city)        filter.city        = { $regex: String(city), $options: "i" };
  if (minPrice || maxPrice) {
    filter.price = {
      ...(minPrice ? { $gte: Number(minPrice) } : {}),
      ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
    };
  }
  if (search) {
    const q = { $regex: String(search), $options: "i" };
    filter.$or = [{ title: q }, { location: q }, { city: q }, { description: q }];
  }

  const take = Math.min(Number(limit) || 100, 200);
  const list = await PropertyModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(take)
    .select(PUBLIC_FIELDS);

  res.json({ success: true, count: list.length, data: list });
});

/** Public highlighted / featured property listings */
export const getHighlightedProperties = asyncHandler(async (req: Request, res: Response) => {
  const take = Math.min(Number(req.query.limit) || 12, 50);

  const list = await PropertyModel.find({
    isHighlighted: true,
    status: { $in: ["active", "pending"] },
  })
    .sort({ highlightedAt: -1, createdAt: -1 })
    .limit(take)
    .select(PUBLIC_FIELDS);

  res.json({ success: true, count: list.length, data: list });
});
