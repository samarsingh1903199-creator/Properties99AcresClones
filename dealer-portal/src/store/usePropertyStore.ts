import { create } from "zustand";

export type PropertyStatus = "active" | "pending" | "sold" | "rented" | "draft";
export type PropertyType = "apartment" | "villa" | "plot" | "commercial" | "penthouse";
export type ListingType = "sale" | "rent";

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

const SAMPLE_PROPERTIES: Property[] = [
  {
    id: "1",
    title: "Luxury Sea-View Penthouse",
    type: "penthouse",
    listingType: "sale",
    price: 12500000,
    area: 4200,
    bedrooms: 5,
    bathrooms: 6,
    location: "Marine Drive, Mumbai",
    city: "Mumbai",
    description: "Exquisite penthouse with panoramic sea views.",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    ],
    status: "active",
    views: 342,
    inquiries: 18,
    createdAt: "2026-05-01",
    ownerId: "user-1",
  },
  {
    id: "2",
    title: "Modern Villa with Pool",
    type: "villa",
    listingType: "sale",
    price: 8750000,
    area: 5800,
    bedrooms: 6,
    bathrooms: 7,
    location: "Golf Course Road, Gurugram",
    city: "Gurugram",
    description: "Sprawling villa with private pool and landscaped garden.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    ],
    status: "active",
    views: 210,
    inquiries: 11,
    createdAt: "2026-05-05",
    ownerId: "user-1",
  },
  {
    id: "3",
    title: "Executive 3BHK Apartment",
    type: "apartment",
    listingType: "rent",
    price: 85000,
    area: 1850,
    bedrooms: 3,
    bathrooms: 3,
    location: "Bandra West, Mumbai",
    city: "Mumbai",
    description: "Well-furnished premium apartment in prime location.",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    ],
    status: "pending",
    views: 98,
    inquiries: 5,
    createdAt: "2026-05-10",
    ownerId: "user-1",
  },
  {
    id: "4",
    title: "Heritage Bungalow Estate",
    type: "villa",
    listingType: "sale",
    price: 22000000,
    area: 8500,
    bedrooms: 8,
    bathrooms: 9,
    location: "Vasant Vihar, New Delhi",
    city: "New Delhi",
    description: "Heritage property with colonial architecture and lush gardens.",
    images: [
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
    ],
    status: "draft",
    views: 0,
    inquiries: 0,
    createdAt: "2026-05-14",
    ownerId: "user-1",
  },
];

interface PropertyState {
  properties: Property[];
  addProperty: (p: Omit<Property, "id" | "views" | "inquiries" | "createdAt">) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
}

export const usePropertyStore = create<PropertyState>()((set) => ({
  properties: SAMPLE_PROPERTIES,
  addProperty: (p) =>
    set((state) => ({
      properties: [
        ...state.properties,
        {
          ...p,
          id: Date.now().toString(),
          views: 0,
          inquiries: 0,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ],
    })),
  updateProperty: (id, updates) =>
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  deleteProperty: (id) =>
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
    })),
}));
