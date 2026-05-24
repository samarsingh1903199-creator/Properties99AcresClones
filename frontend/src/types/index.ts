export interface Specialist {
  id: string;
  name: string;
  company: string;
  role: string;
  avatar: string;
  coverImage: string;
  verified: boolean;
  specialization: string[];
  experience: number;
  totalProperties: number;
  dealsClosed: number;
  rating: number;
  reviewCount: number;
  responseTime: string;
  availability: 'online' | 'offline' | 'busy';
  languages: string[];
  location: string;
  bio: string;
  phone: string;
  email: string;
  whatsapp: string;
}

export interface Project {
  id: string;
  name: string;
  builderName: string;
  builderLogo: string;
  type: 'residential' | 'commercial' | 'township';
  status: 'upcoming' | 'under-construction' | 'ready-to-move' | 'newly-launched';
  possessionDate: string;
  priceStarting: number;
  location: string;
  size: string; // e.g., "12 Acres"
  towers: number;
  units: number;
  reraApproved: boolean;
  luxury: boolean;
  completionPercentage: number;
  coverImage: string;
  gallery: string[];
  description: string;
  videoUrl?: string;
  amenities: string[];
  nearbyLandmarks: { name: string; distance: string }[];
  floorPlans: { type: string; area: string; price: number; image: string }[];
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  status: string;
  listingType?: 'buy' | 'rent';
  features: string[];
  yearBuilt?: number;
  agentId: string;
  videoUrl?: string;
  previewVideoUrl?: string;
  verified?: boolean;
  propertyId?: string;
  postedDate?: string;
  availability?: string;
  ownershipType?: string;
  tenantTypes?: string[];
  distanceKm?: number;
  rating?: number;
  totalViews?: number;
  totalSaves?: number;
  rent?: number;
  deposit?: number;
  maintenance?: number;
  bookingAmount?: number;
  pricePerSqft?: number;
  highlights?: string[];
  constructionDetails?: string;
  facing?: string;
  floorDetails?: string;
  furnishingStatus?: string;
  possessionStatus?: string;
  brokerage?: number;
  carpetArea?: number;
  balconies?: number;
  parking?: string;
  waterSupply?: string;
  electricityBackup?: string;
  internet?: string;
  address?: string;
  includedItems?: string[];
  amenities?: string[];
  nearbyPlaces?: { name: string; distance: string; travelTime: string; type: string }[];
  floorPlans?: { title: string; image: string; type: string }[];
  reviews?: { id: string; user: string; avatar: string; rating: number; comment: string; date: string }[];
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  rating: number;
  experience: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'agent' | 'admin';
}
