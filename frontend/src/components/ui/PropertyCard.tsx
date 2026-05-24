import { MapPin, Bed, Bath, Ruler, ShieldCheck } from "lucide-react";
import { Property } from "@/src/types";
import { useState } from "react";
import { cn, formatCurrency, formatMonthlyRent, toTitleCase } from "@/src/lib/utils";
import { Link } from "react-router-dom";
import { ROUTES } from "@/src/constants/routes";
import { VideoPlayer } from "./VideoPlayer";
import { useWishlistStore } from "@/src/store/useWishlistStore";
import { WishlistButton } from "./WishlistButton";

interface PropertyCardProps {
  property: Property;
  index: number;
}

export const PropertyCard = ({ property, index }: PropertyCardProps) => {
  void index;
  const [isHovered, setIsHovered] = useState(false);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(property.id));
  const isRent = property.listingType === "rent";
  const sellerLabel = property.ownershipType?.toLowerCase().includes("owner") ? "By Owner" : "By Dealer";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-full"
    >
      <div className="bg-white rounded-2xl overflow-hidden h-full flex flex-col border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-luxury-purple/8 hover:-translate-y-1 transition-all duration-200 active:scale-[0.99]">

        {/* ── Media ── */}
        <div className="relative h-52 overflow-hidden shrink-0">
          {property.previewVideoUrl ? (
            <VideoPlayer
              src={property.previewVideoUrl}
              poster={property.images[0]}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              autoplay={true}
              onHoverMute={true}
            />
          ) : (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}

          {/* scrim */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/5 pointer-events-none" />

          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 pr-14">
            <div className="px-2.5 py-1 rounded-lg bg-luxury-purple/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {sellerLabel}
            </div>

            {property.verified && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-bold text-luxury-black shadow-sm">
                <ShieldCheck size={10} className="text-luxury-purple" />
                Verified
              </div>
            )}
          </div>

          {/* wishlist */}
          <WishlistButton
            propertyId={property.id}
            variant="floating"
            className={cn(
              "absolute top-3 right-3 z-20 transition-all duration-300",
              (!isInWishlist && !isHovered) && "opacity-0 scale-75"
            )}
          />

          {/* price overlay at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8 bg-linear-to-t from-black/75 to-transparent">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-display font-black text-white tracking-tight">
                {isRent ? formatMonthlyRent(property.rent || property.price) : formatCurrency(property.price)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Details ── */}
        <div className="p-4 flex flex-col gap-2.5 flex-1">

          {/* Title */}
          <Link to={ROUTES.PROPERTY_DETAILS(property.id)}>
            <h3 className="text-[15px] font-display font-bold leading-snug tracking-tight text-luxury-black group-hover:text-luxury-purple transition-colors line-clamp-1">
              {toTitleCase(property.title)}
            </h3>
          </Link>

          {/* Location */}
          <div className="flex items-start gap-1.5">
            <MapPin size={12} className="mt-0.5 shrink-0 text-luxury-purple/60" />
            <span className="text-[12px] text-luxury-black/50 font-medium leading-snug line-clamp-2">
              {toTitleCase(property.location)}
            </span>
          </div>

          {/* Quick specs + CTA */}
          <div className="flex items-center gap-2.5 pt-2.5 mt-auto border-t border-gray-100">
            <span className="flex items-center gap-1 text-[11px] text-luxury-black/45 font-semibold">
              <Bed size={11} className="text-luxury-black/25" />
              {property.beds} BHK
            </span>
            <span className="text-luxury-black/15 text-xs">·</span>
            <span className="flex items-center gap-1 text-[11px] text-luxury-black/45 font-semibold">
              <Bath size={11} className="text-luxury-black/25" />
              {property.baths} Bath
            </span>
            <span className="text-luxury-black/15 text-xs">·</span>
            <span className="flex items-center gap-1 text-[11px] text-luxury-black/45 font-semibold">
              <Ruler size={11} className="text-luxury-black/25" />
              {property.sqft} sqft
            </span>

            <Link to={ROUTES.PROPERTY_DETAILS(property.id)} className="ml-auto shrink-0">
              <div className="px-3 py-1.5 rounded-lg bg-luxury-purple text-white text-[10px] font-bold uppercase tracking-wider shadow-sm shadow-luxury-purple/20 hover:bg-luxury-purple/90 hover:scale-105 active:scale-95 transition-all duration-200">
                {isRent ? "Book" : "View"}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
