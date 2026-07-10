import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { SpecialistCard } from "@/src/components/specialists/SpecialistCard";
import { Search, LayoutGrid, List, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { dealersApi } from "@/src/services/api";
import { mapDealerToSpecialist } from "@/src/lib/mapDealerToSpecialist";

export const SpecialistsListing = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [dealers, setDealers] = useState<ReturnType<typeof mapDealerToSpecialist>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    dealersApi
      .listPublic()
      .then(res => setDealers(res.data.map((d, i) => mapDealerToSpecialist(d, i))))
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load dealers"))
      .finally(() => setLoading(false));
  }, []);

  const filteredDealers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return dealers;
    return dealers.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.company.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      d.specialization.some(s => s.toLowerCase().includes(q)),
    );
  }, [dealers, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-10">
          <p className="text-caption-mono text-mute mb-2">Verified network</p>
          <h1 className="text-display-lg text-ink">Dealers</h1>
          <p className="text-body-sm text-body mt-2 max-w-xl">
            Browse verified property dealers and explore their active listings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Search dealers by name or company…"
              className="form-input-lg pl-10 w-full"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <p className="text-xs font-bold text-[var(--text-main)]/40 uppercase tracking-widest">
              {loading ? "Loading dealers…" : `Showing ${filteredDealers.length} dealer${filteredDealers.length === 1 ? "" : "s"}`}
            </p>
            <div className="flex items-center p-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-[var(--bg-main)] text-luxury-purple shadow-sm" : "text-[var(--text-main)]/30")}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-[var(--bg-main)] text-luxury-purple shadow-sm" : "text-[var(--text-main)]/30")}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-sm text-body">Loading dealers…</p>
          </div>
        )}

        {!loading && error && (
          <div className="py-16 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className={cn(
            "grid gap-8",
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1",
          )}>
            {filteredDealers.map((dealer, idx) => (
              <SpecialistCard key={dealer.id} specialist={dealer} index={idx} />
            ))}
          </div>
        )}

        {!loading && !error && filteredDealers.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-[var(--glass-bg)] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
              <Search className="w-8 h-8 text-[var(--text-main)]/20" />
            </div>
            <h3 className="text-2xl font-bold font-display mb-2">No Dealers Found</h3>
            <p className="text-luxury-black/40 max-w-xs mx-auto">Try adjusting your search to find a dealer.</p>
            <Button variant="premium" className="mt-8 rounded-xl" onClick={() => setSearchQuery("")}>
              Reset Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
