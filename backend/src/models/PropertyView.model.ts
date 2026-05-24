import { Schema, model } from "mongoose";

export interface IPropertyView {
  propertyId:    string;
  propertyTitle: string;
  ownerId:       string;
  userId:        string;
  userName:      string;
  userEmail:     string;
  userPhone:     string;
  source:        "view" | "book";
  viewedAt:      Date;
}

const PropertyViewSchema = new Schema<IPropertyView>(
  {
    propertyId:    { type: String, required: true },
    propertyTitle: { type: String, default: "" },
    ownerId:       { type: String, required: true },
    userId:        { type: String, default: "" },
    userName:      { type: String, default: "Anonymous" },
    userEmail:     { type: String, default: "" },
    userPhone:     { type: String, default: "" },
    source:        { type: String, enum: ["view", "book"], default: "view" },
    viewedAt:      { type: Date, default: Date.now },
  },
  { timestamps: false }
);

PropertyViewSchema.index({ propertyId: 1, viewedAt: -1 });
PropertyViewSchema.index({ ownerId: 1, viewedAt: -1 });
// Enforce one record per authenticated user per property (userId="" rows are anonymous, not deduplicated)
PropertyViewSchema.index(
  { propertyId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $ne: "" } } }
);

export const PropertyViewModel = model<IPropertyView>("PropertyView", PropertyViewSchema);
