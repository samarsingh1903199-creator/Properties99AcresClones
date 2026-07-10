import type { Specialist } from "@/src/types";
import type { ApiPublicDealer } from "@/src/services/api";

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
];

function dealerAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=166534&color=fff&size=256&bold=true`;
}

function yearsSince(iso?: string): number {
  if (!iso) return 1;
  const years = Math.floor((Date.now() - new Date(iso).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return Math.max(1, years);
}

export function mapDealerToSpecialist(dealer: ApiPublicDealer, index = 0): Specialist {
  const location = dealer.cities.length
    ? dealer.cities.slice(0, 2).join(", ")
    : "India";

  return {
    id: dealer._id,
    name: dealer.name,
    company: dealer.company || "Independent Dealer",
    role: "Property Dealer",
    avatar: dealerAvatar(dealer.name),
    coverImage: COVER_IMAGES[index % COVER_IMAGES.length],
    verified: dealer.verified,
    specialization: dealer.totalProperties > 0
      ? ["Residential", "Verified Listings"]
      : ["Property Dealer"],
    experience: yearsSince(dealer.memberSince),
    totalProperties: dealer.totalProperties,
    dealsClosed: dealer.totalInquiries,
    rating: dealer.verified ? 4.8 : 4.5,
    reviewCount: Math.max(dealer.totalInquiries, 0),
    responseTime: "< 24 hours",
    availability: dealer.verified ? "online" : "offline",
    languages: ["English", "Hindi"],
    location,
    bio: dealer.company
      ? `${dealer.name} is a verified property dealer with ${dealer.company}, listing homes across ${location}.`
      : `${dealer.name} is a property dealer helping clients find rent, sale, and lease listings across ${location}.`,
    phone: dealer.phone || "—",
    email: "",
    whatsapp: dealer.phone || "",
  };
}
