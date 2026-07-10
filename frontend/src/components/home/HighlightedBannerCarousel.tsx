import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles, MapPin, BedDouble, Bath, Maximize2,
  ArrowRight, Key, Home, Flame, ChevronLeft, ChevronRight, ImageOff,
} from "lucide-react";
import { Property } from "@/src/types";
import { ROUTES } from "@/src/constants/routes";
import { cn, formatCurrency, formatMonthlyRent, toTitleCase } from "@/src/lib/utils";

const AUTOPLAY_MS = 3000;

interface HighlightedBannerCarouselProps {
  properties: Property[];
}

function BannerSlideContent({ property }: { property: Property }) {
  const isRent = property.listingType === "rent";
  const isLease = property.listingType === "lease";
  const listingLabel = isRent ? "For Rent" : isLease ? "For Lease" : "For Sale";
  const priceLabel = isRent
    ? formatMonthlyRent(property.rent || property.price)
    : formatCurrency(property.price);

  return (
    <div className="hero-banner-content">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="hero-banner-copy"
      >
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="hero-banner-badge">
            <Sparkles className="w-3.5 h-3.5" />
            Featured deal
          </span>
          <span className={cn(
            "hero-banner-listing-pill",
            isRent ? "hero-banner-listing-rent" : isLease ? "hero-banner-listing-lease" : "hero-banner-listing-sale",
          )}>
            {isRent ? <Key className="w-3 h-3" /> : <Home className="w-3 h-3" />}
            {listingLabel}
          </span>
          <span className="hero-banner-hot">
            <Flame className="w-3 h-3" />
            Hot pick
          </span>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300/90 mb-2 font-sans">
          {toTitleCase(property.type ?? "Property")}
        </p>

        <h2 className="hero-banner-title font-sans">{property.title}</h2>

        <div className="flex items-center gap-1.5 text-white/75 mb-5 font-sans">
          <MapPin className="w-4 h-4 shrink-0 text-amber-300/80" />
          <span className="text-sm md:text-base">{property.location}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-white/80 mb-6 font-sans">
          <span className="inline-flex items-center gap-1.5">
            <BedDouble className="w-4 h-4 text-amber-300/70" />
            {property.beds} Beds
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-amber-300/70" />
            {property.baths} Baths
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-amber-300/70" />
            {property.sqft?.toLocaleString()} sq.ft
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1 font-sans">Starting at</p>
            <p className="text-3xl md:text-4xl font-display text-white leading-none">{priceLabel}</p>
          </div>
          <Link to={ROUTES.PROPERTY_DETAILS(property.id)} className="hero-banner-cta font-sans">
            Grab this deal
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export function HighlightedBannerCarousel({ properties }: HighlightedBannerCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const count = properties.length;

  const goTo = useCallback((next: number) => {
    if (count === 0) return;
    setIndex(((next % count) + count) % count);
  }, [count]);

  const pauseBriefly = useCallback(() => {
    setPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setPaused(false), AUTOPLAY_MS * 2);
  }, []);

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  /* Stable autoplay — functional setState avoids stale index in interval */
  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  useEffect(() => () => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { pauseBriefly(); goPrev(); }
      if (e.key === "ArrowRight") { pauseBriefly(); goNext(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, pauseBriefly]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(delta) > 50) {
      pauseBriefly();
      if (delta < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const current = properties[index];

  return (
    <div
      className="hero-banner-carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Highlighted property deals"
    >
      <div className="hero-banner-viewport">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="hero-banner-slide"
          >
            {current.images[0] ? (
              <img
                src={current.images[0]}
                alt={current.title}
                className="hero-banner-bg hero-banner-bg-zoom"
              />
            ) : (
              <div className="hero-banner-bg hero-banner-bg-fallback">
                <ImageOff className="w-16 h-16 text-white/20" />
              </div>
            )}

            <div className="hero-banner-overlay" />
            <div className="hero-banner-overlay-accent" />

            <div className="hero-banner-inner">
              <BannerSlideContent property={current} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => { pauseBriefly(); goPrev(); }}
            className="hero-banner-nav hero-banner-nav-prev"
            aria-label="Previous featured property"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => { pauseBriefly(); goNext(); }}
            className="hero-banner-nav hero-banner-nav-next"
            aria-label="Next featured property"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="hero-banner-dots" role="tablist" aria-label="Choose slide">
            {properties.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}: ${p.title}`}
                onClick={() => { pauseBriefly(); goTo(i); }}
                className={cn("hero-banner-dot", i === index && "hero-banner-dot-active")}
              />
            ))}
          </div>

          <div className="hero-banner-counter font-sans" aria-live="polite">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </div>

          <div className="hero-banner-progress" aria-hidden>
            <div
              key={current.id}
              className={cn("hero-banner-progress-bar", paused && "hero-banner-progress-paused")}
              style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function HighlightedBannerSkeleton() {
  return (
    <div className="hero-banner-carousel hero-banner-carousel-loading">
      <div className="hero-banner-slide animate-pulse">
        <div className="hero-banner-bg bg-accent-soft/30" />
        <div className="hero-banner-overlay" />
        <div className="hero-banner-inner">
          <div className="hero-banner-content max-w-xl space-y-4">
            <div className="h-8 w-40 rounded-full bg-white/10" />
            <div className="h-12 w-full rounded-lg bg-white/10" />
            <div className="h-5 w-2/3 rounded bg-white/10" />
            <div className="h-10 w-48 rounded-full bg-white/10 mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
