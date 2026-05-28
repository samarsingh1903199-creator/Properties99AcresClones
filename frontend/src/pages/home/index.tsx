import {
  CategoryTabs,
  SmartFilterSidebar,
  SaleSmartFilterSidebar,
  DEFAULT_SMART_FILTERS,
  DEFAULT_SALE_SMART_FILTERS,
  type HomeCategoryId,
  type SmartFilterGroup,
  type SmartFilters,
  type SaleSmartFilterGroup,
  type SaleSmartFilters,
} from "@/src/components/home/CategoryTabs";
import { PropertyCard } from "@/src/components/ui/PropertyCard";
import { ArrowUpRight, Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { BGPattern } from "@/src/components/ui/bg-pattern";
import { Hero } from "./sections/Hero";
import { SmartLoanCalculator } from "@/src/components/home/SmartLoanCalculator";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/src/constants/routes";
import { useHomeCategoryStore } from "@/src/store/useHomeCategoryStore";
import { usePropertiesStore } from "@/src/store/usePropertiesStore";
import { propertiesApi, type ApiProperty } from "@/src/services/api";
import type { Property } from "@/src/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/src/lib/utils";

function mapApiProperty(p: ApiProperty): Property {
  return {
    id:          p._id,
    title:       p.title,
    description: p.description,
    price:       p.price,
    rent:        p.listingType === "rent" ? p.price : undefined,
    location:    `${p.location}, ${p.city}`,
    images:      p.images.length ? p.images : ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80"],
    beds:        p.bedrooms,
    baths:       p.bathrooms,
    sqft:        p.area,
    type:        p.type,
    status:      p.status,
    listingType: p.listingType === "sale" ? "buy" : "rent",
    features:    [],
    agentId:     p.ownerId,
    totalViews:  p.views,
    verified:    true,
    tenantTypes: p.amenities?.preferred_tenants ?? [],
    distanceKm:  p.amenities?.distanceFromLocation,
  };
}

const PRICE_RANGES: Record<string, [number, number]> = {
  "₹10K - ₹15K": [10000, 15000],
  "₹15K - ₹20K": [15000, 20000],
  "₹20K - ₹25K": [20000, 25000],
  "₹25K - ₹30K": [25000, 30000],
};

const DISTANCE_LIMITS: Record<string, number> = {
  "Near Me": 5, "Within 10 KM": 10, "Within 15 KM": 15, "Within 20 KM": 20,
};

const SALE_PRICE_RANGES: Record<string, [number, number]> = {
  "Under ₹50L":   [0,          5_000_000],
  "₹50L - ₹1Cr":  [5_000_000,  10_000_000],
  "₹1Cr - ₹2Cr":  [10_000_000, 20_000_000],
  "₹2Cr+":         [20_000_000, Infinity],
};

const SALE_DISTANCE_LIMITS: Record<string, number> = {
  "Near Me": 5, "Within 5 KM": 5, "Within 10 KM": 10, "Within 20 KM": 20,
};

const SALE_PROPERTY_TYPE_MAP: Record<string, string> = {
  "Apartment": "apartment", "Villa": "villa", "Plot": "plot",
  "Commercial": "commercial", "Penthouse": "penthouse",
};

const categoryMatches = (category: HomeCategoryId, propertyType: string, listingType?: string) => {
  if (category === "rent")        return listingType === "rent";
  if (category === "sale")        return listingType === "buy";
  // Lease = long-term rent (backend stores as "rent")
  if (category === "lease")       return listingType === "rent";
  if (category === "apartments")  return propertyType === "apartment";
  if (category === "co-living")   return ["pg", "co-living"].includes(propertyType);
  if (category === "villas" || category === "luxury") return ["villa", "independent"].includes(propertyType);
  if (category === "commercial")  return propertyType === "commercial";
  if (category === "plots")       return propertyType === "plot";
  // "projects" tab has its own page — show nothing here
  if (category === "projects")    return false;
  return false;
};

export const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]           = useState<HomeCategoryId>("rent");
  const [activeFilters, setActiveFilters]   = useState<SmartFilters>(DEFAULT_SMART_FILTERS);
  const [activeSaleFilters, setActiveSaleFilters] = useState<SaleSmartFilters>(DEFAULT_SALE_SMART_FILTERS);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { pendingCategory, setPendingCategory }  = useHomeCategoryStore();

  const { properties: cachedProperties, lastFetched, setProperties } = usePropertiesStore();

  // Use cached data immediately — no spinner flash on return visits
  const [allProperties, setAllProperties] = useState<Property[]>(cachedProperties);
  const [loading, setLoading] = useState(cachedProperties.length === 0);

  useEffect(() => {
    const CACHE_TTL = 60_000; // 1 minute
    const isFresh = lastFetched && Date.now() - lastFetched < CACHE_TTL;
    if (isFresh && cachedProperties.length > 0) return; // already fresh

    propertiesApi.listPublic()
      .then((res) => {
        const mapped = res.data.map(mapApiProperty);
        setAllProperties(mapped);
        setProperties(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pendingCategory) {
      setActiveTab(pendingCategory);
      setActiveFilters(DEFAULT_SMART_FILTERS);
      setPendingCategory(null);
    }
  }, [pendingCategory, setPendingCategory]);

  const handleTabChange = (tab: HomeCategoryId) => {
    setActiveTab(tab);
    setActiveFilters(DEFAULT_SMART_FILTERS);
    setActiveSaleFilters(DEFAULT_SALE_SMART_FILTERS);
    setMobileFilterOpen(false);
  };

  const handleFilterChange = (groupId: SmartFilterGroup, option: string) =>
    setActiveFilters(current => ({
      ...current,
      [groupId]: current[groupId] === option ? "" : option,
    }));

  const handleSaleFilterChange = (groupId: SaleSmartFilterGroup, option: string) =>
    setActiveSaleFilters(current => ({
      ...current,
      [groupId]: current[groupId] === option ? "" : option,
    }));

  const handleClearAll = () => {
    if (activeTab === "sale") setActiveSaleFilters(DEFAULT_SALE_SMART_FILTERS);
    else setActiveFilters(DEFAULT_SMART_FILTERS);
  };

  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      if (!categoryMatches(activeTab, property.type, property.listingType)) return false;

      /* ── Rent filters ── */
      if (activeTab === "rent") {
        const rent = property.rent || property.price;
        const selectedPrice    = activeFilters.price    ? PRICE_RANGES[activeFilters.price]       : null;
        const selectedDistance = activeFilters.distance ? DISTANCE_LIMITS[activeFilters.distance] : null;
        const selectedTenant   = activeFilters.tenant;

        const matchesPrice    = !selectedPrice    || (rent >= selectedPrice[0] && rent <= selectedPrice[1]);
        const matchesTenant   = !selectedTenant   || property.tenantTypes?.includes(selectedTenant);
        const matchesDistance = selectedDistance == null || (property.distanceKm ?? Infinity) <= selectedDistance;
        return matchesPrice && matchesTenant && matchesDistance;
      }

      /* ── Sale filters ── */
      if (activeTab === "sale") {
        const price = property.price;

        const selectedSalePrice  = activeSaleFilters.salePrice    ? SALE_PRICE_RANGES[activeSaleFilters.salePrice]       : null;
        const selectedPropType   = activeSaleFilters.propertyType ? SALE_PROPERTY_TYPE_MAP[activeSaleFilters.propertyType] : null;
        const selectedBedrooms   = activeSaleFilters.bedrooms;
        const selectedSaleDist   = activeSaleFilters.saleDistance  ? SALE_DISTANCE_LIMITS[activeSaleFilters.saleDistance] : null;

        const matchesSalePrice   = !selectedSalePrice  || (price >= selectedSalePrice[0] && price <= selectedSalePrice[1]);
        const matchesPropType    = !selectedPropType   || (property.type ?? "").toLowerCase() === selectedPropType;
        const matchesBedrooms    = !selectedBedrooms   || (() => {
          const beds = property.beds ?? 0;
          if (selectedBedrooms === "5+ BHK") return beds >= 5;
          return beds === parseInt(selectedBedrooms.replace(" BHK", ""), 10);
        })();
        const matchesSaleDist    = selectedSaleDist == null || (property.distanceKm ?? Infinity) <= selectedSaleDist;

        return matchesSalePrice && matchesPropType && matchesBedrooms && matchesSaleDist;
      }

      return true;
    });
  }, [allProperties, activeFilters, activeSaleFilters, activeTab]);

  const activeFilterCount = activeTab === "sale"
    ? Object.values(activeSaleFilters).filter(Boolean).length
    : Object.values(activeFilters).filter(Boolean).length;
  const showSidebar = activeTab === "rent" || activeTab === "sale";

  return (
    <div className="overflow-x-hidden">
      <Hero />

      <div id="properties-listing" className="relative isolate overflow-hidden bg-luxury-gray pb-20">
        <BGPattern
          variant="grid"
          mask="fade-y"
          size={48}
          fill="rgba(91, 33, 182, 0.12)"
        />

        {/* ── Category tab strip (full width, sticky) ── */}
        <div className="sticky top-0 z-40">
          <CategoryTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        <div className="relative z-10 max-w-[1700px] mx-auto px-6 md:px-12 pt-8">
          <div className={cn("flex gap-8", showSidebar && "xl:grid xl:grid-cols-[280px_1fr]")}>

            {/* ── Left sidebar (desktop, rent only) ── */}
            <AnimatePresence>
              {showSidebar && (
                <motion.aside
                  key="sidebar"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="hidden xl:block"
                >
                  <div className="sticky top-20">
                    {activeTab === "sale" ? (
                      <SaleSmartFilterSidebar
                        activeFilters={activeSaleFilters}
                        onFilterChange={handleSaleFilterChange}
                        onClearAll={handleClearAll}
                      />
                    ) : (
                      <SmartFilterSidebar
                        activeFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                        onClearAll={handleClearAll}
                      />
                    )}
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* ── Property grid ── */}
            <div className="flex-1 min-w-0">
              {/* Results meta */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-luxury-purple mb-1">
                    {activeTab === "rent" ? "Available Rentals" : activeTab === "sale" ? "Sale Properties" : "Properties"}
                  </p>
                  <p className="text-[13px] font-medium text-luxury-black/45">
                    {loading ? "Loading…" : `${filteredProperties.length} ${filteredProperties.length === 1 ? "property" : "properties"} found`}
                    {activeFilterCount > 0 && (
                      <span className="text-luxury-purple ml-1.5">
                        · {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} applied
                      </span>
                    )}
                  </p>
                </div>

                {/* Mobile filter button (inline, xl hidden) */}
                {showSidebar && (
                  <button
                    onClick={() => setMobileFilterOpen(true)}
                    className={cn(
                      "xl:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-[12px] font-bold transition-all",
                      activeFilterCount > 0
                        ? "bg-luxury-purple text-white border-luxury-purple shadow-md shadow-luxury-purple/20"
                        : "bg-white border-gray-200 text-luxury-black/60 hover:border-luxury-purple/30",
                    )}
                  >
                    <SlidersHorizontal size={14} />
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                  </button>
                )}
              </div>

              {/* Grid */}
              <div className="min-h-[360px] transition-opacity duration-150">
                {loading ? (
                  <div className="min-h-[320px] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 text-luxury-purple animate-spin" />
                    <p className="text-sm text-luxury-black/40 font-medium">Loading properties…</p>
                  </div>
                ) : filteredProperties.length > 0 ? (
                  <motion.div
                    layout
                    className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
                  >
                    {filteredProperties.map((property, idx) => (
                      <motion.div
                        key={property.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                      >
                        <PropertyCard property={property} index={idx} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="min-h-[320px] rounded-2xl bg-white border border-luxury-purple/5 flex items-center justify-center text-center px-6 shadow-sm">
                    <div>
                      {activeTab === "projects" ? (
                        <>
                          <p className="text-xl font-display font-black text-luxury-black">Explore New Projects</p>
                          <p className="text-sm text-luxury-black/45 mt-2 mb-5">
                            Browse upcoming and under-construction developments.
                          </p>
                          <button
                            onClick={() => navigate("/projects")}
                            className="px-5 py-2.5 rounded-xl bg-luxury-purple text-white text-[12px] font-bold hover:opacity-90 transition-opacity"
                          >
                            View All Projects
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-xl font-display font-black text-luxury-black">No matching properties</p>
                          <p className="text-sm text-luxury-black/45 mt-2">
                            {allProperties.length === 0
                              ? "No active listings found. Check back soon."
                              : "Try another filter or category."}
                          </p>
                          {activeFilterCount > 0 && (
                            <button
                              onClick={handleClearAll}
                              className="mt-4 px-5 py-2.5 rounded-xl bg-luxury-purple text-white text-[12px] font-bold hover:opacity-90 transition-opacity"
                            >
                              Clear Filters
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Load more */}
              <div className="mt-16 flex flex-col items-center">
                <div className="w-24 h-1 bg-luxury-purple/20 rounded-full mb-10" />
                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTES.PROPERTIES)}
                  className="px-10 py-7 rounded-2xl border-luxury-purple/10 font-display font-black text-lg hover:border-luxury-purple hover:bg-white transition-all group shadow-sm hover:shadow-xl hover:shadow-luxury-purple/10"
                >
                  Explore More Properties{" "}
                  <ArrowUpRight className="ml-3 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* ── Mobile Filter Bottom Sheet ── */}
        <AnimatePresence>
          {mobileFilterOpen && showSidebar && (
            <div className="fixed inset-0 z-[100] xl:hidden">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileFilterOpen(false)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />

              {/* Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[88vh] flex flex-col overflow-hidden"
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1.5 rounded-full bg-gray-200" />
                </div>

                {/* Sheet header */}
                <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={15} className="text-luxury-purple" />
                    <span className="text-[13px] font-black text-luxury-black uppercase tracking-wider">Smart Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-luxury-purple text-white text-[9px] font-black flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} className="text-luxury-black/50" />
                  </button>
                </div>

                {/* Sheet body */}
                <div className="flex-1 overflow-y-auto">
                  {activeTab === "sale" ? (
                    <SaleSmartFilterSidebar
                      activeFilters={activeSaleFilters}
                      onFilterChange={handleSaleFilterChange}
                      onClearAll={handleClearAll}
                    />
                  ) : (
                    <SmartFilterSidebar
                      activeFilters={activeFilters}
                      onFilterChange={handleFilterChange}
                      onClearAll={handleClearAll}
                    />
                  )}
                </div>

                {/* Sheet footer */}
                <div className="px-5 pb-8 pt-4 border-t border-gray-100 shrink-0 space-y-2.5">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-luxury-purple to-indigo-600 text-white text-[13px] font-bold shadow-lg shadow-luxury-purple/25 hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    Show {filteredProperties.length} {filteredProperties.length === 1 ? "Property" : "Properties"}
                  </button>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => { handleClearAll(); setMobileFilterOpen(false); }}
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

      <SmartLoanCalculator />
    </div>
  );
};
