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
import { ArrowUpRight, Loader2, SlidersHorizontal, X, Key } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Hero } from "./sections/Hero";
import { HomeStats } from "./sections/HomeStats";
import { FeaturedCategories } from "./sections/FeaturedCategories";
import { PopularCities } from "./sections/PopularCities";
import { WhyAetheria } from "./sections/WhyAetheria";
import { HowItWorks } from "./sections/HowItWorks";
import { Testimonials } from "./sections/Testimonials";
import { SmartLoanCalculator } from "@/src/components/home/SmartLoanCalculator";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/src/constants/routes";
import { useHomeCategoryStore } from "@/src/store/useHomeCategoryStore";
import { usePropertiesStore } from "@/src/store/usePropertiesStore";
import { propertiesApi } from "@/src/services/api";
import {
  mapApiProperty,
  propertyMatchesListingTab,
  getListingFilterKind,
  countPropertiesByTab,
} from "@/src/lib/listingCategory";
import { useListingCategories } from "@/src/hooks/useListingCategories";
import type { Property } from "@/src/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/src/lib/utils";

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


export const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]           = useState<HomeCategoryId>("all");
  const [activeFilters, setActiveFilters]   = useState<SmartFilters>(DEFAULT_SMART_FILTERS);
  const [activeSaleFilters, setActiveSaleFilters] = useState<SaleSmartFilters>(DEFAULT_SALE_SMART_FILTERS);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { pendingCategory, setPendingCategory }  = useHomeCategoryStore();

  const { properties: cachedProperties, setProperties } = usePropertiesStore();
  const { listingCategories, propertyCategories } = useListingCategories();

  const [allProperties, setAllProperties] = useState<Property[]>(cachedProperties);
  const [loading, setLoading] = useState(cachedProperties.length === 0);

  useEffect(() => {
    propertiesApi.listPublic()
      .then((res) => {
        const mapped = res.data.map(mapApiProperty);
        setAllProperties(mapped);
        setProperties(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setProperties]);

  useEffect(() => {
    if (pendingCategory) {
      setActiveTab(pendingCategory);
      setActiveFilters(DEFAULT_SMART_FILTERS);
      setActiveSaleFilters(DEFAULT_SALE_SMART_FILTERS);
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
    const filterKind = getListingFilterKind(activeTab, listingCategories);
    if (filterKind === "sale") setActiveSaleFilters(DEFAULT_SALE_SMART_FILTERS);
    else setActiveFilters(DEFAULT_SMART_FILTERS);
  };

  const filterKind = getListingFilterKind(activeTab, listingCategories);
  const tabCounts = useMemo(
    () => countPropertiesByTab(allProperties, listingCategories),
    [allProperties, listingCategories],
  );

  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      if (!propertyMatchesListingTab(property.listingType, activeTab, listingCategories)) {
        return false;
      }

      if (filterKind === "rent") {
        const rent = property.rent || property.price;
        const selectedPrice    = activeFilters.price    ? PRICE_RANGES[activeFilters.price]       : null;
        const selectedDistance = activeFilters.distance ? DISTANCE_LIMITS[activeFilters.distance] : null;
        const selectedTenant   = activeFilters.tenant;

        const matchesPrice    = !selectedPrice    || (rent >= selectedPrice[0] && rent <= selectedPrice[1]);
        const matchesTenant   = !selectedTenant   || property.tenantTypes?.includes(selectedTenant);
        const matchesDistance = selectedDistance == null || (property.distanceKm ?? Infinity) <= selectedDistance;
        return matchesPrice && matchesTenant && matchesDistance;
      }

      if (filterKind === "sale") {
        const price = property.price;

        const selectedSalePrice = activeSaleFilters.salePrice
          ? SALE_PRICE_RANGES[activeSaleFilters.salePrice] : null;
        const selectedPropCat   = activeSaleFilters.propertyType
          ? propertyCategories.find(c => c.name === activeSaleFilters.propertyType) ?? null : null;
        const selectedBedrooms  = activeSaleFilters.bedrooms;
        const selectedSaleDist  = activeSaleFilters.saleDistance
          ? SALE_DISTANCE_LIMITS[activeSaleFilters.saleDistance] : null;

        const matchesSalePrice  = !selectedSalePrice || (price >= selectedSalePrice[0] && price <= selectedSalePrice[1]);
        const matchesPropType   = !selectedPropCat   || selectedPropCat.matchValues.includes((property.type ?? "").toLowerCase());
        const matchesBedrooms   = !selectedBedrooms  || (() => {
          const beds = property.beds ?? 0;
          if (selectedBedrooms === "5+ BHK") return beds >= 5;
          return beds === parseInt(selectedBedrooms.replace(" BHK", ""), 10);
        })();
        const matchesSaleDist   = selectedSaleDist == null || (property.distanceKm ?? Infinity) <= selectedSaleDist;

        return matchesSalePrice && matchesPropType && matchesBedrooms && matchesSaleDist;
      }

      return true;
    });
  }, [allProperties, activeFilters, activeSaleFilters, activeTab, listingCategories, propertyCategories, filterKind]);

  const activeFilterCount = filterKind === "sale"
    ? Object.values(activeSaleFilters).filter(Boolean).length
    : filterKind === "rent"
      ? Object.values(activeFilters).filter(Boolean).length
      : 0;
  const showSidebar = filterKind === "rent" || filterKind === "sale";

  const activeCategory = listingCategories.find(c => c.slug === activeTab);
  const resultsLabel = activeTab === "all"
    ? "All properties"
    : activeCategory
      ? activeCategory.name
      : "Properties";

  return (
    <div className="overflow-x-hidden">
      <Hero />

      <div id="properties-listing" className="home-listings pb-16 md:pb-20">
        {/* Section intro */}
        <div className="page-container pt-8 md:pt-10 pb-2">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-eyebrow mb-2">Live inventory</p>
              <h2 className="text-display-lg text-ink">Browse verified properties</h2>
              <p className="text-body-md text-body mt-2 max-w-lg">
                Filter by rent, sale, or lease — every listing is owner-verified and ready to explore.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.PROPERTIES)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-deep transition-colors font-sans shrink-0"
            >
              Full directory
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="home-sticky-bar">
          <div className="page-container py-3 md:py-4">
            <div className="home-tabs-panel">
              <CategoryTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                listingCategories={listingCategories}
                tabCounts={tabCounts}
              />
            </div>
          </div>
        </div>

        <div className="page-container pt-6 md:pt-8">
          <div className={cn("flex gap-8 lg:gap-10", showSidebar && "xl:grid xl:grid-cols-[320px_1fr] xl:gap-10")}>

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
                  <div className="sticky top-24">
                    {filterKind === "sale" ? (
                      <SaleSmartFilterSidebar
                        activeFilters={activeSaleFilters}
                        onFilterChange={handleSaleFilterChange}
                        onClearAll={handleClearAll}
                        propertyTypeOptions={propertyCategories}
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
              <div className="home-results-header flex items-end justify-between gap-4">
                <div>
                  <p className="text-eyebrow mb-2 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-accent" />
                    {resultsLabel}
                  </p>
                  <h2 className="text-display-md text-accent">
                    {loading ? "Loading listings…" : (
                      <>{filteredProperties.length} <span className="gradient-text">{filteredProperties.length === 1 ? "home" : "homes"}</span> found</>
                    )}
                  </h2>
                  {activeFilterCount > 0 && (
                    <p className="text-body-sm text-body mt-1">
                      {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} applied
                    </p>
                  )}
                </div>

                {showSidebar && (
                  <button
                    onClick={() => setMobileFilterOpen(true)}
                    className={cn(
                      "xl:hidden flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all shrink-0",
                      activeFilterCount > 0
                        ? "bg-accent text-on-primary border-accent"
                        : "bg-canvas border-hairline text-body hover:text-accent hover:border-accent/30",
                    )}
                  >
                    <SlidersHorizontal size={15} />
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                  </button>
                )}
              </div>

              {/* Grid */}
              <div className="min-h-[360px] transition-opacity duration-150">
                {loading ? (
                  <div className="min-h-[360px] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-7 h-7 text-accent animate-spin" />
                    <p className="text-body-sm text-body">Loading properties…</p>
                  </div>
                ) : filteredProperties.length > 0 ? (
                  <motion.div
                    layout
                    className={cn(
                      "grid gap-6 lg:gap-8",
                      showSidebar
                        ? "grid-cols-1 lg:grid-cols-2"
                        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    )}
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
                  <div className="home-empty-state">
                    <div>
                      {activeTab === "projects" ? (
                        <>
                          <p className="text-display-sm text-accent">Explore new projects</p>
                          <p className="text-body-sm text-body mt-3 mb-6 max-w-sm mx-auto">
                            Browse upcoming and under-construction developments.
                          </p>
                          <button onClick={() => navigate("/projects")} className="btn-primary-sm px-6">
                            View all projects
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-display-sm text-accent">No matching properties</p>
                          <p className="text-body-sm text-body mt-3 max-w-sm mx-auto">
                            {allProperties.length === 0
                              ? "No active listings found. Check back soon."
                              : "Try another filter or category."}
                          </p>
                          {activeFilterCount > 0 && (
                            <button onClick={handleClearAll} className="btn-primary-sm px-6 mt-6">
                              Clear filters
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA + load more */}
              <div className="home-cta-banner">
                <h3 className="text-xl md:text-2xl font-semibold mb-2">Ready to find your next home?</h3>
                <p className="text-sm text-on-primary/80 mb-6 max-w-md mx-auto">
                  Browse our full directory of verified rentals and properties for sale.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTES.PROPERTIES)}
                  className="bg-canvas text-accent border-canvas hover:bg-canvas/90 px-8 group"
                >
                  Explore all properties
                  <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
                className="absolute bottom-0 left-0 right-0 bg-canvas rounded-t-2xl max-h-[88vh] flex flex-col overflow-hidden shadow-elevated-5"
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1.5 rounded-full bg-gray-200" />
                </div>

                {/* Sheet header */}
                <div className="px-5 py-4 flex items-center justify-between border-b border-hairline shrink-0">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={15} className="text-ink" />
                    <span className="text-sm font-medium text-ink">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-accent text-on-primary text-[10px] font-medium flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-9 h-9 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center hover:bg-canvas-soft-2 transition-colors"
                  >
                    <X size={16} className="text-mute" />
                  </button>
                </div>

                {/* Sheet body */}
                <div className="flex-1 overflow-y-auto">
                  {filterKind === "sale" ? (
                    <SaleSmartFilterSidebar
                      activeFilters={activeSaleFilters}
                      onFilterChange={handleSaleFilterChange}
                      onClearAll={handleClearAll}
                      propertyTypeOptions={propertyCategories}
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
                <div className="px-5 pb-8 pt-4 border-t border-hairline shrink-0 space-y-2.5">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full py-3.5 rounded-full bg-accent text-on-primary text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Show {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"}
                  </button>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => { handleClearAll(); setMobileFilterOpen(false); }}
                      className="w-full py-3 rounded-full border border-hairline text-sm font-medium text-body hover:text-error transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>

      <HomeStats />
      <FeaturedCategories />
      <PopularCities />

      <WhyAetheria />
      <HowItWorks />
      <Testimonials />
      <SmartLoanCalculator />
    </div>
  );
};
