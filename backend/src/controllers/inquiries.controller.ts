import { Request, Response } from "express";
import { InquiryModel } from "../models/Inquiry.model.js";
import { PropertyModel } from "../models/Property.model.js";
import { AuthRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { InquiryStatus } from "../types/index.js";

export const getInquiries = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { status, propertyId } = req.query;

  const filter: Record<string, unknown> = { ownerId: authReq.user?.userId };
  if (status)     filter.status     = status;
  if (propertyId) filter.propertyId = propertyId;

  const list = await InquiryModel.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: list.length, data: list });
});

export const getInquiry = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const inquiry = await InquiryModel.findOne({ _id: req.params.id, ownerId: authReq.user?.userId });
  if (!inquiry) { res.status(404).json({ success: false, message: "Inquiry not found" }); return; }
  res.json({ success: true, data: inquiry });
});

export const createInquiry = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, email, propertyId, message } = req.body;

  if (!name || !email || !propertyId || !message) {
    res.status(400).json({ success: false, message: "name, email, propertyId and message are required" });
    return;
  }

  const property = await PropertyModel.findById(propertyId);
  if (!property) { res.status(404).json({ success: false, message: "Property not found" }); return; }

  const inquiry = await InquiryModel.create({
    name, phone: phone ?? "", email,
    propertyId: String(property._id),
    propertyTitle: property.title,
    message,
    status: "new" as InquiryStatus,
    ownerId: property.ownerId,
  });

  await PropertyModel.findByIdAndUpdate(propertyId, { $inc: { inquiries: 1 } });
  res.status(201).json({ success: true, data: inquiry });
});

export const updateInquiryStatus = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { status } = req.body;

  if (!["new", "responded", "closed"].includes(status)) {
    res.status(400).json({ success: false, message: "status must be new | responded | closed" });
    return;
  }

  const inquiry = await InquiryModel.findOneAndUpdate(
    { _id: req.params.id, ownerId: authReq.user?.userId },
    { $set: { status: status as InquiryStatus } },
    { new: true }
  );
  if (!inquiry) { res.status(404).json({ success: false, message: "Inquiry not found" }); return; }
  res.json({ success: true, data: inquiry });
});
