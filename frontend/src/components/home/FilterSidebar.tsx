import { Button } from "@/src/components/ui/Button";
import { ChevronDown, Check, SlidersHorizontal, MapPin, DollarSign, Zap, Search, X, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FilterSidebarProps {
  onClose?: () => void;
  isOpen?: boolean;
}

export const FilterSidebar = ({ onClose, isOpen }: FilterSidebarProps) => {
  const [activeSections, setActiveSections] = useState<string[]>(["budget", "type", "proximity"]);
  const [priceRange, setPriceRange] = useState([50, 2500]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(3);

  const toggleSection = (id: string) => {
    setActiveSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const FilterSection = ({ 
    id, 
    title, 
    children 
  }: { 
    id: string, 
    title: string, 
    children: React.ReactNode 
  }) => {
    const isExpanded = activeSections.includes(id);
    
    return (
      <div className="border-b border-luxury-purple/5 last:border-0 overflow-hidden">
        <button 
          onClick={() => toggleSection(id)}
          className="flex items-center justify-between w-full py-6 px-8 group hover:bg-luxury-purple/[0.02] transition-colors"
        >
          <span className="text-[12px] font-black uppercase tracking-[0.25em] text-luxury-black/50 group-hover:text-luxury-purple transition-colors">
            {title}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <ChevronDown className="w-5 h-5 text-luxury-black/30 group-hover:text-luxury-purple transition-colors" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="px-8 pb-8 pt-2 space-y-6">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const FilterChip = ({ label, active, onClick }: { label: string, active?: boolean, onClick?: () => void }) => (
    <button
      onClick={onClick}
      className={cn(
        "px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider border transition-all duration-300 whitespace-nowrap shrink-0",
        active 
          ? "bg-luxury-purple text-white border-luxury-purple shadow-xl shadow-luxury-purple/25" 
          : "bg-white border-luxury-purple/10 text-luxury-black/50 hover:border-luxury-purple/30 hover:scale-[1.02]"
      )}
    >
      {label}
    </button>
  );

  const Checkbox = ({ label, count, checked }: { label: string, count?: string, checked?: boolean }) => (
    <label className="flex items-center justify-between group cursor-pointer py-2 px-3 -mx-3 rounded-2xl hover:bg-luxury-purple/5 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-6 h-6 rounded-xl border flex items-center justify-center transition-all duration-500",
          checked 
            ? "bg-luxury-purple border-luxury-purple shadow-lg shadow-luxury-purple/20 scale-110" 
            : "bg-white border-luxury-purple/15 group-hover:border-luxury-purple/40"
        )}>
          {checked && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-4 h-4 text-white stroke-[3]" /></motion.div>}
        </div>
        <span className={cn(
          "text-base font-bold transition-colors",
          checked ? "text-luxury-black" : "text-luxury-black/60 group-hover:text-luxury-black"
        )}>{label}</span>
      </div>
      {count && <span className="text-[11px] font-bold text-luxury-black/30 font-mono tracking-tighter bg-luxury-purple/5 px-2 py-1 rounded-lg">{count}</span>}
    </label>
  );

  return (
    <div className="w-full bg-white h-full flex flex-col relative overflow-hidden">
      {/* Sticky Header */}
      <div className="shrink-0 flex items-center justify-between px-8 py-8 border-b border-luxury-purple/5 bg-white/90 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1.25rem] bg-luxury-purple/10 flex items-center justify-center text-luxury-purple shadow-inner">
            <Filter size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-display font-black text-xl uppercase tracking-tighter text-luxury-black">Refinement</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-luxury-purple animate-pulse" />
              <p className="text-[11px] font-black text-luxury-black/40 uppercase tracking-[0.15em] leading-none">
                {activeFiltersCount} Modules Active
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[11px] font-black uppercase tracking-widest text-luxury-purple hover:bg-luxury-purple/5 px-4 h-10 rounded-xl"
          >
            Reset
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="w-10 h-10 rounded-xl bg-luxury-purple/5 hover:bg-luxury-purple/10 transition-colors">
              <X size={20} className="text-luxury-purple" />
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg-main)]/30 px-2">
        <div className="pt-4 pb-2">
            {/* Search Input Section */}
            <div className="mx-4 mb-4">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-black/30 group-focus-within:text-luxury-purple transition-all duration-300" />
                <input 
                  type="text" 
                  placeholder="Seach nodes, builders, cities..."
                  className="w-full bg-white border border-luxury-purple/10 rounded-[1.5rem] py-5 pl-14 pr-6 text-base font-bold focus:outline-none focus:ring-4 focus:ring-luxury-purple/5 focus:border-luxury-purple/40 transition-all placeholder:text-luxury-black/20 shadow-sm"
                />
              </div>
            </div>

            <FilterSection id="budget" title="Global Budget">
              <div className="pt-4">
                <div className="h-3 w-full bg-luxury-purple/5 rounded-full relative mb-12">
                  <div className="absolute left-[10%] right-[30%] h-full bg-linear-to-r from-luxury-purple to-luxury-purple/80 rounded-full shadow-lg shadow-luxury-purple/20" />
                  <motion.div 
                    whileHover={{ scale: 1.25 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 280 }}
                    className="absolute left-[10%] -top-1.5 w-6 h-6 bg-white border-4 border-luxury-purple rounded-full cursor-grab active:cursor-grabbing shadow-xl z-10 hover:border-luxury-purple ring-8 ring-luxury-purple/5" 
                  />
                  <motion.div 
                    whileHover={{ scale: 1.25 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 280 }}
                    className="absolute right-[30%] -top-1.5 w-6 h-6 bg-white border-4 border-luxury-purple rounded-full cursor-grab active:cursor-grabbing shadow-xl z-10 hover:border-luxury-purple ring-8 ring-luxury-purple/5" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-3xl bg-white border border-luxury-purple/5 shadow-sm group hover:border-luxury-purple/20 transition-all">
                    <p className="text-[10px] font-black text-luxury-black/40 uppercase tracking-widest mb-2">Lower Limit</p>
                    <div className="flex items-center gap-2 font-display font-bold">
                      <span className="text-luxury-purple text-lg">₹</span>
                      <input type="text" defaultValue="500,000" className="w-full bg-transparent focus:outline-none text-lg text-luxury-black" />
                    </div>
                  </div>
                  <div className="p-5 rounded-3xl bg-white border border-luxury-purple/5 shadow-sm group hover:border-luxury-purple/20 transition-all">
                    <p className="text-[10px] font-black text-luxury-black/40 uppercase tracking-widest mb-2">Upper Limit</p>
                    <div className="flex items-center gap-2 font-display font-bold">
                      <span className="text-luxury-purple text-lg">₹</span>
                      <input type="text" defaultValue="2,500,000" className="w-full bg-transparent focus:outline-none text-lg text-luxury-black" />
                    </div>
                  </div>
                </div>
              </div>
            </FilterSection>

            <FilterSection id="proximity" title="Network Proximity">
              <div className="flex flex-wrap gap-3 pt-2">
                {['Global', '5KM', '10KM', '25KM', '50KM'].map(km => (
                  <FilterChip 
                    key={km} 
                    label={km} 
                    active={km === '10KM'} 
                  />
                ))}
              </div>
              <p className="text-[10px] text-luxury-black/40 font-bold uppercase tracking-[0.12em] mt-4 flex items-center gap-2">
                <MapPin size={14} className="text-luxury-purple" />
                Active synchronization radius
              </p>
            </FilterSection>

            <FilterSection id="type" title="Architecture Type">
              <div className="space-y-2">
                <Checkbox label="Luxury Apartments" count="482" checked />
                <Checkbox label="Penthouse Suites" count="24" />
                <Checkbox label="Standalone Villas" count="156" checked />
                <Checkbox label="Smart Townships" count="89" />
                <Checkbox label="Raw Plots" count="42" />
              </div>
            </FilterSection>

            <FilterSection id="bedrooms" title="Structural Units">
              <div className="grid grid-cols-5 gap-2 pt-2">
                {['1', '2', '3', '4', '5+'].map(num => (
                  <button 
                    key={num}
                    className={cn(
                      "h-14 rounded-2xl flex items-center justify-center font-display font-black text-base transition-all border-2",
                      num === '3' 
                        ? "bg-luxury-purple text-white border-luxury-purple shadow-xl shadow-luxury-purple/20" 
                        : "bg-white border-luxury-purple/10 text-luxury-black/40 hover:border-luxury-purple/30 hover:scale-105"
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-luxury-black/40 font-bold uppercase tracking-[0.12em] mt-4">Unit configuration node selection</p>
            </FilterSection>

            <FilterSection id="amenities" title="Advanced Modules">
              <div className="space-y-2">
                <Checkbox label="Infinite Pool Access" checked />
                <Checkbox label="Home Automation" checked />
                <Checkbox label="Private EV Port" />
                <Checkbox label="Rooftop Heli-pad" />
                <Checkbox label="Quantum Security" />
                <Checkbox label="Biodome Garden" />
              </div>
            </FilterSection>

            <FilterSection id="furnishing" title="Interior Spec">
              <div className="flex flex-wrap gap-3 pt-2">
                {['Bare Shell', 'Semi-Fitted', 'Full Luxury', 'Designer'].map(opt => (
                  <FilterChip key={opt} label={opt} active={opt === 'Full Luxury'} />
                ))}
              </div>
            </FilterSection>

            <FilterSection id="availability" title="Availability">
              <div className="flex items-center p-2 bg-luxury-purple/5 rounded-[1.5rem] border border-luxury-purple/10">
                <button className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest bg-white rounded-2xl shadow-md text-luxury-purple">Ready Nodes</button>
                <button className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-luxury-black/40 hover:text-luxury-purple transition-colors">Off-Plan</button>
              </div>
            </FilterSection>

            <FilterSection id="advanced" title="Verification Nodes">
              <div className="space-y-2">
                <Checkbox label="Vastu Compliant" />
                <Checkbox label="RERA Approved" checked />
                <Checkbox label="Corner Plot" />
                <Checkbox label="Lake Facing" />
              </div>
            </FilterSection>
        </div>

        {/* Padding for scroll overlap with footer */}
        <div className="h-32" />
      </div>

      {/* Sticky Bottom Actions */}
      <div className="shrink-0 p-8 bg-white border-t border-luxury-purple/5 shadow-[0_-20px_50px_rgba(91,33,182,0.08)] z-20">
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            className="flex-1 h-16 rounded-3xl text-[12px] font-black uppercase tracking-[0.25em] text-luxury-black/40 hover:bg-luxury-purple/5"
          >
            Reset
          </Button>
          <Button 
            variant="premium" 
            className="flex-[2.5] h-16 rounded-3xl text-[12px] font-black uppercase tracking-[0.25em] shadow-2xl shadow-luxury-purple/30 group active:scale-95 transition-all"
          >
            Synchronize
            <Zap className="ml-3 w-5 h-5 fill-white animate-pulse" />
          </Button>
        </div>
      </div>
    </div>
  );
};


