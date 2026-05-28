import { Schema, model, Document, Types } from "mongoose";
import { UserRole } from "../types/index.js";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone: string;
  company: string;
  licenseNumber: string;
  verified: boolean;
  savedProperties: Types.ObjectId[];
  createdAt: string;
}

const UserSchema = new Schema<IUser>(
  {
    name:             { type: String, required: true, trim: true },
    email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:     { type: String, required: true },
    role:             { type: String, enum: ["visitor", "dealer", "admin"] as const, default: "visitor" as UserRole },
    phone:            { type: String, default: "" },
    company:          { type: String, default: "" },
    licenseNumber:    { type: String, default: "" },
    verified:         { type: Boolean, default: false },
    savedProperties:  { type: [Schema.Types.ObjectId], ref: "Property", default: [] },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", UserSchema);
