const BASE_URL = "http://localhost:3002";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers: optHeaders, ...restOptions } = options;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...optHeaders },
    ...restOptions,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data as T;
}

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  role: "visitor" | "dealer" | "admin";
  phone?: string;
  verified: boolean;
  createdAt: string;
}

export interface ApiPropertyAmenities {
  parking: 0 | 1 | 2 | 3;
  powerBackup: boolean;
  security24x7: boolean;
  separateElectricityMeter: boolean;
  waterSupply: "municipal" | "borewell" | "both" | "none";
  highSpeedWifi: boolean;
  gymnasium: boolean;
  swimmingPool: boolean;
  clubHouse: boolean;
  airConditioning: boolean;
  acCount: number;
  furnishingStatus: "unfurnished" | "semi-furnished" | "fully-furnished";
  bedsCount: number;
  almirah: boolean;
  storage: boolean;
  securityDeposit: number;
  distanceFromLocation: number;
  preferred_tenants: string[];
}

export interface IAddress {
  country?: string;
  state?: string;
  city?: string;
  locality?: string;
  street?: string;
  landmark?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
}

export interface ApiSaleDetails {
  pricePerSqft?: number;
  bookingAmount?: number;
  maintenanceCharges?: number;
  negotiable?: boolean;
  loanAvailable?: boolean;
  ownershipType?: "freehold" | "leasehold" | "builder-owned" | "resale";
  propertyAge?: number;
  possessionStatus?: "ready-to-move" | "under-construction";
  possessionDate?: string;
  floorNumber?: string;
  totalFloors?: number;
  facing?: string;
  vastuCompliant?: boolean;
  carpetArea?: number;
  builtUpArea?: number;
  superBuiltUpArea?: number;
  reraNumber?: string;
  registryStatus?: "clear" | "pending" | "disputed";
  legalApprovals?: "approved" | "pending" | "disputed";
}

export interface ApiProperty {
  _id: string;
  title: string;
  type: string;
  listingType: "sale" | "rent" | "lease";
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  city: string;
  address?: IAddress;
  description: string;
  images: string[];
  status: string;
  views: number;
  inquiries: number;
  ownerId: string;
  isHighlighted?: boolean;
  highlightedAt?: string;
  amenities?: ApiPropertyAmenities;
  saleDetails?: ApiSaleDetails;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiCategory {
  _id: string;
  name: string;
  slug: string;
  categoryType: "listing" | "property";
  icon: string;
  order: number;
  isActive: boolean;
  matchValues: string[];
  createdAt: string;
}

export interface ApiPublicDealer {
  _id: string;
  name: string;
  company: string;
  phone: string;
  licenseNumber: string;
  verified: boolean;
  memberSince: string;
  totalProperties: number;
  totalInquiries: number;
  cities: string[];
}

export const dealersApi = {
  listPublic: (params?: { search?: string }) => {
    const qs = params?.search ? `?${new URLSearchParams({ search: params.search }).toString()}` : "";
    return request<{ success: boolean; count: number; data: ApiPublicDealer[] }>(`/api/public/dealers${qs}`);
  },

  getPublic: (id: string) =>
    request<{ success: boolean; data: ApiPublicDealer }>(`/api/public/dealers/${id}`),
};

export const propertiesApi = {
  listPublic: (params?: Record<string, string>) => {
    const qs = params && Object.keys(params).length ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ success: boolean; count: number; data: ApiProperty[] }>(`/api/public/properties${qs}`);
  },

  listHighlighted: (params?: { limit?: number }) => {
    const qs = params?.limit ? `?limit=${params.limit}` : "";
    return request<{ success: boolean; count: number; data: ApiProperty[] }>(`/api/public/properties/highlighted${qs}`);
  },

  getPublic: (id: string) =>
    request<{ success: boolean; data: ApiProperty }>(`/api/public/properties/${id}`),

  recordView: (propertyId: string, payload: {
    userId?: string; userName?: string; userEmail?: string; userPhone?: string;
    source?: "view" | "book";
  }) =>
    request<{ success: boolean; views: number }>(`/api/public/properties/${propertyId}/view`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const categoriesApi = {
  list: (type?: "listing" | "property") => {
    const qs = type ? `?type=${type}` : "";
    return request<{ success: boolean; count: number; data: ApiCategory[] }>(`/api/categories${qs}`);
  },
};

export interface ApiVisitEnquiry {
  _id: string;
  propertyId: string;
  propertyTitle: string;
  ownerId: string;
  name: string;
  email: string;
  phone: string;
  visitType: "physical" | "video";
  visitDate: string;
  visitTime: string;
  message: string;
  guestCount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitEnquiryPayload {
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  visitType: "physical" | "video";
  visitDate: string;
  visitTime: string;
  message?: string;
  guestCount?: number;
  userId?: string;
}

export const visitEnquiriesApi = {
  create: (data: CreateVisitEnquiryPayload) =>
    request<{ success: boolean; data: ApiVisitEnquiry }>("/api/visit-enquiries", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: (
    token: string,
    params?: Partial<Record<"status" | "propertyId" | "visitType" | "date" | "search" | "page" | "limit", string>>
  ) => {
    const qs = params && Object.keys(params).filter(k => (params as Record<string, string>)[k]).length
      ? "?" + new URLSearchParams(
          Object.fromEntries(Object.entries(params as Record<string, string>).filter(([, v]) => v))
        ).toString()
      : "";
    return request<{ success: boolean; total: number; page: number; pages: number; count: number; data: ApiVisitEnquiry[]; statusCounts?: Record<string, number> }>(
      `/api/visit-enquiries${qs}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  updateStatus: (id: string, status: ApiVisitEnquiry["status"], token: string) =>
    request<{ success: boolean; data: ApiVisitEnquiry }>(`/api/visit-enquiries/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    }),
};

export interface CreateInquiryPayload {
  name: string;
  phone: string;
  email: string;
  propertyId: string;
  message?: string;
}

export interface ApiInquiry {
  _id: string;
  name: string;
  phone: string;
  email: string;
  propertyId: string;
  propertyTitle: string;
  message: string;
  status: string;
  ownerId: string;
  createdAt: string;
}

export const inquiriesApi = {
  create: (data: CreateInquiryPayload) =>
    request<{ success: boolean; data: ApiInquiry }>("/api/inquiries", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const likedApi = {
  getIds: (token: string) =>
    request<{ success: boolean; data: string[] }>("/api/liked", {
      headers: authHeader(token),
    }),

  toggle: (propertyId: string, token: string) =>
    request<{ success: boolean; liked: boolean; data: string[] }>(`/api/liked/${propertyId}`, {
      method: "POST",
      headers: authHeader(token),
    }),

  getProperties: (token: string) =>
    request<{ success: boolean; count: number; data: ApiProperty[] }>("/api/liked/properties", {
      headers: authHeader(token),
    }),
};

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    request<{ success: boolean; token: string; user: ApiUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...data, role: "visitor" }),
    }),

  login: (email: string, password: string) =>
    request<{ success: boolean; token: string; user: ApiUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMe: (token: string) =>
    request<{ success: boolean; user: ApiUser }>("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
