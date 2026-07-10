import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, X, Check, ChevronDown,
  Home, Building2, Bed, IndianRupee, Layers, RotateCcw,
  ArrowUpDown, MapPin, Tag, Users, Loader2,
} from "lucide-react";
import { PropertyCard } from "@/src/components/ui/PropertyCard";
import { cn, formatCurrency } from "@/src/lib/utils";
import { propertiesApi, categoriesApi, ApiProperty, type ApiCategory } from "@/src/services/api";
import { Property } from "@/src/types";
import {
  mapApiProperty,
  propertyMatchesListingTab,
  getListingFilterKind,
} from "@/src/lib/listingCategory";
import { useListingCategories } from "@/src/hooks/useListingCategories";

/* ─── Filter Types ───────────────────────────────────────────────── */
interface Filters {
  listingType: string;
  minPrice: number;
  maxPrice: number;
  types: string[];
  bedrooms: string;
  furnishing: string[];
}

const MAX_PRICE = 200_000_000;

const DEFAULT_FILTERS: Filters = {
  listingType: "all",
  minPrice: 0,
  maxPrice: MAX_PRICE,
  types: [],
  bedrooms: "any",
  furnishing: [],
};


// IDs match backend amenities.furnishingStatus values exactly
const FURNISHING_OPTS = [
  { id: "fully-furnished", label: "Fully Furnished" },
  { id: "semi-furnished",  label: "Semi Furnished"  },
  { id: "unfurnished",     label: "Unfurnished"      },
];

const BED_OPTIONS = ["Any", "1", "2", "3", "4", "5+"];

const SORT_OPTIONS = [
  { id: "newest",     label: "Newest First" },
  { id: "price_asc",  label: "Price: Low → High" },
  { id: "price_desc", label: "Price: High → Low" },
  { id: "views",      label: "Most Viewed" },
];

