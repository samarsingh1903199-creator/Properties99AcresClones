import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/src/constants/routes";
import { POPULAR_CITIES } from "@/src/constants/cityImages";

function CityCardImage({
  src,
  fallback,
  alt,
}: {
  src: string;
  fallback?: string;
  alt: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasFailed, setHasFailed] = useState(false);

  if (hasFailed) {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-accent/15 via-accent/25 to-accent-deep/35 flex items-center justify-center"
        aria-hidden
      >
        <MapPin className="w-8 h-8 text-accent/35" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      onError={() => {
        if (fallback && currentSrc !== fallback) {
          setCurrentSrc(fallback);
          return;
        }
        setHasFailed(true);
      }}
    />
  );
}

export const PopularCities = () => {
  const navigate = useNavigate();

  return (
    <section className="home-cities-section">
      <div className="page-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div className="max-w-xl">
            <p className="text-eyebrow mb-2">Top destinations</p>
            <h2 className="text-display-lg text-ink mb-3">Explore properties by city</h2>
            <p className="text-body-md text-body">
              From bustling metros to serene suburbs — find verified homes in India&apos;s most sought-after locations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.PROPERTIES)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-deep transition-colors font-sans shrink-0"
          >
            View all cities
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {POPULAR_CITIES.map(({ name, tagline, count, image, fallbackImage }, i) => (
            <motion.button
              key={name}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              onClick={() => navigate(ROUTES.PROPERTIES)}
              className="home-city-card group text-left"
            >
              <div className="home-city-card-image">
                <CityCardImage src={image} fallback={fallbackImage} alt={`${name} skyline`} />
                <div className="home-city-card-overlay" />
              </div>
              <div className="home-city-card-body">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-medium text-ink font-sans">{name}</h3>
                    <p className="text-sm text-body mt-0.5 font-sans">{tagline}</p>
                  </div>
                  <span className="home-city-count font-sans">{count}</span>
                </div>
                <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity font-sans">
                  <MapPin className="w-3 h-3" /> Explore listings
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};
