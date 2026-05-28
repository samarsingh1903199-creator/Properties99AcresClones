import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useWishlistStore } from "@/src/store/useWishlistStore";
import { useAuthStore } from "@/src/store/useAuthStore";
import { likedApi, propertiesApi, type ApiProperty } from "@/src/services/api";
import { PropertyCard } from "@/src/components/ui/PropertyCard";
import { Button } from "@/src/components/ui/Button";
import { ROUTES } from "@/src/constants/routes";

const WishlistCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
    <div className="h-52 bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
      <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
      <div className="flex gap-4 pt-2 border-t border-gray-100">
        <div className="h-3 bg-gray-100 rounded w-12" />
        <div className="h-3 bg-gray-100 rounded w-12" />
        <div className="h-3 bg-gray-100 rounded w-16" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-8 bg-gray-100 rounded-xl flex-1" />
        <div className="h-8 bg-gray-200 rounded-xl flex-1" />
      </div>
    </div>
  </div>
);

const EmptyWishlist = () => (
  <motion.div
    key="empty"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center py-32 text-center"
  >
    <div className="mb-10 relative">
      <div className="w-48 h-48 rounded-full bg-luxury-purple/5 flex items-center justify-center">
        <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-36 h-36">
          <rect x="30" y="80" width="100" height="65" rx="6" fill="#f3f0ff" stroke="#7c3aed" strokeWidth="3" />
          <path d="M18 82 L80 28 L142 82" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="#ede9fe" />
          <rect x="64" y="110" width="32" height="35" rx="4" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="2" />
          <circle cx="90" cy="129" r="3" fill="#7c3aed" />
          <rect x="38" y="90" width="22" height="20" rx="3" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
          <line x1="49" y1="90" x2="49" y2="110" stroke="#7c3aed" strokeWidth="1.5" />
          <line x1="38" y1="100" x2="60" y2="100" stroke="#7c3aed" strokeWidth="1.5" />
          <rect x="100" y="90" width="22" height="20" rx="3" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
          <line x1="111" y1="90" x2="111" y2="110" stroke="#7c3aed" strokeWidth="1.5" />
          <line x1="100" y1="100" x2="122" y2="100" stroke="#7c3aed" strokeWidth="1.5" />
          <path d="M80 58 C80 58 71 49 66 54 C61 59 66 66 80 73 C94 66 99 59 94 54 C89 49 80 58 80 58Z" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="22" cy="50" r="3" fill="#7c3aed" opacity="0.3" />
          <circle cx="138" cy="42" r="2" fill="#7c3aed" opacity="0.4" />
          <circle cx="148" cy="65" r="4" fill="#7c3aed" opacity="0.2" />
          <circle cx="12" cy="75" r="2.5" fill="#7c3aed" opacity="0.25" />
        </svg>
      </div>
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-luxury-purple/10 flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" fill="#7c3aed" className="w-4 h-4" opacity="0.6">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </motion.div>
      <motion.div
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -bottom-1 -left-3 w-6 h-6 rounded-full bg-luxury-purple/8 flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" fill="#7c3aed" className="w-3 h-3" opacity="0.4">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </motion.div>
    </div>
    <h3 className="text-2xl font-display font-black text-luxury-black mb-3 tracking-tight">
      Your wishlist is empty
    </h3>
    <p className="text-luxury-black/40 max-w-xs mb-10 text-sm font-medium leading-relaxed">
      Tap the heart icon on any property to save it here. Your dream home is just a click away.
    </p>
    <Link to={ROUTES.PROPERTIES}>
      <Button variant="premium" className="rounded-xl px-8 py-3 text-sm font-bold shadow-lg shadow-luxury-purple/20">
        Browse Properties
      </Button>
    </Link>
  </motion.div>
);

export const WishlistPage = () => {
  const { token, isAuthenticated } = useAuthStore();
  const { savedPropertyIds, syncFromServer } = useWishlistStore();

  // Cache of id -> full property data. Populated on mount + when new IDs appear.
  const [propertiesCache, setPropertiesCache] = useState<Record<string, ApiProperty>>({});
  const [loading, setLoading] = useState(true);

  // Track which IDs we've already fetched so we don't double-request
  const fetchedIds = useRef<Set<string>>(new Set());

  // On mount: sync IDs from server + bulk-fetch all liked properties
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    syncFromServer(token);

    likedApi.getProperties(token)
      .then((res) => {
        const cache: Record<string, ApiProperty> = {};
        res.data.forEach((p) => {
          cache[p._id] = p;
          fetchedIds.current.add(p._id);
        });
        setPropertiesCache(cache);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  // When savedPropertyIds gains new IDs (property added from another page),
  // fetch the missing property data and add it to the cache.
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const missing = savedPropertyIds.filter((id) => !fetchedIds.current.has(id));
    if (missing.length === 0) return;

    missing.forEach((id) => {
      fetchedIds.current.add(id); // mark immediately to prevent double-fetch
      propertiesApi.getPublic(id)
        .then((res) => {
          setPropertiesCache((prev) => ({ ...prev, [id]: res.data }));
        })
        .catch(() => {
          fetchedIds.current.delete(id); // allow retry on failure
        });
    });
  }, [savedPropertyIds, isAuthenticated, token]);

  // Derived list — always in sync with savedPropertyIds (real-time add/remove)
  const displayedProperties = savedPropertyIds
    .map((id) => propertiesCache[id])
    .filter(Boolean) as ApiProperty[];

  return (
    <div className="bg-luxury-gray min-h-screen pt-32 pb-20 px-6 md:px-12">
      <div className="max-w-[1500px] mx-auto">

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-black text-luxury-black tracking-tight">
            Saved Properties
          </h1>
          {!loading && displayedProperties.length > 0 && (
            <p className="text-luxury-black/40 text-sm font-medium mt-2">
              {displayedProperties.length} {displayedProperties.length === 1 ? "property" : "properties"} saved
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <WishlistCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {displayedProperties.length > 0 ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                <AnimatePresence>
                  {displayedProperties.map((property, idx) => (
                    <motion.div
                      key={property._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <PropertyCard
                        property={{
                          id: property._id,
                          title: property.title,
                          type: property.type,
                          listingType: property.listingType === "sale" ? "buy" : "rent",
                          price: property.price,
                          sqft: property.area,
                          beds: property.bedrooms,
                          baths: property.bathrooms,
                          location: `${property.location}, ${property.city}`,
                          description: property.description,
                          images: property.images,
                          status: property.status,
                          features: [],
                          agentId: property.ownerId,
                        }}
                        index={idx}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <EmptyWishlist />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