/* ─── Accordion Section ──────────────────────────────────────────── */
function AccordionSection({
  title, icon: Icon, children, defaultOpen = true, badge,
}: {
  title: string; icon?: React.ElementType; children: React.ReactNode;
  defaultOpen?: boolean; badge?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-hairline last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="flex items-center gap-2.5 text-sm font-medium text-ink group-hover:text-link transition-colors">
          {Icon && <Icon size={14} className="text-mute" />}
          {title}
          {badge ? (
            <span className="ml-1 w-4 h-4 rounded-full bg-ink text-on-primary text-[9px] font-medium flex items-center justify-center">
              {badge}
            </span>
          ) : null}
        </span>
        <ChevronDown
          size={14}
          className={cn("text-luxury-black/30 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Filter Checkbox ────────────────────────────────────────────── */
function FilterCheckbox({
  label, checked, onChange, count,
}: {
  label: string; checked: boolean; onChange: () => void; count?: number;
}) {
  return (
    <label
      className="flex items-center gap-3 py-2 cursor-pointer group select-none"
      onClick={onChange}
    >
      <div className={cn(
        "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-150",
        checked
          ? "bg-ink border-ink"
          : "border-hairline group-hover:border-hairline-strong bg-canvas",
      )}>
        {checked && <Check size={11} className="text-on-primary" strokeWidth={3} />}
      </div>
      <span className={cn(
        "text-sm flex-1 transition-colors",
        checked ? "text-ink font-medium" : "text-body group-hover:text-ink",
      )}>
        {label}
      </span>
      {count !== undefined && (
        <span className="text-[10px] font-bold text-luxury-black/25">{count}</span>
      )}
    </label>
  );
}

/* ─── Sidebar Filter Panel (shared between desktop & mobile sheet) ─ */
function FilterPanel({
  filters,
  setFilters,
  onClear,
  counts,
  propertyTypes,
  listingCategories,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onClear: () => void;
  counts: { types: Record<string, number>; furnishing: Record<string, number> };
  propertyTypes: ApiCategory[];
  listingCategories: ApiCategory[];
}) {
  const toggleType = (id: string) =>
    setFilters(f => ({
      ...f,
      types: f.types.includes(id) ? f.types.filter(t => t !== id) : [...f.types, id],
    }));

  const toggleFurnishing = (id: string) =>
    setFilters(f => ({
      ...f,
      furnishing: f.furnishing.includes(id) ? f.furnishing.filter(t => t !== id) : [...f.furnishing, id],
    }));

  const activeCount =
    (filters.listingType !== "all" ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < MAX_PRICE ? 1 : 0) +
    filters.types.length +
    (filters.bedrooms !== "any" ? 1 : 0) +
    filters.furnishing.length;

  const listingFilterKind = getListingFilterKind(filters.listingType, listingCategories);

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-hairline">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-ink" />
          <span className="text-caption-mono text-mute">Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-ink text-on-primary text-[10px] font-medium flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium text-mute hover:text-error transition-colors"
          >
            <RotateCcw size={11} /> Clear all
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-0">

        {/* Listing Type */}
        <AccordionSection title="Listing Type" icon={Tag}>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFilters(f => ({ ...f, listingType: "all" }))}
              className={cn(
                "py-2.5 rounded-full text-xs font-medium border transition-all",
                filters.listingType === "all"
                  ? "bg-ink text-on-primary border-ink"
                  : "bg-canvas text-body border-hairline hover:text-ink hover:border-hairline-strong",
              )}
            >
              All
            </button>
            {listingCategories.map(cat => (
              <button
                key={cat.slug}
                onClick={() => setFilters(f => ({ ...f, listingType: cat.slug }))}
                className={cn(
                  "py-2.5 rounded-full text-xs font-medium border transition-all",
                  filters.listingType === cat.slug
                    ? "bg-ink text-on-primary border-ink"
                    : "bg-canvas text-body border-hairline hover:text-ink hover:border-hairline-strong",
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </AccordionSection>

        {/* Price Range */}
        <AccordionSection
          title="Price Range"
          icon={IndianRupee}
          badge={filters.minPrice > 0 || filters.maxPrice < MAX_PRICE ? 1 : undefined}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-luxury-black/35 mb-1.5">Min</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-black/30 text-[12px] font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice || ""}
                    onChange={e => setFilters(f => ({ ...f, minPrice: Number(e.target.value) || 0 }))}
                    className="w-full pl-6 pr-2 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[12px] font-bold text-luxury-black focus:outline-none focus:border-luxury-purple/40 focus:ring-2 focus:ring-luxury-purple/10 transition-all"
                  />
                </div>
              </div>
              <div className="text-luxury-black/20 mt-5 text-base font-bold">–</div>
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-luxury-black/35 mb-1.5">Max</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-black/30 text-[12px] font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="Any"
                    value={filters.maxPrice >= MAX_PRICE ? "" : filters.maxPrice}
                    onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) || MAX_PRICE }))}
                    className="w-full pl-6 pr-2 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[12px] font-bold text-luxury-black focus:outline-none focus:border-luxury-purple/40 focus:ring-2 focus:ring-luxury-purple/10 transition-all"
                  />
                </div>
              </div>
            </div>
            {/* Quick presets */}
            <div className="flex flex-wrap gap-1.5">
              {(listingFilterKind === "rent"
                ? [
                    { label: "< ₹15K", min: 0, max: 15_000 },
                    { label: "₹15K–30K", min: 15_000, max: 30_000 },
                    { label: "> ₹30K", min: 30_000, max: MAX_PRICE },
                  ]
                : [
                    { label: "< ₹50L", min: 0, max: 5_000_000 },
                    { label: "₹50L–1Cr", min: 5_000_000, max: 10_000_000 },
                    { label: "> ₹1Cr", min: 10_000_000, max: MAX_PRICE },
                  ]
              ).map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setFilters(f => ({ ...f, minPrice: preset.min, maxPrice: preset.max }))}
                  className={cn(
                    "text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all",
                    filters.minPrice === preset.min && filters.maxPrice === preset.max
                      ? "bg-luxury-purple/10 border-luxury-purple/30 text-luxury-purple"
                      : "bg-white border-gray-200 text-luxury-black/45 hover:border-luxury-purple/20 hover:text-luxury-purple",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </AccordionSection>

        {/* Property Type */}
        <AccordionSection
          title="Property Type"
          icon={Building2}
          badge={filters.types.length || undefined}
        >
          <div className="space-y-0.5">
            {propertyTypes.map(cat => {
              const catCount = cat.matchValues.reduce((sum, v) => sum + (counts.types[v] ?? 0), 0);
              return (
                <FilterCheckbox
                  key={cat.slug}
                  label={cat.name}
                  checked={filters.types.includes(cat.slug)}
                  onChange={() => toggleType(cat.slug)}
                  count={catCount || undefined}
                />
              );
            })}
          </div>
        </AccordionSection>

        {/* Bedrooms */}
        <AccordionSection
          title="Bedrooms"
          icon={Bed}
          badge={filters.bedrooms !== "any" ? 1 : undefined}
        >
          <div className="flex flex-wrap gap-2">
            {BED_OPTIONS.map(opt => {
              const val = opt.toLowerCase() === "any" ? "any" : opt;
              const active = filters.bedrooms === val;
              return (
                <button
                  key={opt}
                  onClick={() => setFilters(f => ({ ...f, bedrooms: val }))}
                  className={cn(
                    "min-w-[46px] px-3 py-2 rounded-xl text-[12px] font-bold border transition-all",
                    active
                      ? "bg-luxury-purple text-white border-luxury-purple shadow-md shadow-luxury-purple/20"
                      : "bg-white text-luxury-black/50 border-gray-200 hover:border-luxury-purple/30 hover:text-luxury-purple",
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </AccordionSection>

        {/* Furnishing */}
        <AccordionSection
          title="Furnishing"
          icon={Layers}
          badge={filters.furnishing.length || undefined}
          defaultOpen={false}
        >
          <div className="space-y-0.5">
            {FURNISHING_OPTS.map(opt => (
              <FilterCheckbox
                key={opt.id}
                label={opt.label}
                checked={filters.furnishing.includes(opt.id)}
                onChange={() => toggleFurnishing(opt.id)}
                count={counts.furnishing[opt.id]}
              />
            ))}
          </div>
        </AccordionSection>


      </div>
    </div>
  );
}

/* ─── API → Property mapper ──────────────────────────────────────── */
function mapApiToProperty(p: ApiProperty): Property {
  return mapApiProperty(p);
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export const PropertiesListing = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [query, setQuery]     = useState("");
  const [sort, setSort]       = useState("newest");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState<ApiCategory[]>([]);
  const { listingCategories } = useListingCategories();

  useEffect(() => {
    setLoading(true);
    propertiesApi
      .listPublic()
      .then(res => setProperties(res.data.map(mapApiToProperty)))
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    categoriesApi.list("property")
      .then(res => setPropertyTypes(res.data.filter(c => c.matchValues.length > 0)))
      .catch(() => {});
  }, []);

  const handleClear = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  /* Counts for each filter option (based on full list) */
  const counts = useMemo(() => {
    const types: Record<string, number> = {};
    const furnishing: Record<string, number> = {};
    properties.forEach(p => {
      if (p.type) types[p.type] = (types[p.type] || 0) + 1;
      if (p.furnishingStatus) furnishing[p.furnishingStatus] = (furnishing[p.furnishingStatus] || 0) + 1;
    });
    return { types, furnishing };
  }, [properties]);

  /* Filtered + sorted */
  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = properties.filter(p => {
      if (filters.listingType !== "all" && !propertyMatchesListingTab(p.listingType, filters.listingType, listingCategories)) {
        return false;
      }
      const price = p.price ?? 0;
      if (filters.minPrice > 0 && price < filters.minPrice) return false;
      if (filters.maxPrice < MAX_PRICE && price > filters.maxPrice) return false;
      if (filters.types.length) {
        const selected = new Set(
          filters.types.flatMap(slug => propertyTypes.find(c => c.slug === slug)?.matchValues ?? [slug])
        );
        if (!selected.has(p.type ?? "")) return false;
      }
      if (filters.bedrooms !== "any") {
        const beds = p.beds ?? 0;
        if (filters.bedrooms === "5+") { if (beds < 5) return false; }
        else if (beds !== Number(filters.bedrooms)) return false;
      }
      if (filters.furnishing.length && !filters.furnishing.includes(p.furnishingStatus ?? "")) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q)) return false;
      return true;
    });

    switch (sort) {
      case "price_asc":  arr = arr.slice().sort((a, b) => (a.price ?? 0) - (b.price ?? 0)); break;
      case "price_desc": arr = arr.slice().sort((a, b) => (b.price ?? 0) - (a.price ?? 0)); break;
      case "views":      arr = arr.slice().sort((a, b) => (b.totalViews ?? 0) - (a.totalViews ?? 0)); break;
    }
    return arr;
  }, [properties, filters, query, sort, propertyTypes, listingCategories]);

  const activeCount =
    (filters.listingType !== "all" ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < MAX_PRICE ? 1 : 0) +
    filters.types.length +
    (filters.bedrooms !== "any" ? 1 : 0) +
    filters.furnishing.length;

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-canvas-soft">
      <div className="relative z-10 bg-canvas border-b border-hairline pt-28 pb-8 px-6 md:px-12">
        <div className="page-container !px-0">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-caption-mono text-mute mb-2">Curated homes</p>
              <h1 className="text-display-lg text-ink">Properties</h1>
              <p className="text-body-sm text-body mt-2">
                {displayed.length} {displayed.length === 1 ? "property" : "properties"} found
                {activeCount > 0 && <span className="text-ink font-medium"> · {activeCount} filter{activeCount !== 1 ? "s" : ""} active</span>}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:max-w-xl">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  type="text"
                  placeholder="Search by name or location…"
                  className="form-input-lg pl-10 pr-10 w-full"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X size={14} className="text-luxury-black/30 hover:text-luxury-black/60 transition-colors" />
                  </button>
                )}
              </div>

              {/* Mobile filter button */}
              <button
                onClick={() => setMobileOpen(true)}
                className={cn(
                  "xl:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-full border text-sm font-medium transition-all shrink-0",
                  activeCount > 0
                    ? "bg-ink text-on-primary border-ink"
                    : "bg-canvas border-hairline text-body hover:text-ink",
                )}
              >
                <SlidersHorizontal size={15} />
                Filters {activeCount > 0 && `(${activeCount})`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body: sidebar + grid ── */}
      <div className="relative z-10 page-container py-10 md:py-12">
        <div className="flex gap-10 lg:gap-12">
          <aside className="hidden xl:block w-[300px] shrink-0">
            <div className="sticky top-24">
              <div className="card-marketing overflow-hidden">
                <FilterPanel
                  filters={filters}
                  setFilters={setFilters}
                  onClear={handleClear}
                  counts={counts}
                  propertyTypes={propertyTypes}
                  listingCategories={listingCategories}
                />
              </div>
            </div>
          </aside>

          {/* ════ RIGHT: Sort bar + Property Grid ════ */}
          <div className="flex-1 min-w-0">

            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                {activeCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    {filters.listingType !== "all" && (
                      <ActiveChip
                        label={listingCategories.find(c => c.slug === filters.listingType)?.name ?? filters.listingType}
                        onRemove={() => setFilters(f => ({ ...f, listingType: "all" }))}
                      />
                    )}
                    {filters.types.map(t => (
                      <ActiveChip
                        key={t}
                        label={propertyTypes.find(c => c.slug === t)?.name ?? t}
                        onRemove={() => setFilters(f => ({ ...f, types: f.types.filter(x => x !== t) }))}
                      />
                    ))}
                    {filters.bedrooms !== "any" && (
                      <ActiveChip
                        label={`${filters.bedrooms} BHK`}
                        onRemove={() => setFilters(f => ({ ...f, bedrooms: "any" }))}
                      />
                    )}
                    {(filters.minPrice > 0 || filters.maxPrice < MAX_PRICE) && (
                      <ActiveChip
                        label={`${filters.minPrice > 0 ? formatCurrency(filters.minPrice) : "₹0"} – ${filters.maxPrice < MAX_PRICE ? formatCurrency(filters.maxPrice) : "Any"}`}
                        onRemove={() => setFilters(f => ({ ...f, minPrice: 0, maxPrice: MAX_PRICE }))}
                      />
                    )}
                    {filters.furnishing.map(f => (
                      <ActiveChip
                        key={f}
                        label={FURNISHING_OPTS.find(x => x.id === f)?.label ?? f}
                        onRemove={() => setFilters(prev => ({ ...prev, furnishing: prev.furnishing.filter(x => x !== f) }))}
                      />
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown size={13} className="text-luxury-black/30" />
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="text-[12px] font-bold text-luxury-black/70 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-luxury-purple/20 focus:border-luxury-purple/30 cursor-pointer transition-all"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading && (
              <div className="flex items-center justify-center py-40">
                <Loader2 className="w-8 h-8 animate-spin text-luxury-purple" />
              </div>
            )}
            {!loading && fetchError && (
              <div className="min-h-[360px] rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-center px-8 py-16">
                <p className="text-[13px] text-luxury-black/40 font-medium">Failed to load: {fetchError}</p>
              </div>
            )}
            <AnimatePresence mode="wait">
              {!loading && !fetchError && displayed.length > 0 ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                >
                  {displayed.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.4 }}
                    >
                      <PropertyCard property={property} index={index} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : !loading && !fetchError ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-h-[360px] rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center px-8 py-16"
                >
                  <div className="w-16 h-16 rounded-2xl bg-luxury-purple/8 flex items-center justify-center mb-5">
                    <Search size={28} className="text-luxury-purple/40" />
                  </div>
                  <p className="text-lg font-black text-luxury-black mb-2">No properties found</p>
                  <p className="text-[13px] text-luxury-black/40 mb-6 max-w-xs leading-relaxed">
                    Try adjusting your filters or search terms to find more results.
                  </p>
                  <button
                    onClick={() => { handleClear(); setQuery(""); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-luxury-purple text-white text-[12px] font-bold hover:opacity-90 transition-opacity shadow-md shadow-luxury-purple/20"
                  >
                    <RotateCcw size={13} /> Clear All Filters
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* ════ Mobile Filter Sheet ════ */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[100] xl:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1.5 rounded-full bg-gray-200" />
              </div>

              {/* Sheet header */}
              <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-luxury-purple" />
                  <span className="text-[13px] font-black text-luxury-black uppercase tracking-wider">
                    Filters
                  </span>
                  {activeCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-luxury-purple text-white text-[9px] font-black flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                </div>
                <button onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <X size={16} className="text-luxury-black/50" />
                </button>
              </div>

              {/* Sheet content */}
              <div className="flex-1 overflow-y-auto">
                <FilterPanel
                  filters={filters}
                  setFilters={setFilters}
                  onClear={handleClear}
                  counts={counts}
                  propertyTypes={propertyTypes}
                  listingCategories={listingCategories}
                />
              </div>

              {/* Sheet footer CTA */}
              <div className="px-5 pb-8 pt-4 border-t border-gray-100 shrink-0 space-y-2.5">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-luxury-purple to-indigo-600 text-white text-[13px] font-bold shadow-lg shadow-luxury-purple/25 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Show {displayed.length} {displayed.length === 1 ? "Property" : "Properties"}
                </button>
                {activeCount > 0 && (
                  <button
                    onClick={() => { handleClear(); setMobileOpen(false); }}
                    className="w-full py-3 rounded-2xl border border-gray-200 text-[12px] font-bold text-luxury-black/60 hover:border-red-200 hover:text-red-400 transition-all"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

/* ─── Active Filter Chip ─────────────────────────────────────────── */
function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      onClick={onRemove}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-canvas-soft-2 border border-hairline text-ink text-xs font-medium hover:bg-canvas-soft transition-all group"
    >
      {label}
      <X size={11} className="shrink-0 group-hover:rotate-90 transition-transform duration-150" />
    </motion.button>
  );
}
