import { Request, Response } from "express";
import { PropertyModel } from "../models/Property.model.js";
import { AuthRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { PropertyType, ListingType, PropertyStatus } from "../types/index.js";
import { PREFERRED_TENANT_TYPES } from "../constants/tenants.js";

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

/** Authenticated dealer/admin: list highlighted properties owned by the user */
export const getMyHighlightedProperties = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const take = Math.min(Number(req.query.limit) || 50, 100);

  const filter: Record<string, unknown> = { isHighlighted: true };
  if (authReq.user?.role !== "admin") {
    filter.ownerId = authReq.user?.userId;
  }

  const list = await PropertyModel.find(filter)
    .sort({ highlightedAt: -1, createdAt: -1 })
    .limit(take);

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
  const { title, type, listingType, price, area, bedrooms, bathrooms, address, description, images, status, amenities, saleDetails } = req.body;

  if (!title || !type || !listingType || !price || !area) {
    res.status(400).json({ success: false, message: "title, type, listingType, price, and area are required" });
    return;
  }

  if (!address || typeof address !== "object") {
    res.status(400).json({ success: false, message: "address object is required" });
    return;
  }
  if (!String(address.city  ?? "").trim()) {
    res.status(400).json({ success: false, message: "address.city is required" });
    return;
  }
  if (!String(address.street ?? "").trim()) {
    res.status(400).json({ success: false, message: "address.street is required" });
    return;
  }

  const property = await PropertyModel.create({
    title, type: type as PropertyType, listingType: listingType as ListingType,
    price: Number(price), area: Number(area),
    bedrooms: Number(bedrooms ?? 1), bathrooms: Number(bathrooms ?? 1),
    location: String(address.street).trim(),
    city:     String(address.city).trim(),
    address,
    description: description ?? "",
    images: images ?? [],
    status: (status ?? "draft") as PropertyStatus,
    ownerId: authReq.user!.userId,
    amenities: amenities ?? {},
    ...(listingType === "sale" && saleDetails ? { saleDetails } : {}),
  });

  res.status(201).json({ success: true, data: property });
});

export const updateProperty = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const allowed = ["title","type","listingType","price","area","bedrooms","bathrooms","address","description","images","status","amenities","saleDetails"];
  const updates: Record<string, unknown> = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  // Always derive flat location/city from address so both representations stay in sync
  if (req.body.address) {
    if (req.body.address.street) updates.location = String(req.body.address.street).trim();
    if (req.body.address.city)   updates.city     = String(req.body.address.city).trim();
  }

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

  const VALID_TENANT_TYPES = PREFERRED_TENANT_TYPES;

  const updates: Record<string, unknown> = {};
  ALLOWED_AMENITY_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) updates[`amenities.${field}`] = req.body[field];
  });

  if (req.body.preferred_tenants !== undefined) {
    if (!Array.isArray(req.body.preferred_tenants)) {
      res.status(400).json({ success: false, message: "preferred_tenants must be an array" });
      return;
    }
    const invalid = req.body.preferred_tenants.filter((t: unknown) => !VALID_TENANT_TYPES.includes(t as string));
    if (invalid.length > 0) {
      res.status(400).json({ success: false, message: `Invalid tenant type(s): ${invalid.join(", ")}. Allowed: ${VALID_TENANT_TYPES.join(", ")}` });
      return;
    }
    updates["amenities.preferred_tenants"] = [...new Set(req.body.preferred_tenants as string[])];
  }

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

/** Mark or unmark a property as highlighted (dealer: own listings; admin: any) */
export const setPropertyHighlighted = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { highlighted } = req.body;

  if (typeof highlighted !== "boolean") {
    res.status(400).json({ success: false, message: "highlighted (boolean) is required" });
    return;
  }

  const filter: Record<string, unknown> = { _id: req.params.id };
  if (authReq.user?.role !== "admin") {
    filter.ownerId = authReq.user?.userId;
  }

  const property = await PropertyModel.findOne(filter);
  if (!property) {
    res.status(404).json({ success: false, message: "Property not found" });
    return;
  }

  if (highlighted && !["active", "pending"].includes(property.status)) {
    res.status(400).json({
      success: false,
      message: "Only active or pending properties can be highlighted",
    });
    return;
  }

  property.isHighlighted = highlighted;
  property.highlightedAt = highlighted ? new Date() : undefined;
  await property.save();

  res.json({
    success: true,
    message: highlighted ? "Property marked as highlighted" : "Property removed from highlights",
    data: property,
  });
});
