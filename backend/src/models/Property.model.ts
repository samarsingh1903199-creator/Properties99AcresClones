import { Schema, model, Document } from "mongoose";
import { PropertyStatus, PropertyType, ListingType } from "../types/index.js";

export interface IPropertyAmenities {
  /* Parking */
  parking: 0 | 1 | 2 | 3;

  /* Utilities & Security */
  powerBackup: boolean;
  security24x7: boolean;
  separateElectricityMeter: boolean;
  waterSupply: "municipal" | "borewell" | "both" | "none";

  /* Connectivity */
  highSpeedWifi: boolean;

  /* Recreational */
  gymnasium: boolean;
  swimmingPool: boolean;
  clubHouse: boolean;

  /* Climate */
  airConditioning: boolean;
  acCount: number;

  /* Furnishing */
  furnishingStatus: "unfurnished" | "semi-furnished" | "fully-furnished";
  bedsCount: number;
  almirah: boolean;
  storage: boolean;

  /* Financial */
  securityDeposit: number;

  /* Location */
  distanceFromLocation: number;
}

export interface IProperty extends Document {
  title: string;
  type: PropertyType;
  listingType: ListingType;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  city: string;
  description: string;
  images: string[];
  status: PropertyStatus;
  views: number;
  inquiries: number;
  ownerId: string;
  amenities: IPropertyAmenities;
}

const AmenitiesSchema = new Schema<IPropertyAmenities>(
  {
    parking:                  { type: Number, enum: [0, 1, 2, 3], default: 0 },
    powerBackup:              { type: Boolean, default: false },
    security24x7:             { type: Boolean, default: false },
    separateElectricityMeter: { type: Boolean, default: false },
    waterSupply:              { type: String, enum: ["municipal", "borewell", "both", "none"], default: "none" },
    highSpeedWifi:            { type: Boolean, default: false },
    gymnasium:                { type: Boolean, default: false },
    swimmingPool:             { type: Boolean, default: false },
    clubHouse:                { type: Boolean, default: false },
    airConditioning:          { type: Boolean, default: false },
    acCount:                  { type: Number, default: 0, min: 0 },
    furnishingStatus:         { type: String, enum: ["unfurnished", "semi-furnished", "fully-furnished"], default: "unfurnished" },
    bedsCount:                { type: Number, default: 0, min: 0 },
    almirah:                  { type: Boolean, default: false },
    storage:                  { type: Boolean, default: false },
    securityDeposit:          { type: Number, default: 0, min: 0 },
    distanceFromLocation:     { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const PropertySchema = new Schema<IProperty>(
  {
    title:       { type: String, required: true, trim: true },
    type:        { type: String, enum: ["apartment", "villa", "plot", "commercial", "penthouse"], required: true },
    listingType: { type: String, enum: ["sale", "rent"], required: true },
    price:       { type: Number, required: true, min: 0 },
    area:        { type: Number, required: true, min: 0 },
    bedrooms:    { type: Number, default: 1, min: 0 },
    bathrooms:   { type: Number, default: 1, min: 0 },
    location:    { type: String, required: true, trim: true },
    city:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    images:      [{ type: String }],
    status:      { type: String, enum: ["active", "pending", "sold", "rented", "draft"], default: "draft" },
    views:       { type: Number, default: 0 },
    inquiries:   { type: Number, default: 0 },
    ownerId:     { type: String, required: true },
    amenities:   { type: AmenitiesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

PropertySchema.index({ ownerId: 1 });
PropertySchema.index({ city: 1 });
PropertySchema.index({ status: 1 });
PropertySchema.index({ listingType: 1 });

export const PropertyModel = model<IProperty>("Property", PropertySchema);
