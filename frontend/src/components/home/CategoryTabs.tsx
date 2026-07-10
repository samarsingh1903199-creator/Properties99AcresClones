import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import {
  Home, Key, Building2, Palmtree, Hotel, Warehouse,
  Tent, Trees, Layers, Sparkles, IndianRupee, Users, MapPin,
  Check, ChevronLeft, ChevronRight, ChevronDown,
  SlidersHorizontal, RotateCcw, Bed, Crown, Briefcase, Map, LayoutGrid, type LucideIcon,
} from "lucide-react";
import { categoriesApi, type ApiCategory } from "@/src/services/api";
import { ALL_CATEGORY_SLUG } from "@/src/lib/listingCategory";

/* ─── Icon Mapping ─────────────────────────────────────────────── */
const ICON_MAP: Record<string, LucideIcon> = {
  "key": Key, "home": Home, "building2": Building2, "palmtree": Palmtree,
  "hotel": Hotel, "warehouse": Warehouse, "tent": Tent, "trees": Trees,
  "layers": Layers, "sparkles": Sparkles, "bed": Bed, "crown": Crown,
  "tree-palm": Palmtree, "briefcase": Briefcase, "map": Map, "users": Users,
};

const getIcon = (iconName: string | null): LucideIcon => {
  if (!iconName) return Home;
  const icon = ICON_MAP[iconName.toLowerCase()];
  return icon || Home;
};

/* ─── Data ───────────────────────────────────────────────────────── */
const FALLBACK_CATEGORIES = [
  { id: "rent", label: "For Rent", icon: Key },
  { id: "sale", label: "For Sale", icon: Home },
  { id: "lease", label: "For Lease", icon: Briefcase },
] as const;

export type HomeCategoryId   = string;
export { ALL_CATEGORY_SLUG } from "@/src/lib/listingCategory";

const ALL_TAB = {
  _id: "all",
  name: "All",
  slug: ALL_CATEGORY_SLUG,
  categoryType: "listing" as const,
  order: 0,
  isActive: true,
  matchValues: [] as string[],
  icon: "layout-grid",
  createdAt: new Date().toISOString(),
  iconComponent: LayoutGrid,
};
export type SmartFilterGroup = "price" | "tenant" | "distance";
export type SmartFilters     = Record<SmartFilterGroup, string>;

export const DEFAULT_SMART_FILTERS: SmartFilters = { price: "", tenant: "", distance: "" };

export const SMART_FILTERS: {
  id: SmartFilterGroup; label: string; icon: LucideIcon; options: string[];
}[] = [
  {
    id: "price", label: "Price Range", icon: IndianRupee,
    options: ["₹10K - ₹15K", "₹15K - ₹20K", "₹20K - ₹25K", "₹25K - ₹30K"],
  },
  {
    id: "tenant", label: "Property / Tenant Type", icon: Users,
    options: ["Independent", "Family", "Couple", "Girls", "Boys", "Working Professionals"],
  },
  {
    id: "distance", label: "Distance & Nearby", icon: MapPin,
    options: ["Near Me", "Within 10 KM", "Within 15 KM", "Within 20 KM"],
  },
];

const GROUP_META: Record<SmartFilterGroup, {
  topBar: string; iconBg: string; iconColor: string;
  activeFrom: string; activeTo: string; glowColor: string;
  labelColor: string;
}> = {
  price: {
    topBar: "from-violet-500 via-purple-500 to-indigo-500",
    iconBg: "bg-violet-50", iconColor: "text-violet-600",
    activeFrom: "#7c3aed", activeTo: "#4f46e5",
    glowColor: "rgba(124,58,237,0.25)", labelColor: "text-violet-500",
  },
  tenant: {
    topBar: "from-sky-500 via-blue-500 to-indigo-500",
    iconBg: "bg-sky-50", iconColor: "text-sky-600",
    activeFrom: "#0284c7", activeTo: "#4f46e5",
    glowColor: "rgba(2,132,199,0.25)", labelColor: "text-sky-500",
  },
  distance: {
    topBar: "from-emerald-400 via-teal-500 to-cyan-500",
    iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
    activeFrom: "#059669", activeTo: "#0d9488",
    glowColor: "rgba(5,150,105,0.25)", labelColor: "text-emerald-500",
  },
};

