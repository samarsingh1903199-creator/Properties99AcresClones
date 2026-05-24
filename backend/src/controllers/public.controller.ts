import { Request, Response } from "express";
import { PropertyModel } from "../models/Property.model.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getPublicProperty = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const property = await PropertyModel.findOne({ _id: id, status: "active" })
    .select("title type listingType price area bedrooms bathrooms location city description images status views inquiries ownerId amenities createdAt");
  if (!property) {
    res.status(404).json({ success: false, message: "Property not found or no longer available" });
    return;
  }
  res.json({ success: true, data: property });
});

export const getPublicProperties = asyncHandler(async (req: Request, res: Response) => {
  const { listingType, type, city, minPrice, maxPrice, search, limit } = req.query;

  const filter: Record<string, unknown> = { status: "active" };
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
    .select("title type listingType price area bedrooms bathrooms location city description images status views inquiries ownerId amenities createdAt");

  res.json({ success: true, count: list.length, data: list });
});
