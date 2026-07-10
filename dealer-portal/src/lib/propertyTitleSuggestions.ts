export interface TitleSuggestionInput {
  listingType: string;
  listingCategoryName?: string;
  bedrooms: string | number;
  propertyTypeSlug: string;
  propertyTypeName?: string;
}

function listingSuffix(listingType: string, listingCategoryName?: string): string {
  const slug = listingType.toLowerCase();
  if (slug === "lease") return "for Lease";
  if (slug === "sale" || slug === "buy") return "for Sale";
  if (slug === "rent") return "for Rent";

  const name = (listingCategoryName ?? "").toLowerCase();
  if (name.includes("lease")) return "for Lease";
  if (name.includes("sale")) return "for Sale";
  return "for Rent";
}

function bedroomLabels(bedrooms: number): string[] {
  if (bedrooms <= 0) return ["1 RK"];
  if (bedrooms === 1) return ["1 BHK", "1 RK"];
  if (bedrooms >= 5) return [`${bedrooms} BHK`, "5+ BHK"];
  return [`${bedrooms} BHK`];
}

/** Property-type phrases used in Indian listing titles */
function propertyTypePhrases(slug: string, categoryName?: string): string[] {
  const key = slug.toLowerCase();
  const map: Record<string, string[]> = {
    apartments:    ["Flat", "Apartment", "Independent Flat"],
    apartment:     ["Flat", "Apartment", "Independent Flat"],
    villas:        ["Villa", "Independent Villa"],
    villa:         ["Villa", "Independent Villa"],
    "luxury-homes":["Luxury Home", "Independent Kothi", "Kothi"],
    independent:   ["Independent House", "Independent Kothi", "Kothi"],
    commercial:    ["Commercial Space", "Showroom", "Office Space"],
    plots:         ["Plot", "Residential Plot"],
    plot:          ["Plot", "Residential Plot"],
    penthouse:     ["Penthouse", "Luxury Penthouse"],
    "co-living":   ["PG Room", "Co-Living Space", "PG Accommodation"],
    pg:            ["PG Room", "Co-Living Space"],
    projects:      ["New Project", "Under-Construction Project"],
    warehouse:     ["Warehouse", "Industrial Space"],
    showroom:      ["Showroom", "Commercial Showroom"],
  };

  if (map[key]?.length) return map[key];

  const name = categoryName?.trim();
  if (name) return [name, `Independent ${name}`];
  return ["Property"];
}

function usesBhkInTitle(slug: string): boolean {
  const key = slug.toLowerCase();
  return !["plots", "plot", "commercial", "projects", "warehouse", "showroom"].includes(key);
}

function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Build clickable title suggestions from current form selections */
export function generatePropertyTitleSuggestions(input: TitleSuggestionInput): string[] {
  const beds = Number(input.bedrooms) || 0;
  const suffix = listingSuffix(input.listingType, input.listingCategoryName);
  const typePhrases = propertyTypePhrases(input.propertyTypeSlug, input.propertyTypeName);
  const bhkParts = bedroomLabels(beds);
  const includeBhk = usesBhkInTitle(input.propertyTypeSlug);
  const out: string[] = [];

  if (includeBhk) {
    for (const bhk of bhkParts) {
      for (const typePhrase of typePhrases.slice(0, 3)) {
        out.push(`${bhk} ${typePhrase} ${suffix}`);
      }
      out.push(`${bhk} ${suffix}`);
    }
  } else {
    for (const typePhrase of typePhrases) {
      out.push(`${typePhrase} ${suffix}`);
    }
  }

  // Extra sale-specific phrases
  if (input.listingType === "sale" || input.listingType === "buy") {
    if (typePhrases.some(t => /kothi|villa|independent/i.test(t))) {
      out.push(`${beds > 0 ? `${beds} BHK ` : ""}Independent Kothi for Sale`.replace(/\s+/g, " ").trim());
    }
  }

  // Lease / commercial combo
  if (input.listingType === "lease") {
    out.push(`${typePhrases[0]} for Lease`);
    if (includeBhk && beds > 0) {
      out.push(`${beds} BHK ${typePhrases[0]} for Lease`);
    }
  }

  return dedupe(out).slice(0, 8);
}
