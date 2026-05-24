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

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/* ── Auth ── */
export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; token: string; user: ApiUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    name: string; email: string; password: string; role: string;
    phone?: string; company?: string; licenseNumber?: string;
  }) =>
    request<{ success: boolean; token: string; user: ApiUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: (token: string) =>
    request<{ success: boolean; user: ApiUser }>("/api/auth/me", {
      headers: authHeader(token),
    }),

  updateMe: (token: string, data: Partial<ApiUser>) =>
    request<{ success: boolean; user: ApiUser }>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: authHeader(token),
    }),
};

/* ── Properties ── */
export const propertiesApi = {
  create: (token: string, data: {
    title: string; type: string; listingType: string;
    price: number; area: number; bedrooms: number; bathrooms: number;
    location: string; city: string; description: string;
    images: string[]; status: string;
    amenities?: Partial<ApiPropertyAmenities>;
  }) =>
    request<{ success: boolean; data: ApiProperty }>("/api/properties", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    }),

  list: (token: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ success: boolean; count: number; data: ApiProperty[] }>(`/api/properties${qs}`, {
      headers: authHeader(token),
    });
  },

  get: (token: string, id: string) =>
    request<{ success: boolean; data: ApiProperty }>(`/api/properties/${id}`, {
      headers: authHeader(token),
    }),

  update: (token: string, id: string, data: Partial<{
    title: string; type: string; listingType: string;
    price: number; area: number; bedrooms: number; bathrooms: number;
    location: string; city: string; description: string;
    images: string[]; status: string;
    amenities: Partial<ApiPropertyAmenities>;
  }>) =>
    request<{ success: boolean; data: ApiProperty }>(`/api/properties/${id}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(data),
    }),

  delete: (token: string, id: string) =>
    request<{ success: boolean; message: string }>(`/api/properties/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    }),

  getAmenities: (token: string, id: string) =>
    request<{ success: boolean; propertyId: string; data: ApiPropertyAmenities }>(`/api/properties/${id}/amenities`, {
      headers: authHeader(token),
    }),

  updateAmenities: (token: string, id: string, data: Partial<ApiPropertyAmenities>) =>
    request<{ success: boolean; propertyId: string; data: ApiPropertyAmenities }>(`/api/properties/${id}/amenities`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(data),
    }),
};

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

export interface ApiProperty {
  _id: string;
  title: string;
  type: string;
  listingType: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  city: string;
  description: string;
  images: string[];
  status: string;
  views: number;
  inquiries: number;
  ownerId: string;
  amenities: ApiPropertyAmenities;
  createdAt: string;
  updatedAt: string;
}

/* ── Upload ── */
export const uploadApi = {
  uploadFiles: async (token: string, files: File[]): Promise<{ success: boolean; data: UploadedMedia[] }> => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers: authHeader(token),
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Upload failed");
    return data;
  },

  deleteFile: (token: string, publicId: string, resourceType?: string) =>
    request<{ success: boolean; data: unknown }>("/api/upload", {
      method: "DELETE",
      headers: authHeader(token),
      body: JSON.stringify({ publicId, resourceType }),
    }),
};

export interface UploadedMedia {
  url: string;
  publicId: string;
  resourceType: string;
  width?: number;
  height?: number;
  bytes: number;
  format: string;
}

/* ── Views ── */
export interface ApiPropertyView {
  _id: string;
  propertyId: string;
  propertyTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  source: "view" | "book";
  viewedAt: string;
}

export const viewsApi = {
  getPropertyViews: (token: string, propertyId: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{
      success: boolean;
      property: { id: string; title: string; views: number; inquiries: number };
      summary: { totalViews: number; bookClicks: number; uniqueVisitors: number };
      pagination: { total: number; page: number; limit: number; pages: number };
      data: ApiPropertyView[];
    }>(`/api/properties/${propertyId}/views${qs}`, { headers: authHeader(token) });
  },
};

/* ── Analytics ── */
export interface ApiAnalytics {
  summary: {
    totalProperties: number;
    activeListings: number;
    totalViews: number;
    totalInquiries: number;
    portfolioValue: number;
  };
  byStatus: Record<string, number>;
  byListing: Record<string, number>;
  topProperties: { _id: string; title: string; views: number; inquiries: number }[];
  inquiryBreakdown: Record<string, number>;
}

export const analyticsApi = {
  get: (token: string) =>
    request<{ success: boolean; data: ApiAnalytics }>("/api/analytics", {
      headers: authHeader(token),
    }),
};

/* ── Inquiries ── */
export interface ApiInquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyTitle: string;
  message: string;
  status: "new" | "responded" | "closed";
  createdAt: string;
  ownerId: string;
}

export const inquiriesApi = {
  list: (token: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ success: boolean; count: number; data: ApiInquiry[] }>(`/api/inquiries${qs}`, {
      headers: authHeader(token),
    });
  },

  updateStatus: (token: string, id: string, status: ApiInquiry["status"]) =>
    request<{ success: boolean; data: ApiInquiry }>(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({ status }),
    }),
};

/* ── Shared API user shape returned by the backend ── */
export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  role: "visitor" | "dealer" | "admin";
  phone?: string;
  company?: string;
  licenseNumber?: string;
  verified: boolean;
  createdAt: string;
}
