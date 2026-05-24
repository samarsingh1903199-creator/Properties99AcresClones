import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import {
  Home, Key, Building2, Palmtree, Hotel, Warehouse,
  Tent, Trees, Layers, Sparkles, IndianRupee, Users, MapPin,
  Check, ChevronLeft, ChevronRight, ChevronDown,
  SlidersHorizontal, RotateCcw, type LucideIcon,
} from "lucide-react";

/* ─── Data ───────────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "rent",       label: "For Rent",      icon: Key       },
  { id: "sale",       label: "For Sale",      icon: Home      },
  { id: "lease",      label: "Lease",         icon: Layers    },
  { id: "luxury",     label: "Luxury Homes",  icon: Sparkles  },
  { id: "apartments", label: "Apartments",    icon: Building2 },
  { id: "villas",     label: "Villas",        icon: Palmtree  },
  { id: "commercial", label: "Commercial",    icon: Warehouse },
  { id: "plots",      label: "Plots",         icon: Trees     },
  { id: "projects",   label: "New Projects",  icon: Hotel     },
  { id: "co-living",  label: "PG / Co-Living",icon: Tent      },
] as const;

export type HomeCategoryId   = (typeof CATEGORIES)[number]["id"];
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
}

export const CategoryTabs = ({ activeTab, onTabChange }: CategoryTabsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hoveredId,      setHoveredId]      = useState<string | null>(null);

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
  }, [activeTab]);

  return (
    <div className="w-full bg-white border-b border-luxury-purple/5 py-4 shadow-sm">
      <div className="relative px-4 md:px-8">

        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white via-white/90 to-transparent z-10 flex items-center pl-1 pointer-events-none"
            >
              <motion.button
                onClick={() => scroll("left")}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                className="pointer-events-auto w-8 h-8 rounded-xl bg-white border border-luxury-purple/10 shadow-md flex items-center justify-center text-luxury-black/40 hover:text-luxury-purple hover:border-luxury-purple/30 hover:shadow-lg transition-all"
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
              className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-white/90 to-transparent z-10 flex items-center justify-end pr-1 pointer-events-none"
            >
              <motion.button
                onClick={() => scroll("right")}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                className="pointer-events-auto w-8 h-8 rounded-xl bg-white border border-luxury-purple/10 shadow-md flex items-center justify-center text-luxury-black/40 hover:text-luxury-purple hover:border-luxury-purple/30 hover:shadow-lg transition-all"
              >
                <ChevronRight size={15} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={scrollRef} className="overflow-x-auto hide-scrollbar" onScroll={checkScroll}>
          <div className="flex items-center gap-1 min-w-max py-1">
            {CATEGORIES.map((cat) => {
              const isActive  = activeTab === cat.id;
              const isHovered = hoveredId === cat.id;

              return (
                <motion.button
                  key={cat.id}
                  data-cat={cat.id}
                  onClick={() => onTabChange(cat.id)}
                  onHoverStart={() => setHoveredId(cat.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl whitespace-nowrap select-none outline-none focus-visible:ring-2 focus-visible:ring-luxury-purple/40"
                >
                  {isActive && (
                    <motion.span
                      layoutId="category-active-pill"
                      className="absolute inset-0 rounded-xl bg-luxury-purple"
                      style={{ boxShadow: "0 4px 20px rgba(91,33,182,0.35), 0 1px 4px rgba(91,33,182,0.2)" }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {!isActive && isHovered && (
                    <motion.span
                      layoutId="category-hover-pill"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0 rounded-xl bg-luxury-purple/6 border border-luxury-purple/10"
                      transition={{ duration: 0.18 }}
                    />
                  )}

                  <motion.span
                    className="relative z-10 flex-shrink-0"
                    animate={{ scale: isActive ? 1.15 : isHovered ? 1.08 : 1, rotate: isActive ? 0 : isHovered ? -6 : 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  >
                    <cat.icon size={14} className={cn(
                      "transition-colors duration-200",
                      isActive ? "text-white" : isHovered ? "text-luxury-purple" : "text-luxury-black/30"
                    )} />
                  </motion.span>

                  <span className={cn(
                    "relative z-10 text-[10px] font-black uppercase tracking-[0.18em] transition-colors duration-200",
                    isActive ? "text-white" : isHovered ? "text-luxury-black" : "text-luxury-black/40"
                  )}>
                    {cat.label}
                  </span>

                  {isActive && (
                    <motion.span
                      layoutId="tab-dot"
                      className="relative z-10 w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0"
                      transition={{ type: "spring", stiffness: 420, damping: 28 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
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
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-luxury-purple via-indigo-500 to-purple-400" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-luxury-purple" />
          <span className="text-[11px] font-black uppercase tracking-widest text-luxury-black">
            Smart Filters
          </span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-luxury-purple text-white text-[9px] font-black flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-400 hover:text-red-500 transition-colors"
          >
            <RotateCcw size={11} /> Clear All
          </button>
        )}
      </div>

      {/* Accordion sections */}
      <div className="px-5 pb-5 space-y-0 divide-y divide-gray-100">
        {SMART_FILTERS.map((group) => {
          const meta        = GROUP_META[group.id];
          const activeValue = activeFilters[group.id];
          const isOpen      = openSections[group.id];

          return (
            <div key={group.id}>
              <button
                onClick={() => toggle(group.id)}
                className="w-full flex items-center justify-between py-4 text-left group"
              >
                <span className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest text-luxury-black/70 group-hover:text-luxury-purple transition-colors">
                  <group.icon size={13} className={cn(meta.iconColor, "group-hover:scale-110 transition-transform")} />
                  {group.label}
                  {activeValue && (
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-black"
                      style={{ background: `linear-gradient(135deg, ${meta.activeFrom}, ${meta.activeTo})` }}
                    >
                      1
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={14}
                  className={cn("text-luxury-black/30 transition-transform duration-200", isOpen && "rotate-180")}
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
                    <div className="flex flex-wrap gap-2 pb-4">
                      {group.options.map((option) => {
                        const isSelected = activeValue === option;
                        return (
                          <motion.button
                            key={option}
                            onClick={() => onFilterChange(group.id, option)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "px-3 py-2 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5",
                              isSelected
                                ? "text-white border-transparent shadow-md"
                                : "bg-gray-50 border-gray-100 text-luxury-black/55 hover:border-gray-200 hover:text-luxury-black",
                            )}
                            style={isSelected ? {
                              background: `linear-gradient(135deg, ${meta.activeFrom}, ${meta.activeTo})`,
                              boxShadow: `0 4px 12px ${meta.glowColor}`,
                            } : {}}
                          >
                            <AnimatePresence mode="wait">
                              {isSelected && (
                                <motion.span
                                  key="check"
                                  initial={{ width: 0, opacity: 0 }}
                                  animate={{ width: 12, opacity: 1 }}
                                  exit={{ width: 0, opacity: 0 }}
                                  className="overflow-hidden flex items-center"
                                >
                                  <Check size={10} strokeWidth={3.5} />
                                </motion.span>
                              )}
                            </AnimatePresence>
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
