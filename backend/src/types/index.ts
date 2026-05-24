export type PropertyStatus      = "active" | "pending" | "sold" | "rented" | "draft";
export type PropertyType        = "apartment" | "villa" | "plot" | "commercial" | "penthouse";
export type ListingType         = "sale" | "rent";
export type UserRole            = "visitor" | "dealer" | "admin";
export type InquiryStatus       = "new" | "responded" | "closed";
export type VisitType           = "physical" | "video";
export type VisitEnquiryStatus  = "pending" | "confirmed" | "completed" | "cancelled";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  company?: string;
  licenseNumber?: string;
  verified: boolean;
  createdAt: string;
}

export interface Property {
  id: string;
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
  createdAt: string;
  ownerId: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyId: string;
  propertyTitle: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  ownerId: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}
