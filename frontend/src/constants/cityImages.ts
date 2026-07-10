const UNSPLASH_BASE = "https://images.unsplash.com";

/** Crop-friendly Unsplash URL for city card thumbnails (800×320). */
export function cityImageUrl(photoId: string, width = 800, height = 320) {
  return `${UNSPLASH_BASE}/${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

export type PopularCity = {
  name: string;
  tagline: string;
  count: string;
  image: string;
  fallbackImage?: string;
};

/** Landmark photos verified on Unsplash — Gateway, UB City, India Gate, Charminar, etc. */
export const POPULAR_CITIES: PopularCity[] = [
  {
    name: "Mumbai",
    tagline: "Sea-facing & metro hubs",
    count: "480+",
    image: cityImageUrl("photo-1768728584556-e97f86b51417"),
    fallbackImage: cityImageUrl("photo-1680344427682-ccb4e98a4d0b"),
  },
  {
    name: "Bangalore",
    tagline: "Tech corridors & villas",
    count: "620+",
    image: cityImageUrl("photo-1741769417908-671a21a28780"),
  },
  {
    name: "Delhi NCR",
    tagline: "Premium apartments",
    count: "390+",
    image: cityImageUrl("photo-1743136648410-a73d5c9dbaab"),
    fallbackImage: cityImageUrl("photo-1741811259466-7620450f0e54"),
  },
  {
    name: "Hyderabad",
    tagline: "Gated communities",
    count: "310+",
    image: cityImageUrl("photo-1750834115164-8c2658f18dd0"),
  },
  {
    name: "Pune",
    tagline: "Family homes & IT parks",
    count: "275+",
    image: cityImageUrl("photo-1652144570437-37207890d993"),
  },
  {
    name: "Chennai",
    tagline: "Coastal living",
    count: "220+",
    image: cityImageUrl("photo-1715795470324-e567de812ef3"),
    fallbackImage: cityImageUrl("photo-1583428379391-e2954509f6ce"),
  },
];
