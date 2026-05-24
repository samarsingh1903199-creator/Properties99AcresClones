import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { ProjectCard } from "@/src/components/projects/ProjectCard";
import { Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { propertiesApi, ApiProperty } from "@/src/services/api";
import { Project } from "@/src/types";

function mapToProject(p: ApiProperty): Project {
  return {
    id: p._id,
    name: p.title,
    builderName: "Private Listing",
    builderLogo: `https://api.dicebear.com/7.x/identicon/svg?seed=${p.ownerId}`,
    type: p.type === "commercial" ? "commercial" : "residential",
    status: "newly-launched",
    possessionDate: new Date(p.createdAt).getFullYear().toString(),
    priceStarting: p.price,
    location: [p.location, p.city].filter(Boolean).join(", "),
    size: p.area ? `${p.area} sqft` : "N/A",
    towers: 1,
    units: 1,
    reraApproved: false,
    luxury: p.price > 5000000,
    completionPercentage: p.status === "available" ? 100 : 50,
    coverImage: p.images[0] ?? "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
    gallery: p.images.length > 0
      ? p.images
      : ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80"],
    description: p.description,
    amenities: [],
    nearbyLandmarks: [],
    floorPlans: [],
  };
}

type ListingFilter = "all" | "rent" | "sale";
type SortOption = "newest" | "price-asc" | "price-desc";

const LISTING_FILTERS: { id: ListingFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "rent", label: "For Rent" },
  { id: "sale", label: "For Sale" },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "newest", label: "Newest First" },
  { id: "price-asc", label: "Price: Low → High" },
  { id: "price-desc", label: "Price: High → Low" },
];

export const ProjectsListing = () => {
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listingFilter, setListingFilter] = useState<ListingFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    propertiesApi
      .listPublic()
      .then((res) => setProperties(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...properties];

    if (listingFilter !== "all") {
      list = list.filter((p) => p.listingType === listingFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else {
      list.sort((a, b) => b.price - a.price);
    }

    return list.map(mapToProject);
  }, [properties, listingFilter, sortBy, search]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Filters Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b border-[var(--glass-border)] pb-8">
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
            {LISTING_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setListingFilter(f.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap",
                  listingFilter === f.id
                    ? "bg-luxury-purple text-white border-luxury-purple shadow-premium"
                    : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-main)]/40 hover:border-luxury-purple/30"
                )}
              >
                {f.label}
              </button>
            ))}

            <div className="w-px h-5 bg-[var(--glass-border)] mx-1 shrink-0" />

            {SORT_OPTIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => setSortBy(o.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap",
                  sortBy === o.id
                    ? "bg-luxury-purple text-white border-luxury-purple shadow-premium"
                    : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-main)]/40 hover:border-luxury-purple/30"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-main)]/30 group-focus-within:text-luxury-purple transition-colors" />
              <input
                type="text"
                placeholder="Search by title or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl py-2.5 pl-11 pr-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-luxury-purple/30 transition-all"
              />
            </div>
            <Button variant="outline" className="rounded-2xl h-11 w-11 p-0">
              <Filter size={18} />
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-8 h-8 animate-spin text-luxury-purple" />
          </div>
        ) : error ? (
          <div className="text-center py-40 text-[var(--text-main)]/40">
            <p className="text-sm font-bold">Failed to load properties: {error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-40 text-[var(--text-main)]/40"
          >
            <p className="text-sm font-bold uppercase tracking-widest">No properties found</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-10">
            {filtered.map((project, idx) => (
              <ProjectCard key={project.id} project={project} index={idx} />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-3 p-2 pl-6 pr-2 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <span className="text-xs font-bold text-[var(--text-main)]/40 uppercase tracking-widest">
                Showing {filtered.length}{" "}
                {filtered.length === 1 ? "property" : "properties"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
