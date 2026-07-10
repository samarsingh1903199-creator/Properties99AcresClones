export type DescriptionStyle =
  | "professional"
  | "luxury"
  | "family"
  | "investment"
  | "student"
  | "commercial"
  | "premium";

export type DescriptionLength = "short" | "medium" | "long";

export interface GenerateDescriptionInput {
  listingType: string;
  propertyType?: string;
  title: string;
  city: string;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number | string;
  furnishing?: string;
  parking?: number;
  price?: number | string;
  amenities?: string[];
  style?: DescriptionStyle;
  length?: DescriptionLength;
  /** Pass true to request a different wording on regenerate */
  regenerate?: boolean;
}

export interface GenerateDescriptionResult {
  description: string;
  model: string;
  wordCount: number;
}
