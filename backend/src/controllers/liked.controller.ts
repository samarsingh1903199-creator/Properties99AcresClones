import { Request, Response } from "express";
import { Types } from "mongoose";
import { UserModel } from "../models/User.model.js";
import { PropertyModel } from "../models/Property.model.js";
import { AuthRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getLikedIds = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.userId;
  const user = await UserModel.findById(userId).select("savedProperties").lean();
  if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
  res.json({ success: true, data: (user.savedProperties ?? []).map(String) });
});

export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.userId;
  const { propertyId } = req.params;

  if (!Types.ObjectId.isValid(propertyId)) {
    res.status(400).json({ success: false, message: "Invalid property ID" });
    return;
  }

  const propertyExists = await PropertyModel.exists({ _id: propertyId });
  if (!propertyExists) { res.status(404).json({ success: false, message: "Property not found" }); return; }

  const user = await UserModel.findById(userId).select("savedProperties");
  if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }

  const oid = new Types.ObjectId(propertyId);
  const alreadyLiked = user.savedProperties.some((id) => id.equals(oid));

  if (alreadyLiked) {
    user.savedProperties = user.savedProperties.filter((id) => !id.equals(oid));
  } else {
    user.savedProperties.push(oid);
  }

  await user.save();

  res.json({
    success: true,
    liked: !alreadyLiked,
    data: user.savedProperties.map(String),
  });
});

export const getLikedProperties = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.userId;
  const user = await UserModel.findById(userId).select("savedProperties").lean();
  if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }

  const ids = user.savedProperties ?? [];
  const properties = await PropertyModel.find({ _id: { $in: ids } }).lean();
  res.json({ success: true, count: properties.length, data: properties });
});
