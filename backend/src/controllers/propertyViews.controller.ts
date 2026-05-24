import { Request, Response } from "express";
import { PropertyModel }     from "../models/Property.model.js";
import { PropertyViewModel } from "../models/PropertyView.model.js";
import { AuthRequest }       from "../middleware/auth.js";
import { asyncHandler }      from "../middleware/errorHandler.js";

/* ── POST /api/public/properties/:id/view ──────────────────────────
   Called by the frontend when a visitor views or books a property.
   No auth required — but if the visitor is logged in the client
   can pass their details in the body.
   ------------------------------------------------------------------ */
export const recordView = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    userId    = "",
    userName  = "Anonymous",
    userEmail = "",
    userPhone = "",
    source    = "view",
  } = req.body as {
    userId?: string; userName?: string;
    userEmail?: string; userPhone?: string;
    source?: "view" | "book";
  };

  const validSource = source === "book" ? "book" : "view";

  const property = await PropertyModel.findById(id).select("title ownerId status views");
  if (!property || property.status !== "active") {
    res.status(404).json({ success: false, message: "Property not found" });
    return;
  }

  let isNewRecord = true;

  if (userId) {
    // Authenticated user — enforce one record per (user, property)
    const existing = await PropertyViewModel.findOne({
      propertyId: String(property._id),
      userId,
    });

    if (existing) {
      // Already recorded — just refresh the timestamp and upgrade source if booking
      const patch: Record<string, unknown> = { viewedAt: new Date(), userName, userEmail, userPhone };
      if (validSource === "book") patch.source = "book";
      await existing.updateOne(patch);
      isNewRecord = false;
    } else {
      await PropertyViewModel.create({
        propertyId:    String(property._id),
        propertyTitle: property.title,
        ownerId:       property.ownerId,
        userId,
        userName,
        userEmail,
        userPhone,
        source:        validSource,
      });
    }
  } else {
    // Anonymous visitor — no way to deduplicate, always create
    await PropertyViewModel.create({
      propertyId:    String(property._id),
      propertyTitle: property.title,
      ownerId:       property.ownerId,
      userId:        "",
      userName,
      userEmail,
      userPhone,
      source:        validSource,
    });
  }

  // Only bump the counter for genuinely new visitors
  let currentViews = property.views ?? 0;
  if (isNewRecord) {
    const updated = await PropertyModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true, select: "views" }
    );
    currentViews = updated?.views ?? currentViews;
  }

  res.json({ success: true, views: currentViews, alreadyRecorded: !isNewRecord });
});

/* ── GET /api/properties/:id/views ────────────────────────────────
   Dealer-only: returns viewer records for one of their properties.
   Supports ?source=view|book, ?page, ?limit
   ------------------------------------------------------------------ */
export const getPropertyViews = asyncHandler(async (req: Request, res: Response) => {
  const authReq  = req as AuthRequest;
  const ownerId  = authReq.user?.userId;
  const { id }   = req.params;
  const { source, page = "1", limit = "50" } = req.query;

  // Verify property belongs to this dealer
  const property = await PropertyModel.findOne({ _id: id, ownerId }).select("title views inquiries");
  if (!property) {
    res.status(404).json({ success: false, message: "Property not found" });
    return;
  }

  const filter: Record<string, unknown> = { propertyId: id };
  if (source === "view" || source === "book") filter.source = source;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await PropertyViewModel.countDocuments(filter);
  const views = await PropertyViewModel.find(filter)
    .sort({ viewedAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Summary breakdown
  const [viewCount, bookCount, uniqueEmails] = await Promise.all([
    PropertyViewModel.countDocuments({ propertyId: id, source: "view" }),
    PropertyViewModel.countDocuments({ propertyId: id, source: "book" }),
    PropertyViewModel.distinct("userEmail", { propertyId: id, userEmail: { $ne: "" } }),
  ]);

  res.json({
    success: true,
    property: {
      id:       String(property._id),
      title:    property.title,
      views:    property.views,
      inquiries: property.inquiries,
    },
    summary: {
      totalViews:    viewCount,
      bookClicks:    bookCount,
      uniqueVisitors: uniqueEmails.length,
    },
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    data: views,
  });
});

/* ── GET /api/analytics/views ─────────────────────────────────────
   Dealer-only: recent view activity across all their properties.
   ------------------------------------------------------------------ */
export const getAllPropertyViews = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const ownerId = authReq.user?.userId;
  const { source, page = "1", limit = "50" } = req.query;

  const filter: Record<string, unknown> = { ownerId };
  if (source === "view" || source === "book") filter.source = source;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await PropertyViewModel.countDocuments(filter);
  const views = await PropertyViewModel.find(filter)
    .sort({ viewedAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const [totalViews, bookClicks, uniqueEmails] = await Promise.all([
    PropertyViewModel.countDocuments({ ownerId, source: "view" }),
    PropertyViewModel.countDocuments({ ownerId, source: "book" }),
    PropertyViewModel.distinct("userEmail", { ownerId, userEmail: { $ne: "" } }),
  ]);

  res.json({
    success: true,
    summary: {
      totalViews,
      bookClicks,
      uniqueVisitors: uniqueEmails.length,
    },
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    data: views,
  });
});
