import { Request, Response } from "express";
import { PropertyModel } from "../models/Property.model.js";
import { InquiryModel } from "../models/Inquiry.model.js";
import { AuthRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const ownerId = authReq.user?.userId;

  const [
    totalProperties,
    activeListings,
    viewsResult,
    inquiriesResult,
    byStatus,
    byListing,
    portfolioResult,
    topProperties,
    inquiryBreakdown,
  ] = await Promise.all([
    PropertyModel.countDocuments({ ownerId }),
    PropertyModel.countDocuments({ ownerId, status: "active" }),
    PropertyModel.aggregate([{ $match: { ownerId } }, { $group: { _id: null, total: { $sum: "$views" } } }]),
    PropertyModel.aggregate([{ $match: { ownerId } }, { $group: { _id: null, total: { $sum: "$inquiries" } } }]),
    PropertyModel.aggregate([
      { $match: { ownerId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    PropertyModel.aggregate([
      { $match: { ownerId } },
      { $group: { _id: "$listingType", count: { $sum: 1 } } },
    ]),
    PropertyModel.aggregate([
      { $match: { ownerId, listingType: "sale", status: "active" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]),
    PropertyModel.find({ ownerId }).sort({ views: -1 }).limit(5).select("title views inquiries"),
    InquiryModel.aggregate([
      { $match: { ownerId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const toMap = (arr: { _id: string; count: number }[]) =>
    arr.reduce<Record<string, number>>((acc, { _id, count }) => { acc[_id] = count; return acc; }, {});

  res.json({
    success: true,
    data: {
      summary: {
        totalProperties,
        activeListings,
        totalViews:     viewsResult[0]?.total ?? 0,
        totalInquiries: inquiriesResult[0]?.total ?? 0,
        portfolioValue: portfolioResult[0]?.total ?? 0,
      },
      byStatus:         toMap(byStatus),
      byListing:        toMap(byListing),
      topProperties,
      inquiryBreakdown: toMap(inquiryBreakdown),
    },
  });
});