/* ─── CategoryTabs (tab strip only) ─────────────────────────────── */
interface CategoryTabsProps {
  activeTab: HomeCategoryId;
  onTabChange: (tab: HomeCategoryId) => void;
  listingCategories?: ApiCategory[];
  tabCounts?: Record<string, number>;
}

function buildTabsFromCategories(source: ApiCategory[]): (ApiCategory & { iconComponent: LucideIcon })[] {
  return [
    ALL_TAB,
    ...source.map(cat => ({
      ...cat,
      iconComponent: getIcon(cat.icon),
    })),
  ];
}

function buildFallbackTabs(): (ApiCategory & { iconComponent: LucideIcon })[] {
  return [
    ALL_TAB,
    ...FALLBACK_CATEGORIES.map(cat => ({
      ...cat,
      _id: cat.id,
      name: cat.label,
      slug: cat.id,
      categoryType: "listing" as const,
      order: 0,
      isActive: true,
      matchValues: cat.id === "rent" ? ["rent"] : cat.id === "lease" ? ["lease"] : ["buy", "sale"],
      createdAt: new Date().toISOString(),
      iconComponent: cat.icon,
      icon: "",
    })),
  ];
}

export const CategoryTabs = ({ activeTab, onTabChange, listingCategories, tabCounts }: CategoryTabsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hoveredId,      setHoveredId]      = useState<string | null>(null);
  const [categories, setCategories] = useState<(ApiCategory & { iconComponent: LucideIcon })[]>(() =>
    listingCategories?.length ? buildTabsFromCategories(listingCategories) : [],
  );

  useEffect(() => {
    if (listingCategories?.length) {
      setCategories(buildTabsFromCategories(listingCategories));
      return;
    }

    categoriesApi.list("listing")
      .then((res) => {
        setCategories(buildTabsFromCategories(
          res.data.filter(c => c.isActive !== false).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
        ));
      })
      .catch(() => setCategories(buildFallbackTabs()));
  }, [listingCategories]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeBtn = el.querySelector(`[data-cat="${activeTab}"]`) as HTMLElement;
    if (activeBtn) {
      const offset = activeBtn.offsetLeft - el.clientWidth / 2 + activeBtn.offsetWidth / 2;
      el.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, [activeTab, categories]);

  return (
    <div className="w-full py-1">
      <div className="relative max-w-[1400px] mx-auto">

        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-canvas via-canvas/90 to-transparent z-10 flex items-center pl-1 pointer-events-none"
            >
              <motion.button
                onClick={() => scroll("left")}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                className="pointer-events-auto w-8 h-8 rounded-full bg-canvas border border-hairline shadow-elevated-2 flex items-center justify-center text-mute hover:text-ink transition-all"
              >
                <ChevronLeft size={15} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {canScrollRight && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-canvas via-canvas/90 to-transparent z-10 flex items-center justify-end pr-1 pointer-events-none"
            >
              <motion.button
                onClick={() => scroll("right")}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                className="pointer-events-auto w-8 h-8 rounded-full bg-canvas border border-hairline shadow-elevated-2 flex items-center justify-center text-mute hover:text-ink transition-all"
              >
                <ChevronRight size={15} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={scrollRef} className="overflow-x-auto hide-scrollbar" onScroll={checkScroll}>
          <div className="flex items-center justify-center gap-2 min-w-max py-1 mx-auto">
            {categories.map((cat) => {
              const isActive  = activeTab === cat.slug;
              const isHovered = hoveredId === cat.slug;

              return (
                <motion.button
                  key={cat._id}
                  data-cat={cat.slug}
                  onClick={() => onTabChange(cat.slug)}
                  onHoverStart={() => setHoveredId(cat.slug)}
                  onHoverEnd={() => setHoveredId(null)}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "tab-ghost gap-2",
                    isActive && "tab-ghost-active shadow-elevated-2",
                    !isActive && isHovered && "bg-canvas-soft-2"
                  )}
                >
                  <cat.iconComponent
                    size={15}
                    className={cn(
                      "transition-colors shrink-0",
                      isActive ? "text-on-primary" : isHovered ? "text-ink" : "text-mute"
                    )}
                  />
                  <span className={cn(
                    "text-sm transition-colors",
                    isActive ? "text-on-primary font-medium" : isHovered ? "text-ink" : "text-body"
                  )}>
                    {cat.name}
                    {tabCounts && tabCounts[cat.slug] != null && cat.slug !== ALL_CATEGORY_SLUG && (
                      <span className={cn(
                        "ml-1.5 text-xs tabular-nums",
                        isActive ? "text-on-primary/80" : "text-mute",
                      )}>
                        ({tabCounts[cat.slug]})
                      </span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Sale Smart Filter Types & Data ────────────────────────────── */
export type SaleSmartFilterGroup = "salePrice" | "propertyType" | "bedrooms" | "saleDistance";
export type SaleSmartFilters     = Record<SaleSmartFilterGroup, string>;
export const DEFAULT_SALE_SMART_FILTERS: SaleSmartFilters = {
  salePrice: "", propertyType: "", bedrooms: "", saleDistance: "",
};

const SALE_SMART_FILTERS: {
  id: SaleSmartFilterGroup; label: string; icon: LucideIcon; options: string[];
}[] = [
  {
    id: "salePrice", label: "Price Range", icon: IndianRupee,
    options: ["Under ₹50L", "₹50L - ₹1Cr", "₹1Cr - ₹2Cr", "₹2Cr+"],
  },
  {
    id: "propertyType", label: "Property Type", icon: Building2,
    options: ["Apartment", "Villa", "Plot", "Commercial", "Penthouse"],
  },
  {
    id: "bedrooms", label: "Bedrooms", icon: Bed,
    options: ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"],
  },
  {
    id: "saleDistance", label: "Distance & Nearby", icon: MapPin,
    options: ["Near Me", "Within 5 KM", "Within 10 KM", "Within 20 KM"],
  },
];

const SALE_GROUP_META: Record<SaleSmartFilterGroup, {
  iconColor: string; activeFrom: string; activeTo: string; glowColor: string;
}> = {
  salePrice:    { iconColor: "text-emerald-600", activeFrom: "#059669", activeTo: "#0d9488", glowColor: "rgba(5,150,105,0.25)"   },
  propertyType: { iconColor: "text-amber-600",   activeFrom: "#d97706", activeTo: "#ea580c", glowColor: "rgba(217,119,6,0.25)"   },
  bedrooms:     { iconColor: "text-violet-600",  activeFrom: "#7c3aed", activeTo: "#4f46e5", glowColor: "rgba(124,58,237,0.25)"  },
  saleDistance: { iconColor: "text-teal-600",    activeFrom: "#0d9488", activeTo: "#0891b2", glowColor: "rgba(13,148,136,0.25)"  },
};

/* ─── SmartFilterSidebar ─────────────────────────────────────────── */
interface SmartFilterSidebarProps {
  activeFilters: SmartFilters;
  onFilterChange: (groupId: SmartFilterGroup, option: string) => void;
  onClearAll: () => void;
}

export const SmartFilterSidebar = ({ activeFilters, onFilterChange, onClearAll }: SmartFilterSidebarProps) => {
  const [openSections, setOpenSections] = useState<Record<SmartFilterGroup, boolean>>({
    price: true, tenant: true, distance: false,
  });

  const toggle = (id: SmartFilterGroup) =>
    setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const activeCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="home-filter-panel">
      <div className="home-filter-panel-header">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} />
          <span className="text-sm font-medium">Smart filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-canvas text-accent text-[10px] font-semibold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs font-medium text-on-primary/80 hover:text-on-primary transition-colors"
          >
            <RotateCcw size={11} /> Clear
          </button>
        )}
      </div>

      <div className="px-5 pb-5 space-y-0 divide-y divide-hairline">
        {SMART_FILTERS.map((group) => {
          const activeValue = activeFilters[group.id];
          const isOpen      = openSections[group.id];

          return (
            <div key={group.id}>
              <button
                onClick={() => toggle(group.id)}
                className="w-full flex items-center justify-between py-4 text-left group"
              >
                <span className="flex items-center gap-2.5 text-sm font-medium text-accent group-hover:text-accent-deep transition-colors">
                  <group.icon size={14} className="text-accent/60" />
                  {group.label}
                  {activeValue && (
                    <span className="w-4 h-4 rounded-full bg-accent flex items-center justify-center text-on-primary text-[9px] font-medium">
                      1
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={14}
                  className={cn("text-mute transition-transform duration-200", isOpen && "rotate-180")}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-2 pb-4">
                      {group.options.map((option) => {
                        const isSelected = activeValue === option;
                        return (
                          <motion.button
                            key={option}
                            onClick={() => onFilterChange(group.id, option)}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "filter-chip",
                              isSelected && "filter-chip-active",
                            )}
                          >
                            {isSelected && <Check size={11} strokeWidth={2.5} className="shrink-0" />}
                            {option}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── SaleSmartFilterSidebar ─────────────────────────────────────── */
interface SaleSmartFilterSidebarProps {
  activeFilters: SaleSmartFilters;
  onFilterChange: (groupId: SaleSmartFilterGroup, option: string) => void;
  onClearAll: () => void;
  propertyTypeOptions?: { name: string; matchValues: string[] }[];
}

export const SaleSmartFilterSidebar = ({ activeFilters, onFilterChange, onClearAll, propertyTypeOptions }: SaleSmartFilterSidebarProps) => {
  const [openSections, setOpenSections] = useState<Record<SaleSmartFilterGroup, boolean>>({
    salePrice: true, propertyType: true, bedrooms: true, saleDistance: false,
  });

  const toggle = (id: SaleSmartFilterGroup) =>
    setOpenSections(s => ({ ...s, [id]: !s[id] }));

  const activeCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="home-filter-panel">
      <div className="home-filter-panel-header">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} />
          <span className="text-sm font-medium">Smart filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-canvas text-accent text-[10px] font-semibold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs font-medium text-on-primary/80 hover:text-on-primary transition-colors"
          >
            <RotateCcw size={11} /> Clear
          </button>
        )}
      </div>

      <div className="px-5 pb-5 space-y-0 divide-y divide-hairline">
        {SALE_SMART_FILTERS.map((group) => {
          const activeValue = activeFilters[group.id];
          const isOpen      = openSections[group.id];
          const options     = group.id === "propertyType" && propertyTypeOptions?.length
            ? propertyTypeOptions.map(c => c.name)
            : group.options;

          return (
            <div key={group.id}>
              <button
                onClick={() => toggle(group.id)}
                className="w-full flex items-center justify-between py-4 text-left group"
              >
                <span className="flex items-center gap-2.5 text-sm font-medium text-accent group-hover:text-accent-deep transition-colors">
                  <group.icon size={14} className="text-accent/60" />
                  {group.label}
                  {activeValue && (
                    <span className="w-4 h-4 rounded-full bg-accent flex items-center justify-center text-on-primary text-[9px] font-medium">
                      1
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={14}
                  className={cn("text-mute transition-transform duration-200", isOpen && "rotate-180")}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-2 pb-4">
                      {options.map((option) => {
                        const isSelected = activeValue === option;
                        return (
                          <motion.button
                            key={option}
                            onClick={() => onFilterChange(group.id, option)}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "filter-chip",
                              isSelected && "filter-chip-active",
                            )}
                          >
                            {isSelected && <Check size={11} strokeWidth={2.5} className="shrink-0" />}
                            {option}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
