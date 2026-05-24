import { Request, Response } from "express";
import { VisitEnquiryModel } from "../models/VisitEnquiry.model.js";
import { PropertyModel } from "../models/Property.model.js";
import { AuthRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { VisitEnquiryStatus } from "../types/index.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_STATUSES: VisitEnquiryStatus[] = ["pending", "confirmed", "completed", "cancelled"];

/* ── POST /api/visit-enquiries ──────────────────────────────────────── */
export const createVisitEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, propertyId, visitType, visitDate, visitTime, message, guestCount, userId } = req.body;

  // Required fields
  if (!name || !email || !phone || !propertyId || !visitType || !visitDate || !visitTime) {
    res.status(400).json({
      success: false,
      message: "name, email, phone, propertyId, visitType, visitDate and visitTime are required",
    });
    return;
  }

  if (!EMAIL_RE.test(String(email))) {
    res.status(400).json({ success: false, message: "Invalid email address" });
    return;
  }

  const phoneDigits = String(phone).replace(/\D/g, "");
  if (phoneDigits.length !== 10) {
    res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
    return;
  }

  if (!["physical", "video"].includes(visitType)) {
    res.status(400).json({ success: false, message: "visitType must be 'physical' or 'video'" });
    return;
  }

  const parsedDate = new Date(visitDate);
  if (isNaN(parsedDate.getTime())) {
    res.status(400).json({ success: false, message: "Invalid visit date" });
    return;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsedDate < today) {
    res.status(400).json({ success: false, message: "Visit date cannot be in the past" });
    return;
  }

  const property = await PropertyModel.findById(propertyId);
  if (!property) {
    res.status(404).json({ success: false, message: "Property not found" });
    return;
  }

  // Duplicate: same visitor email + property + date + time slot
  const existing = await VisitEnquiryModel.findOne({
    email:      String(email).toLowerCase().trim(),
    propertyId: String(property._id),
    visitDate:  parsedDate,
    visitTime:  String(visitTime),
  });
  if (existing) {
    res.status(409).json({
      success: false,
      message: "You already have a visit scheduled for this property at the same date and time",
    });
    return;
  }

  const enquiry = await VisitEnquiryModel.create({
    propertyId:    String(property._id),
    propertyTitle: property.title,
    ownerId:       property.ownerId,
    name:          String(name).trim(),
    email:         String(email).toLowerCase().trim(),
    phone:         phoneDigits,
    visitType,
    visitDate:     parsedDate,
    visitTime:     String(visitTime),
    message:       message ? String(message).trim() : "",
    guestCount:    Number(guestCount) >= 1 ? Math.min(Number(guestCount), 10) : 1,
    status:        "pending",
    userId:        userId ?? null,
  });

  await PropertyModel.findByIdAndUpdate(propertyId, { $inc: { inquiries: 1 } });

  res.status(201).json({ success: true, data: enquiry });
});

/* ── GET /api/visit-enquiries ───────────────────────────────────────── */
export const getVisitEnquiries = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { status, propertyId, visitType, date, search, page, limit } = req.query;
  const isAdmin = authReq.user?.role === "admin";

  // Admins see all enquiries; dealers see only their own
  const baseFilter: Record<string, unknown> = isAdmin ? {} : { ownerId: authReq.user?.userId };

  const filter: Record<string, unknown> = { ...baseFilter };
  if (status)     filter.status     = status;
  if (propertyId) filter.propertyId = propertyId;
  if (visitType)  filter.visitType  = visitType;

  if (date) {
    const d = new Date(date as string);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    filter.visitDate = { $gte: d, $lt: next };
  }

  if (search) {
    const re = { $regex: String(search), $options: "i" };
    filter.$or = [{ name: re }, { email: re }, { propertyTitle: re }, { phone: re }];
  }

  const pageNum  = Math.max(1, parseInt(String(page  ?? 1),  10));
  const limitNum = Math.min(50, Math.max(1, parseInt(String(limit ?? 20), 10)));
  const skip     = (pageNum - 1) * limitNum;

  const [list, total, statusAgg] = await Promise.all([
    VisitEnquiryModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    VisitEnquiryModel.countDocuments(filter),
    VisitEnquiryModel.aggregate([
      { $match: baseFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts: Record<string, number> = { all: 0 };
  for (const { _id, count } of statusAgg as { _id: string; count: number }[]) {
    statusCounts[_id] = count;
    statusCounts.all += count;
  }

  res.json({
    success: true,
    total,
    page:   pageNum,
    pages:  Math.ceil(total / limitNum),
    count:  list.length,
    data:   list,
    statusCounts,
  });
});

/* ── GET /api/visit-enquiries/:id ──────────────────────────────────── */
export const getVisitEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const enquiry = await VisitEnquiryModel.findOne({
    _id: req.params.id,
    ownerId: authReq.user?.userId,
  });
  if (!enquiry) {
    res.status(404).json({ success: false, message: "Enquiry not found" });
    return;
  }
  res.json({ success: true, data: enquiry });
});

/* ── PATCH /api/visit-enquiries/:id ────────────────────────────────── */
export const updateVisitEnquiryStatus = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({
      success: false,
      message: `status must be one of: ${VALID_STATUSES.join(", ")}`,
    });
    return;
  }

  const enquiry = await VisitEnquiryModel.findOneAndUpdate(
    { _id: req.params.id, ownerId: authReq.user?.userId },
    { $set: { status: status as VisitEnquiryStatus } },
    { new: true }
  );
  if (!enquiry) {
    res.status(404).json({ success: false, message: "Enquiry not found" });
    return;
  }
  res.json({ success: true, data: enquiry });
});
