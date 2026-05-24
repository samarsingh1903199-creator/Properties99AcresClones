import { motion } from "framer-motion";
import { useState } from "react";
import { SpecialistCard } from "@/src/components/specialists/SpecialistCard";
import { MOCK_SPECIALISTS } from "@/src/constants/mockData";
import { Search, SlidersHorizontal, LayoutGrid, List, MapPin } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";

export const SpecialistsListing = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpecialists = MOCK_SPECIALISTS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.specialization.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* View Toggle */}
        <div className="flex items-center justify-between mb-8">
            <p className="text-xs font-bold text-[var(--text-main)]/40 uppercase tracking-widest">
                Showing {filteredSpecialists.length} Specialists in Sector 7
            </p>
            <div className="flex items-center p-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-[var(--bg-main)] text-luxury-purple shadow-sm" : "text-[var(--text-main)]/30")}
                >
                    <LayoutGrid size={18} />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-[var(--bg-main)] text-luxury-purple shadow-sm" : "text-[var(--text-main)]/30")}
                >
                    <List size={18} />
                </button>
            </div>
        </div>

        {/* Listing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredSpecialists.map((spec, idx) => (
                <SpecialistCard key={spec.id} specialist={spec} index={idx} />
            ))}
        </div>

        {/* Empty State */}
        {filteredSpecialists.length === 0 && (
            <div className="py-32 text-center">
                <div className="w-20 h-20 bg-[var(--glass-bg)] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <Search className="w-8 h-8 text-[var(--text-main)]/20" />
                </div>
                <h3 className="text-2xl font-bold font-display mb-2">No Specialists Found</h3>
                <p className="text-luxury-black/40 max-w-xs mx-auto">Try adjusting your filters or search keywords to find an advisor.</p>
                <Button variant="premium" className="mt-8 rounded-xl" onClick={() => setSearchQuery("")}>
                    Reset Search
                </Button>
            </div>
        )}
      </div>
    </div>
  );
};
