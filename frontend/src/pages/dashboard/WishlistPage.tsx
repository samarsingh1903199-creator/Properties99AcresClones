import { motion, AnimatePresence } from "framer-motion";
import { MOCK_PROPERTIES } from "@/src/constants/mockData";
import { useWishlistStore } from "@/src/store/useWishlistStore";
import { PropertyCard } from "@/src/components/ui/PropertyCard";
import { HeartOff } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Link } from "react-router-dom";
import { ROUTES } from "@/src/constants/routes";

export const WishlistPage = () => {
  const { savedPropertyIds } = useWishlistStore();
  const savedProperties = MOCK_PROPERTIES.filter((p) => savedPropertyIds.includes(p.id));

  return (
    <div className="bg-luxury-gray min-h-screen pt-32 pb-20 px-6 md:px-12">
      <div className="max-w-[1500px] mx-auto">
        <AnimatePresence mode="wait">
          {savedProperties.length > 0 ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {savedProperties.map((property, idx) => (
                <PropertyCard key={property.id} property={property} index={idx} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-40 text-center"
            >
              <div className="w-24 h-24 rounded-3xl bg-white border border-gray-100 flex items-center justify-center text-luxury-purple/20 mb-8 shadow-sm">
                <HeartOff size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-display font-black text-luxury-black mb-3 tracking-tight">No saved properties</h3>
              <p className="text-luxury-black/40 max-w-xs mb-10 text-sm font-medium leading-relaxed">
                Save properties you like by tapping the heart icon — they'll appear here.
              </p>
              <Link to={ROUTES.PROPERTIES}>
                <Button variant="premium" className="rounded-xl px-8 py-3 text-sm font-bold shadow-lg shadow-luxury-purple/20">
                  Browse Properties
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
