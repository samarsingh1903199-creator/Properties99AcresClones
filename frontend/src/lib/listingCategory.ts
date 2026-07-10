import type { ApiCategory, ApiProperty } from "@/src/services/api";
import type { Property } from "@/src/types";

export type NormalizedListingType = "buy" | "rent" | "lease";

export const ALL_CATEGORY_SLUG = "all";

export type ListingFilterKind = "rent" | "sale" | "lease" | "generic";

/** Slug → normalized listing types when API matchValues are missing */
const SLUG_FALLBACK_MATCH: Record<string, string[]> = {
  rent: ["rent"],
  sale: ["buy", "sale"],
  lease: ["lease"],
};

/** Map API listingType to the value used in filters & category matchValues */
export function normalizeListingType(raw?: string): NormalizedListingType {
  if (raw === "sale" || raw === "buy") return "buy";
  if (raw === "lease") return "lease";
  return "rent";
}

/** Effective match values for a listing category tab */
export function resolveMatchValues(category: ApiCategory | undefined, tabSlug: string): string[] {
  const fromApi = category?.matchValues?.filter(Boolean) ?? [];
  if (fromApi.length > 0) return fromApi;
  return SLUG_FALLBACK_MATCH[tabSlug] ?? [tabSlug];
}

/** Which smart-filter sidebar to show for a tab */
export function getListingFilterKind(tabSlug: string, categories: ApiCategory[]): ListingFilterKind {
  if (tabSlug === ALL_CATEGORY_SLUG) return "generic";

  const category = categories.find(c => c.slug === tabSlug);
  const values = new Set(resolveMatchValues(category, tabSlug).map(normalizeListingType));

  if (values.has("buy")) return "sale";
  if (values.has("rent") && !values.has("lease")) return "rent";
  if (values.has("lease") && values.size === 1) return "lease";
  if (values.has("rent")) return "rent";
  return "generic";
}

/** Whether a property belongs to the selected listing tab */
export function propertyMatchesListingTab(
  propertyListingType: string | undefined,
  tabSlug: string,
  categories: ApiCategory[],
): boolean {
  if (tabSlug === ALL_CATEGORY_SLUG) return true;

  const category = categories.find(c => c.slug === tabSlug);
  const matchValues = resolveMatchValues(category, tabSlug);
  const normalized = normalizeListingType(propertyListingType);

  return matchValues.some(v => {
    const nv = normalizeListingType(v);
    return v === propertyListingType || v === normalized || nv === normalized;
  });
}

/** Count properties per listing tab slug */
export function countPropertiesByTab(
  properties: Property[],
  categories: ApiCategory[],
): Record<string, number> {
  const counts: Record<string, number> = { [ALL_CATEGORY_SLUG]: properties.length };

  for (const cat of categories) {
    counts[cat.slug] = properties.filter(p =>
      propertyMatchesListingTab(p.listingType, cat.slug, categories),
    ).length;
  }

  return counts;
}

/** Shared API → UI property mapper */
export function mapApiProperty(p: ApiProperty): Property {
  const location = p.address
    ? [p.address.locality, p.address.city || p.city].filter(Boolean).join(", ") || `${p.location}, ${p.city}`
    : [p.location, p.city].filter(Boolean).join(", ");

  const listingType = normalizeListingType(p.listingType);

  return {
    id:          p._id,
    title:       p.title,
    description: p.description,
    price:       p.price,
    rent:        listingType === "rent" ? p.price : undefined,
    location,
    images:      p.images.length ? p.images : ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80"],
    beds:        p.bedrooms,
    baths:       p.bathrooms,
    sqft:        p.area,
    type:        p.type,
    status:      p.status,
    listingType,
    features:    [],
    agentId:     p.ownerId,
    totalViews:  p.views,
    verified:    true,
    tenantTypes: p.amenities?.preferred_tenants ?? [],
    distanceKm:  p.amenities?.distanceFromLocation,
    address:     p.address,
  };
}
