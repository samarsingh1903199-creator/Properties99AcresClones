import { MapPin, Bed, Bath, Ruler, ShieldCheck, Home, Heart, Users, User, UserCheck, Briefcase, Eye, CalendarCheck, Key } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Property } from "@/src/types";
import { useState } from "react";
import { cn, formatCurrency, formatMonthlyRent, toTitleCase } from "@/src/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/src/constants/routes";
import { VideoPlayer } from "./VideoPlayer";
import { useWishlistStore } from "@/src/store/useWishlistStore";
import { WishlistButton } from "./WishlistButton";

const TENANT_CHIP: Record<string, { pill: string; Icon: LucideIcon }> = {
  "Family":                { pill: "bg-accent-soft text-accent border-accent/15",     Icon: Home },
  "Couples":               { pill: "bg-accent-soft/70 text-accent border-accent/10",  Icon: Heart },
  "Girls":                 { pill: "bg-accent-soft text-accent border-accent/15",     Icon: Users },
  "Boys":                  { pill: "bg-accent-soft/70 text-accent border-accent/10",  Icon: User },
  "Independent":           { pill: "bg-canvas-soft text-body border-hairline",         Icon: UserCheck },
  "Working Professionals": { pill: "bg-canvas-soft text-body border-hairline",         Icon: Briefcase },
};

const MAX_VISIBLE_CHIPS = 2;

interface PropertyCardProps {
  property: Property;
  index: number;
}

export const PropertyCard = ({ property, index }: PropertyCardProps) => {
  void index;
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(property.id));
  const isRent = property.listingType === "rent";
  const isLease = property.listingType === "lease";
  const sellerLabel = property.ownershipType?.toLowerCase().includes("owner") ? "By owner" : "By dealer";
  const tenantTypes = property.tenantTypes ?? [];
  const visibleTenants = tenantTypes.slice(0, MAX_VISIBLE_CHIPS);
  const extraCount = tenantTypes.length - MAX_VISIBLE_CHIPS;
  const priceLabel = isRent ? formatMonthlyRent(property.rent || property.price) : formatCurrency(property.price);
  const listingBadge = isRent ? "Rent" : isLease ? "Lease" : "Sale";

  const handleBookNow = () => {
    navigate(ROUTES.PROPERTY_DETAILS(property.id), { state: { openBook: true } });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-full"
    >
      <div className="card-marketing overflow-hidden h-full flex flex-col rounded-2xl hover:shadow-elevated-4 hover:-translate-y-1 transition-all duration-300">

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden shrink-0 bg-accent-soft/30">
          {property.previewVideoUrl ? (
            <VideoPlayer
              src={property.previewVideoUrl}
              poster={property.images[0]}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              autoplay={true}
              onHoverMute={true}
            />
          ) : (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-accent-deep/50 via-transparent to-transparent pointer-events-none" />

          <div className="absolute top-3 left-3 z-10 flex gap-1.5">
            <span className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md",
              "bg-accent text-on-primary"
            )}>
              {isRent ? <Key className="w-3 h-3" /> : <Home className="w-3 h-3" />}
              {listingBadge}
            </span>
            {property.verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-canvas/95 backdrop-blur-md text-accent border border-accent/15">
                <ShieldCheck size={11} /> Verified
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-block px-3 py-1.5 rounded-lg bg-canvas/95 backdrop-blur-md text-lg font-bold text-accent shadow-elevated-2">
              {priceLabel}
            </span>
          </div>

          <WishlistButton
            propertyId={property.id}
            variant="floating"
            className={cn(
              "absolute top-3 right-3 z-20 transition-all duration-300",
              (!isInWishlist && !isHovered) && "opacity-0 scale-90"
            )}
          />
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-mute uppercase tracking-wide">{sellerLabel}</span>
          </div>

          <Link to={ROUTES.PROPERTY_DETAILS(property.id)}>
            <h3 className="text-base font-semibold leading-snug text-accent group-hover:text-accent-deep transition-colors line-clamp-2">
              {toTitleCase(property.title)}
            </h3>
          </Link>

          <div className="flex items-center gap-1.5 text-body-sm text-body">
            <MapPin size={14} className="shrink-0 text-accent" />
            <span className="line-clamp-1">{toTitleCase(property.location)}</span>
          </div>

          <div className="flex items-center gap-4 py-2 border-y border-hairline text-sm text-body">
            <span className="flex items-center gap-1.5"><Bed size={15} className="text-accent" /> {property.beds} BHK</span>
            <span className="flex items-center gap-1.5"><Bath size={15} className="text-accent" /> {property.baths}</span>
            <span className="flex items-center gap-1.5"><Ruler size={15} className="text-accent" /> {property.sqft} sqft</span>
          </div>

          {visibleTenants.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {visibleTenants.map(t => {
                const cfg = TENANT_CHIP[t];
                return cfg ? (
                  <span key={t} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${cfg.pill}`}>
                    <cfg.Icon size={9} /> {t}
                  </span>
                ) : (
                  <span key={t} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border bg-canvas-soft border-hairline text-body">{t}</span>
                );
              })}
              {extraCount > 0 && <span className="text-[11px] text-mute font-medium">+{extraCount}</span>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 pt-1 mt-auto">
            <Link to={ROUTES.PROPERTY_DETAILS(property.id)} className="min-w-0">
              <span className="btn-card-secondary"><Eye className="w-4 h-4 shrink-0" /> Details</span>
            </Link>
            <button type="button" onClick={handleBookNow} className="btn-card-primary min-w-0">
              <CalendarCheck className="w-4 h-4 shrink-0" />
              {isRent ? "Book visit" : "Enquire"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
