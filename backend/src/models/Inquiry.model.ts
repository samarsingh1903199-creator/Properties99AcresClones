import { Schema, model, Document } from "mongoose";
import { InquiryStatus } from "../types/index.js";

export interface IInquiry extends Document {
  name: string;
  phone: string;
  email: string;
  propertyId: string;
  propertyTitle: string;
  message: string;
  status: InquiryStatus;
  ownerId: string;
}

const InquirySchema = new Schema<IInquiry>(
  {
    name:          { type: String, required: true, trim: true },
    phone:         { type: String, default: "" },
    email:         { type: String, required: true, lowercase: true, trim: true },
    propertyId:    { type: String, required: true },
    propertyTitle: { type: String, required: true },
    message:       { type: String, required: true },
    status:        { type: String, enum: ["new", "responded", "closed"], default: "new" },
    ownerId:       { type: String, required: true },
  },
  { timestamps: true }
);

InquirySchema.index({ ownerId: 1 });
InquirySchema.index({ propertyId: 1 });
InquirySchema.index({ status: 1 });

export const InquiryModel = model<IInquiry>("Inquiry", InquirySchema);
