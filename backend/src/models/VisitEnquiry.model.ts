import { Schema, model, Document } from "mongoose";
import { VisitType, VisitEnquiryStatus } from "../types/index.js";

export interface IVisitEnquiry extends Document {
  propertyId:    string;
  propertyTitle: string;
  ownerId:       string;
  name:          string;
  email:         string;
  phone:         string;
  visitType:     VisitType;
  visitDate:     Date;
  visitTime:     string;
  message:       string;
  guestCount:    number;
  status:        VisitEnquiryStatus;
  userId?:       string | null;
}

const VisitEnquirySchema = new Schema<IVisitEnquiry>(
  {
    propertyId:    { type: String, required: true },
    propertyTitle: { type: String, required: true },
    ownerId:       { type: String, required: true },
    name:          { type: String, required: true, trim: true },
    email:         { type: String, required: true, lowercase: true, trim: true },
    phone:         { type: String, required: true },
    visitType:     { type: String, enum: ["physical", "video"], required: true },
    visitDate:     { type: Date, required: true },
    visitTime:     { type: String, required: true },
    message:       { type: String, default: "" },
    guestCount:    { type: Number, default: 1, min: 1, max: 10 },
    status:        { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
    userId:        { type: String, default: null },
  },
  { timestamps: true }
);

VisitEnquirySchema.index({ ownerId: 1 });
VisitEnquirySchema.index({ propertyId: 1 });
VisitEnquirySchema.index({ status: 1 });
VisitEnquirySchema.index({ visitDate: 1 });
/* Prevent duplicate booking: same visitor + property + slot */
VisitEnquirySchema.index(
  { email: 1, propertyId: 1, visitDate: 1, visitTime: 1 },
  { unique: true }
);

export const VisitEnquiryModel = model<IVisitEnquiry>("VisitEnquiry", VisitEnquirySchema);
