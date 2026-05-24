import { Request, Response } from "express";
import { PropertyModel } from "../models/Property.model.js";
import { AuthRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { PropertyType, ListingType, PropertyStatus } from "../types/index.js";

export const getProperties = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { status, listingType, city, type, minPrice, maxPrice, search } = req.query;

  const filter: Record<string, unknown> = { ownerId: authReq.user?.userId };
  if (status)      filter.status      = status;
  if (listingType) filter.listingType = listingType;
  if (city)        filter.city        = { $regex: String(city), $options: "i" };
  if (type)        filter.type        = type;
  if (minPrice || maxPrice) {
    filter.price = {
      ...(minPrice ? { $gte: Number(minPrice) } : {}),
      ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
    };
  }
  if (search) {
    const q = { $regex: String(search), $options: "i" };
    filter.$or = [{ title: q }, { location: q }, { city: q }];
  }

  const list = await PropertyModel.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: list.length, data: list });
});

export const getProperty = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const property = await PropertyModel.findOneAndUpdate(
    { _id: req.params.id, ownerId: authReq.user?.userId },
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!property) { res.status(404).json({ success: false, message: "Property not found" }); return; }
  res.json({ success: true, data: property });
});

export const createProperty = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { title, type, listingType, price, area, bedrooms, bathrooms, location, city, description, images, status, amenities } = req.body;

  if (!title || !type || !listingType || !price || !area || !location || !city) {
    res.status(400).json({ success: false, message: "title, type, listingType, price, area, location and city are required" });
    return;
  }

  const VALID_TYPES = ["apartment", "villa", "plot", "commercial", "penthouse"];
  if (!VALID_TYPES.includes(type)) {
    res.status(400).json({ success: false, message: `type must be one of: ${VALID_TYPES.join(", ")}` });
    return;
  }

  const property = await PropertyModel.create({
    title, type: type as PropertyType, listingType: listingType as ListingType,
    price: Number(price), area: Number(area),
    bedrooms: Number(bedrooms ?? 1), bathrooms: Number(bathrooms ?? 1),
    location, city,
    description: description ?? "",
    images: images ?? [],
    status: (status ?? "draft") as PropertyStatus,
    ownerId: authReq.user!.userId,
    amenities: amenities ?? {},
  });

  res.status(201).json({ success: true, data: property });
});

export const updateProperty = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const allowed = ["title","type","listingType","price","area","bedrooms","bathrooms","location","city","description","images","status","amenities"];
  const updates: Record<string, unknown> = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const property = await PropertyModel.findOneAndUpdate(
    { _id: req.params.id, ownerId: authReq.user?.userId },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!property) { res.status(404).json({ success: false, message: "Property not found" }); return; }
  res.json({ success: true, data: property });
});

export const deleteProperty = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const property = await PropertyModel.findOneAndDelete({ _id: req.params.id, ownerId: authReq.user?.userId });
  if (!property) { res.status(404).json({ success: false, message: "Property not found" }); return; }
  res.json({ success: true, message: "Property deleted" });
});

export const getPropertyAmenities = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const property = await PropertyModel.findOne(
    { _id: req.params.id, ownerId: authReq.user?.userId },
    { amenities: 1 }
  );
  if (!property) { res.status(404).json({ success: false, message: "Property not found" }); return; }
  res.json({ success: true, propertyId: req.params.id, data: property.amenities });
});

export const upsertPropertyAmenities = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;

  const ALLOWED_AMENITY_FIELDS = [
    "parking", "powerBackup", "security24x7", "separateElectricityMeter",
    "waterSupply", "highSpeedWifi", "gymnasium", "swimmingPool", "clubHouse",
    "airConditioning", "acCount", "furnishingStatus", "bedsCount",
    "almirah", "storage", "securityDeposit", "distanceFromLocation",
  ];

  const updates: Record<string, unknown> = {};
  ALLOWED_AMENITY_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) updates[`amenities.${field}`] = req.body[field];
  });

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ success: false, message: "No valid amenity fields provided" });
    return;
  }

  const property = await PropertyModel.findOneAndUpdate(
    { _id: req.params.id, ownerId: authReq.user?.userId },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!property) { res.status(404).json({ success: false, message: "Property not found" }); return; }
  res.json({ success: true, propertyId: req.params.id, data: property.amenities });
});
