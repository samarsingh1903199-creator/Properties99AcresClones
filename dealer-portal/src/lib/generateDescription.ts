import type { AmenitiesFormData } from "../components/properties/AmenitiesFormSection";

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
  regenerate?: boolean;
}

export function amenityLabelsFromForm(data?: Partial<AmenitiesFormData>): string[] {
  if (!data) return [];
  const labels: string[] = [];
  if (data.parking && data.parking > 0) {
    labels.push(data.parking === 1 ? "1 Parking" : `${data.parking} Parking Spots`);
  }
  if (data.powerBackup) labels.push("Power Backup");
  if (data.security24x7) labels.push("24/7 Security");
  if (data.highSpeedWifi) labels.push("High-Speed WiFi");
  if (data.gymnasium) labels.push("Gym");
  if (data.swimmingPool) labels.push("Swimming Pool");
  if (data.clubHouse) labels.push("Club House");
  if (data.airConditioning) labels.push("Air Conditioning");
  if (data.separateElectricityMeter) labels.push("Separate Electricity Meter");
  if (data.almirah) labels.push("Almirah");
  if (data.storage) labels.push("Storage");
  if (data.waterSupply && data.waterSupply !== "none") {
    labels.push(data.waterSupply === "municipal" ? "Municipal Water" : data.waterSupply === "borewell" ? "Borewell Water" : "Dual Water Supply");
  }
  return labels;
}

export function buildGenerateDescriptionInput(opts: {
  listingType: string;
  propertyTypeSlug: string;
  propertyTypeName?: string;
  title: string;
  city: string;
  locality?: string;
  street?: string;
  bedrooms?: string | number;
  bathrooms?: string | number;
  area?: string | number;
  price?: string | number;
  amenities?: Partial<AmenitiesFormData>;
  existingDescription?: string;
}): GenerateDescriptionInput {
  const location = [opts.locality, opts.street].filter(Boolean).join(", ") || undefined;

  return {
    listingType: opts.listingType,
    propertyType: opts.propertyTypeName ?? opts.propertyTypeSlug,
    title: opts.title.trim(),
    city: opts.city.trim(),
    location,
    bedrooms: opts.bedrooms !== undefined && opts.bedrooms !== "" ? Number(opts.bedrooms) : undefined,
    bathrooms: opts.bathrooms !== undefined && opts.bathrooms !== "" ? Number(opts.bathrooms) : undefined,
    area: opts.area !== undefined && opts.area !== "" ? Number(opts.area) || opts.area : undefined,
    price: opts.price !== undefined && opts.price !== "" ? Number(opts.price) || opts.price : undefined,
    furnishing: opts.amenities?.furnishingStatus,
    parking: opts.amenities?.parking,
    amenities: amenityLabelsFromForm(opts.amenities),
    regenerate: Boolean(opts.existingDescription?.trim()),
  };
}
