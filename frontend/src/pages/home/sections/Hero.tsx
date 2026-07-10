import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, ArrowRight, Search, ShieldCheck,
  BadgeCheck, MapPin, Flame,
} from "lucide-react";
import { ROUTES } from "@/src/constants/routes";
import { HomeHeader } from "./HomeHeader";
import { propertiesApi } from "@/src/services/api";
import { mapApiProperty } from "@/src/lib/listingCategory";
import type { Property } from "@/src/types";
import {
  HighlightedBannerCarousel,
  HighlightedBannerSkeleton,
} from "@/src/components/home/HighlightedBannerCarousel";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Verified listings" },
  { icon: BadgeCheck, label: "Dealer checked" },
  { icon: MapPin, label: "50+ cities" },
];

export const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [deals, setDeals] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    propertiesApi
      .listHighlighted({ limit: 8 })
      .then((res) => {
        if (cancelled) return;
        setDeals(res.data.map(mapApiProperty));
      })
      .catch((err) => {
        if (cancelled) return;
        setFetchError(err instanceof Error ? err.message : "Could not load featured deals");
        setDeals([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const handleSearch = () => {
    navigate(ROUTES.PROPERTIES);
  };

  return (
    <>
      <HomeHeader />

      <section className="hero-section hero-banner-section">
        {/* Full-width carousel banner */}
        {loading && <HighlightedBannerSkeleton />}

        {!loading && fetchError && (
          <div className="hero-banner-fallback">
            <Sparkles className="w-12 h-12 text-accent/30 mb-4" />
            <p className="text-lg font-semibold text-ink font-sans">Couldn&apos;t load featured deals</p>
            <p className="text-sm text-mute mt-1 font-sans">{fetchError}</p>
            <button type="button" onClick={handleSearch} className="btn-primary mt-6 font-sans">
              Browse all properties
            </button>
          </div>
        )}

        {!loading && !fetchError && deals.length === 0 && (
          <div className="hero-banner-fallback">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold mb-4 font-sans">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Featured picks coming soon
            </div>
            <h1 className="text-[clamp(2rem,5vw,3rem)] text-ink leading-tight tracking-tight mb-3 font-sans">
              Find a home <span className="gradient-text italic">you&apos;ll love</span>
            </h1>
            <p className="text-body max-w-md font-sans">
              Dealers are adding spotlight listings. Explore all properties in the meantime.
            </p>
            <button type="button" onClick={handleSearch} className="btn-primary mt-6 font-sans">
              Explore all properties
            </button>
          </div>
        )}

        {!loading && !fetchError && deals.length > 0 && (
          <HighlightedBannerCarousel properties={deals} />
        )}

        {/* Search strip below banner */}
        <div className="hero-banner-search-strip">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8 md:py-10">
            <div className="text-center max-w-2xl mx-auto mb-5">
              <p className="text-caption-mono text-mute mb-2 font-sans">Search the marketplace</p>
              <p className="text-lg font-semibold text-ink font-sans">
                {deals.length > 0
                  ? "Like what you see? Find more homes across 50+ cities"
                  : "Verified rentals and sales across 50+ cities"}
              </p>
            </div>

            <div className="hero-search-bar max-w-xl mx-auto mb-5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Search className="w-5 h-5 text-accent shrink-0 ml-1 hidden sm:block" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city, neighbourhood, or property…"
                  className="hero-search-input font-sans"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button type="button" onClick={handleSearch} className="btn-primary shrink-0 w-full sm:w-auto font-sans">
                Search <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="hero-trust-row justify-center mb-4">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <span key={label} className="trust-pill font-sans">
                  <Icon className="w-3.5 h-3.5 text-accent" />
                  {label}
                </span>
              ))}
            </div>

            <div className="text-center">
              <Link
                to={ROUTES.PROPERTIES}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-deep transition-colors font-sans"
              >
                View all listings <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
