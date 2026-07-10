import { Schema, model, Document } from "mongoose";

export type CategoryType = "listing" | "property";

export interface ICategory extends Document {
  name: string;
  slug: string;
  categoryType: CategoryType;
  icon: string;
  order: number;
  isActive: boolean;
  matchValues: string[];
}

const CategorySchema = new Schema<ICategory>(
  {
    name:         { type: String, required: true, trim: true },
    slug:         { type: String, required: true, trim: true, unique: true, lowercase: true },
    categoryType: { type: String, enum: ["listing", "property"], required: true },
    icon:         { type: String, default: "" },
    order:        { type: Number, default: 0 },
    isActive:     { type: Boolean, default: true },
    matchValues:  { type: [String], default: [] },
  },
  { timestamps: true }
);

CategorySchema.index({ categoryType: 1, order: 1 });

export const CategoryModel = model<ICategory>("Category", CategorySchema);
