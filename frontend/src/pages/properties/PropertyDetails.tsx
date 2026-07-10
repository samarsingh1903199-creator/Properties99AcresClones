import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  MapPin, Calendar, Bath, Ruler, Building2, Home, Video, Share2,
  ChevronRight, ChevronLeft, ArrowUpRight, Tag, Bed, IndianRupee, Eye,
  Check, Copy, ArrowLeft, AlertCircle, type LucideIcon,
  Car, Zap, Shield, Wifi, Wind, Dumbbell, Waves, Users,
  Star, Phone, MessageSquare, Camera, X, Droplets, Package,
  TrendingUp, Clock, CheckCircle2, Sparkles, ChevronDown,
  Heart, User, UserCheck, Briefcase,
} from "lucide-react";
import { propertiesApi, type ApiProperty, type ApiPropertyAmenities, type IAddress } from "@/src/services/api";
import { cn, formatCurrency, formatMonthlyRent, toTitleCase } from "@/src/lib/utils";
import { mapApiProperty } from "@/src/lib/listingCategory";
import { VisitEnquiryModal } from "../../components/properties/VisitEnquiryModal";
import { WishlistButton } from "../../components/ui/WishlistButton";
import { PropertyCard } from "../../components/ui/PropertyCard";
import { useAuthStore } from "@/src/store/useAuthStore";
import type { Property } from "@/src/types";

/* ─── Constants ─────────────────────────────────────────────────────── */
const FALLBACK_IMG = "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80";

function buildAmenityChips(a?: ApiPropertyAmenities): { icon: LucideIcon; label: string }[] {
  if (!a) return [];
  const out: { icon: LucideIcon; label: string }[] = [];
  if (a.parking > 0)              out.push({ icon: Car,      label: a.parking === 1 ? "1 Parking Spot" : `${a.parking} Parking Spots` });
  if (a.powerBackup)              out.push({ icon: Zap,      label: "Power Backup" });
  if (a.security24x7)             out.push({ icon: Shield,   label: "24/7 Security" });
  if (a.highSpeedWifi)            out.push({ icon: Wifi,     label: "High-Speed WiFi" });
  if (a.gymnasium)                out.push({ icon: Dumbbell, label: "Gymnasium" });
  if (a.swimmingPool)             out.push({ icon: Waves,    label: "Swimming Pool" });
  if (a.clubHouse)                out.push({ icon: Users,    label: "Club House" });
  if (a.airConditioning)          out.push({ icon: Wind,     label: a.acCount > 1 ? `AC (${a.acCount} Units)` : "Air Conditioning" });
  if (a.separateElectricityMeter) out.push({ icon: Zap,      label: "Separate Elec. Meter" });
  if (a.waterSupply && a.waterSupply !== "none") out.push({
    icon: Droplets,
    label: a.waterSupply === "municipal" ? "Municipal Water" : a.waterSupply === "borewell" ? "Borewell Water" : "Dual Water Supply",
  });
  if (a.almirah)   out.push({ icon: Package, label: "Almirah" });
  if (a.storage)   out.push({ icon: Package, label: "Storage Room" });
  if (a.furnishingStatus === "fully-furnished") out.push({ icon: Star, label: "Fully Furnished" });
  if (a.furnishingStatus === "semi-furnished")  out.push({ icon: Star, label: "Semi Furnished" });
  return out;
}

/* ─── Tenant config ──────────────────────────────────────────────────── */
const TENANT_CONFIG: Record<string, {
  Icon: LucideIcon;
  card: string;
  iconWrap: string;
  label: string;
  badge: string;
}> = {
  "Family":                { Icon: Home,      card: "from-indigo-50 to-indigo-100/60 border-indigo-200 hover:border-indigo-400 hover:shadow-indigo-100",   iconWrap: "bg-indigo-100 text-indigo-600",   label: "text-indigo-900", badge: "bg-indigo-100 text-indigo-600 border-indigo-200" },
  "Couples":               { Icon: Heart,     card: "from-rose-50 to-rose-100/60 border-rose-200 hover:border-rose-400 hover:shadow-rose-100",             iconWrap: "bg-rose-100 text-rose-600",       label: "text-rose-900",   badge: "bg-rose-100 text-rose-600 border-rose-200" },
  "Girls":                 { Icon: Users,     card: "from-pink-50 to-pink-100/60 border-pink-200 hover:border-pink-400 hover:shadow-pink-100",             iconWrap: "bg-pink-100 text-pink-600",       label: "text-pink-900",   badge: "bg-pink-100 text-pink-600 border-pink-200" },
  "Boys":                  { Icon: User,      card: "from-blue-50 to-blue-100/60 border-blue-200 hover:border-blue-400 hover:shadow-blue-100",             iconWrap: "bg-blue-100 text-blue-600",       label: "text-blue-900",   badge: "bg-blue-100 text-blue-600 border-blue-200" },
  "Independent":           { Icon: UserCheck, card: "from-emerald-50 to-emerald-100/60 border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-100", iconWrap: "bg-emerald-100 text-emerald-600", label: "text-emerald-900", badge: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  "Working Professionals": { Icon: Briefcase, card: "from-amber-50 to-amber-100/60 border-amber-200 hover:border-amber-400 hover:shadow-amber-100",       iconWrap: "bg-amber-100 text-amber-600",     label: "text-amber-900",  badge: "bg-amber-100 text-amber-600 border-amber-200" },
};

/* ─── Helpers ────────────────────────────────────────────────────────── */
const calcEMI = (principal: number, annualRate: number, yrs: number) => {
  const r = annualRate / 12 / 100, n = yrs * 12;
  return r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

function mapToLocal(p: ApiProperty): Property {
  return mapApiProperty(p);
}

/* ─── Address helpers ────────────────────────────────────────────────── */
function buildFullLocation(p: ApiProperty): string {
  if (p.address) {
    return [p.address.locality, p.address.city || p.city, p.address.state]
      .filter(Boolean).join(", ") || [p.location, p.city].filter(Boolean).join(", ");
  }
  return [p.location, p.city].filter(Boolean).join(", ");
}

function buildMapQuery(p: ApiProperty): string {
  if (p.address?.lat && p.address?.lng) return `${p.address.lat},${p.address.lng}`;
  if (p.address?.street) {
    return encodeURIComponent(
      [p.address.street, p.address.locality, p.address.city, p.address.state, p.address.country]
        .filter(Boolean).join(", ")
    );
  }
  return encodeURIComponent([p.location, p.city].filter(Boolean).join(", ") || "India");
}

function buildMapsHref(p: ApiProperty): string {
  if (p.address?.lat && p.address?.lng) {
    return `https://maps.google.com/?q=${p.address.lat},${p.address.lng}`;
  }
  return `https://maps.google.com/?q=${buildMapQuery(p)}`;
}

type AddressRow = { label: string; val: string };
function buildAddressRows(addr: IAddress | undefined, fallbackLocation: string, fallbackCity: string): AddressRow[] {
  if (!addr) {
    return [
      fallbackLocation ? { label: "Address",  val: fallbackLocation } : null,
      fallbackCity     ? { label: "City",      val: fallbackCity }     : null,
    ].filter(Boolean) as AddressRow[];
  }
  return [
    addr.street     ? { label: "Street Address", val: addr.street }     : null,
    addr.locality   ? { label: "Locality / Area", val: addr.locality }   : null,
    (addr.city || fallbackCity) ? { label: "City",   val: addr.city || fallbackCity } : null,
    addr.state      ? { label: "State",        val: addr.state }         : null,
    addr.country    ? { label: "Country",      val: addr.country }       : null,
    addr.postalCode ? { label: "Postal Code",  val: addr.postalCode }    : null,
    addr.landmark   ? { label: "Landmark",     val: addr.landmark }      : null,
    (addr.lat && addr.lng) ? { label: "Coordinates", val: `${addr.lat}, ${addr.lng}` } : null,
  ].filter(Boolean) as AddressRow[];
}

/* ─── Skeleton ───────────────────────────────────────────────────────── */
const Pulse = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-gray-200/80 rounded-2xl", className)} />
);

const PropertyDetailsSkeleton = () => (
  <div className="min-h-screen bg-canvas-soft">
    <Pulse className="h-[65vh] rounded-none" />
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => <Pulse key={i} className="h-20" />)}
          </div>
          <Pulse className="h-36" />
          <Pulse className="h-40" />
          <Pulse className="h-64" />
          <Pulse className="h-52" />
          <Pulse className="h-80" />
        </div>
        <div className="space-y-5">
          <Pulse className="h-96" />
          <Pulse className="h-40" />
          <Pulse className="h-32" />
        </div>
      </div>
    </div>
  </div>
);

/* ─── SectionCard ────────────────────────────────────────────────────── */
const SectionCard = ({
  id, title, icon: Icon, children, className, badge,
}: {
  id?: string; title: string; icon?: LucideIcon; children: React.ReactNode;
  className?: string; badge?: string;
}) => (
  <motion.div
    id={id}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className={cn("card-marketing-lg !p-0 overflow-hidden", className)}
  >
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-medium text-ink flex items-center gap-2.5">
          {Icon && (
            <span className="w-8 h-8 rounded-md bg-canvas-soft-2 flex items-center justify-center shrink-0 border border-hairline">
              <Icon size={14} className="text-mute" />
            </span>
          )}
          {title}
        </h2>
        {badge && (
          <span className="badge-secondary font-medium text-ink">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  </motion.div>
);

/* ─── Main Component ─────────────────────────────────────────────────── */
export const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [enquiryOpen, setEnquiryOpen]           = useState(() => !!(location.state as { openBook?: boolean } | null)?.openBook);
  const [enquiryVisitType, setEnquiryVisitType] = useState<"physical" | "video">("physical");

  const openEnquiry = (type: "physical" | "video" = "physical") => {
    setEnquiryVisitType(type);
    setEnquiryOpen(true);
  };
  const { user } = useAuthStore();

  /* state */
  const [property, setProperty] = useState<ApiProperty | null>(null);
  const [similar, setSimilar] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [loanAmt, setLoanAmt] = useState(0);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  /* fetch property */
  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);
    setProperty(null);
    setSimilar([]);

    propertiesApi.getPublic(id)
      .then(async (res) => {
        const prop = res.data;
        setProperty(prop);
        setLoanAmt(Math.round(prop.price * 0.8));

        propertiesApi.recordView(id, {
          ...(user && { userId: user.id, userName: user.name, userEmail: user.email, userPhone: user.phone }),
          source: "view",
        }).catch(() => {});

        try {
          const sim = await propertiesApi.listPublic({ listingType: prop.listingType, limit: "6" });
          setSimilar(sim.data.filter((p) => p._id !== id).slice(0, 4));
        } catch { /* silent */ }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* sticky nav scroll listener */
  useEffect(() => {
    const onScroll = () => {
      const h = heroRef.current;
      setShowStickyNav(h ? window.scrollY > h.offsetHeight - 60 : window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* gallery keyboard nav */
  useEffect(() => {
    if (!galleryOpen || !property) return;
    const imgs = property.images.length ? property.images : [FALLBACK_IMG];
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setGalleryIndex(i => (i + 1) % imgs.length);
      if (e.key === "ArrowLeft")  setGalleryIndex(i => (i - 1 + imgs.length) % imgs.length);
      if (e.key === "Escape")     setGalleryOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [galleryOpen, property]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const openGallery = useCallback((index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  }, []);

  /* must be before any early returns — Rules of Hooks */
  const emi = useMemo(() => calcEMI(loanAmt, rate, tenure), [loanAmt, rate, tenure]);

  /* ── loading ── */
  if (loading) return <PropertyDetailsSkeleton />;

  /* ── error / not found ── */
  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-lg font-black text-luxury-black mb-2">Property not found</p>
          <p className="text-sm text-luxury-black/40 mb-6 leading-relaxed">
            {error ?? "This property may no longer be active."}
          </p>
          <Link to="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-luxury-purple text-white text-sm font-bold hover:opacity-90 transition-opacity">
            <ArrowLeft size={14} /> Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  /* ── derived values ── */
  const isRent = property.listingType === "rent";
  const isBuy  = !isRent;
  const images = property.images.length > 0 ? property.images : [FALLBACK_IMG];
  const fullLocation = buildFullLocation(property);
  const mapQuery     = buildMapQuery(property);
  const mapsHref     = buildMapsHref(property);
  const addressRows  = buildAddressRows(property.address, property.location, property.city);
  const pricePerSqft = isBuy && property.area > 0 ? Math.round(property.price / property.area) : 0;
  const amenityChips = buildAmenityChips(property.amenities);
  const totalPayment  = emi * tenure * 12;
  const totalInterest = totalPayment - loanAmt;
  const daysSinceListed = property.createdAt
    ? Math.floor((Date.now() - new Date(property.createdAt).getTime()) / 86400000)
    : 999;
  const SHORT_DESC = 220;
  const showExpandBtn = (property.description?.length ?? 0) > SHORT_DESC;

  /* auto-highlights */
  const highlights = [
    { icon: CheckCircle2, label: "Verified Listing",  desc: "Identity & ownership verified" },
    daysSinceListed <= 30 && { icon: Clock,      label: "Newly Listed",    desc: `Added ${daysSinceListed}d ago` },
    property.views > 5    && { icon: TrendingUp, label: "High Demand",     desc: `${property.views}+ people viewed` },
    property.bedrooms >= 3 && { icon: Home,       label: "Spacious Layout", desc: `${property.bedrooms} BHK configuration` },
    isBuy && property.price > 5000000 && { icon: Sparkles, label: "Premium Property", desc: "Luxury segment" },
    property.area > 1000 && { icon: Ruler, label: "Large Space", desc: `${property.area.toLocaleString("en-IN")} sqft` },
  ].filter(Boolean).slice(0, 4) as { icon: LucideIcon; label: string; desc: string }[];

  /* key specs strip */
  const specs = [
    property.bedrooms > 0  && { icon: Bed,       label: "Bedrooms",  val: `${property.bedrooms} BHK` },
    property.bathrooms > 0 && { icon: Bath,      label: "Bathrooms", val: String(property.bathrooms) },
    property.area > 0      && { icon: Ruler,     label: "Area",      val: `${property.area.toLocaleString("en-IN")} sqft` },
    property.type          && { icon: Building2, label: "Type",      val: toTitleCase(property.type) },
    property.city          && { icon: MapPin,    label: "City",      val: toTitleCase(property.city) },
    property.createdAt     && { icon: Calendar,  label: "Listed",    val: fmtDate(property.createdAt) },
  ].filter(Boolean) as { icon: LucideIcon; label: string; val: string }[];

  /* detail table rows */
  const detailRows = [
    { icon: Tag,       label: "Property Type", val: toTitleCase(property.type) },
    { icon: Building2, label: "Listing For",   val: isRent ? "Rent / Lease" : "Sale" },
    property.bedrooms > 0  && { icon: Bed,          label: "Bedrooms",    val: `${property.bedrooms} BHK` },
    property.bathrooms > 0 && { icon: Bath,         label: "Bathrooms",   val: `${property.bathrooms}` },
    property.area > 0      && { icon: Ruler,        label: "Total Area",  val: `${property.area.toLocaleString("en-IN")} sqft` },
    isBuy && pricePerSqft > 0 && { icon: IndianRupee, label: "Rate / sqft", val: `₹${pricePerSqft.toLocaleString("en-IN")}` },
    (property.address?.street || property.location) && { icon: MapPin, label: "Street",       val: toTitleCase(property.address?.street || property.location) },
    property.address?.locality   && { icon: MapPin, label: "Locality",     val: toTitleCase(property.address.locality) },
    (property.address?.city || property.city) && { icon: MapPin, label: "City",     val: toTitleCase(property.address?.city || property.city) },
    property.address?.state      && { icon: MapPin, label: "State",        val: toTitleCase(property.address.state) },
    property.address?.postalCode && { icon: MapPin, label: "Postal Code",  val: property.address.postalCode },
    property.createdAt && { icon: Calendar,  label: "Listed On", val: fmtDate(property.createdAt) },
    property.views > 0 && { icon: Eye,       label: "Views",     val: property.views.toLocaleString("en-IN") },
    property.amenities?.furnishingStatus && {
      icon: Sparkles,
      label: "Furnishing",
      val: property.amenities.furnishingStatus.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    },
    (property.amenities?.securityDeposit ?? 0) > 0 && {
      icon: IndianRupee,
      label: "Security Deposit",
      val: formatCurrency(property.amenities!.securityDeposit),
    },
    (property.amenities?.distanceFromLocation ?? 0) > 0 && {
      icon: MapPin,
      label: "Distance",
      val: `${property.amenities!.distanceFromLocation} km from hub`,
    },
  ].filter(Boolean) as { icon: LucideIcon; label: string; val: string }[];

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div className="bg-canvas-soft min-h-screen overflow-x-hidden">

      {/* Scroll progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-luxury-purple via-indigo-500 to-purple-400 z-[130] origin-left"
        style={{ scaleX }}
      />

      {/* ── Sticky Nav ── */}
      <AnimatePresence>
        {showStickyNav && (
          <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 35 }}
            className="fixed top-0 left-0 right-0 z-[120] bg-white/96 backdrop-blur-xl border-b border-gray-100/80 shadow-sm"
          >
            <div className="max-w-[1400px] mx-auto px-5 md:px-10 h-14 flex items-center justify-between gap-4">
              <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
                {([
                  { href: "#overview",  label: "Overview" },
                  { href: "#amenities", label: "Amenities" },
                  (property.amenities?.preferred_tenants?.length ?? 0) > 0 ? { href: "#tenants", label: "Tenants" } : null,
                  isBuy         ? { href: "#emi",      label: "EMI" }      : null,
                  fullLocation  ? { href: "#location", label: "Location" } : null,
                ] as ({ href: string; label: string } | null)[])
                  .filter((x): x is { href: string; label: string } => x !== null)
                  .map(item => (
                    <a key={item.href} href={item.href}
                      className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-luxury-black/40 hover:text-luxury-purple hover:bg-luxury-purple/8 rounded-lg transition-all whitespace-nowrap">
                      {item.label}
                    </a>
                  ))}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="hidden sm:block text-base font-black text-luxury-purple">
                  {isRent ? formatMonthlyRent(property.price) : formatCurrency(property.price)}
                </p>
                <button
                  onClick={() => openEnquiry("physical")}
                  className="px-4 py-2 rounded-xl bg-luxury-purple text-white text-[11px] font-black shadow-md shadow-luxury-purple/20 hover:opacity-90 transition-opacity">
                  {isRent ? "Apply Now" : "Book Visit"}
                </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Hero Section ── */}
      <div ref={heroRef}>
        {/* Main hero image */}
        <div className="relative h-[65vh] min-h-[380px] overflow-hidden">
          <motion.img
            src={images[0]}
            alt={property.title}
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/25 to-black/5" />

          {/* Back */}
          <Link to="/properties"
            className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/35 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold hover:bg-white/10 transition-all">
            <ArrowLeft size={14} /> Back
          </Link>

          {/* Top-right actions */}
          <div className="absolute top-6 right-6 flex gap-2 z-20">
            <WishlistButton propertyId={property._id} variant="floating" />
            <button onClick={handleCopy}
              className="w-11 h-11 rounded-xl bg-black/35 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white/15 transition-all">
              <AnimatePresence mode="wait">
                {copied
                  ? <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={15} className="text-green-400" /></motion.span>
                  : <motion.span key="u" initial={{ scale: 0 }} animate={{ scale: 1 }}><Share2 size={15} /></motion.span>}
              </AnimatePresence>
            </button>
          </div>

          {/* Gallery pill */}
          <button onClick={() => openGallery(0)}
            className="absolute bottom-6 left-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold hover:bg-white/10 transition-all">
            <Camera size={13} /> {images.length} Photo{images.length !== 1 ? "s" : ""}
          </button>

          {/* Hero title block */}
          <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-8 max-w-[1400px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.55 }}>
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1.5 rounded-full bg-luxury-purple text-white text-[9px] font-black uppercase tracking-widest">
                  {isRent ? "For Rent" : "For Sale"}
                </span>
                {property.type && (
                  <span className="px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest">
                    {toTitleCase(property.type)}
                  </span>
                )}
                {property.status === "active" && (
                  <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Available
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black text-white tracking-tight leading-tight mb-3 max-w-3xl">
                {toTitleCase(property.title)}
              </h1>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {fullLocation && (
                  <div className="flex items-center gap-1.5 text-white/70 text-[13px]">
                    <MapPin size={13} className="text-luxury-purple/80 shrink-0" />
                    {toTitleCase(fullLocation)}
                  </div>
                )}
                {property.views > 0 && (
                  <div className="flex items-center gap-1.5 text-white/50 text-[12px]">
                    <Eye size={12} /> {property.views.toLocaleString("en-IN")} views
                  </div>
                )}
                {property.createdAt && (
                  <div className="flex items-center gap-1.5 text-white/50 text-[12px]">
                    <Clock size={12} /> {fmtDate(property.createdAt)}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Secondary image mosaic — desktop */}
        {images.length > 1 && (
          <div className="hidden md:grid grid-cols-4 gap-0.5 h-28 bg-luxury-black">
            {images.slice(1, 5).map((img, i) => (
              <button key={i} onClick={() => openGallery(i + 1)}
                className="relative overflow-hidden group">
                <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-75 group-hover:brightness-90" />
                {i === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-white">+{images.length - 5}</p>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5">More</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-luxury-black/30">
          <Link to="/" className="hover:text-luxury-purple transition-colors">Home</Link>
          <ChevronRight size={9} />
          <Link to="/properties" className="hover:text-luxury-purple transition-colors">Properties</Link>
          <ChevronRight size={9} />
          <span className="text-luxury-purple truncate max-w-[220px]">{toTitleCase(property.title)}</span>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-32 grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ══════ LEFT COLUMN ══════ */}
        <div className="xl:col-span-2 space-y-6">

          {/* Quick Specs Strip */}
          {specs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
            >
              {specs.map((s, i) => (
                <motion.div key={i}
                  whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(91,33,182,0.12)" }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center text-center cursor-default transition-all duration-200">
                  <div className="w-9 h-9 rounded-xl bg-luxury-purple/8 flex items-center justify-center mb-2.5">
                    <s.icon size={16} className="text-luxury-purple" />
                  </div>
                  <p className="text-sm font-black text-luxury-black leading-tight">{s.val}</p>
                  <p className="text-[8px] uppercase font-bold text-luxury-black/30 tracking-wider mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Preferred Tenants */}
          {(property.amenities?.preferred_tenants?.length ?? 0) > 0 && (
            <SectionCard
              id="tenants"
              title="Preferred Tenants"
              icon={Users}
              badge={`${property.amenities!.preferred_tenants!.length} ${property.amenities!.preferred_tenants!.length === 1 ? "Type" : "Types"}`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities!.preferred_tenants!.map((tenant, i) => {
                  const cfg = TENANT_CONFIG[tenant] ?? {
                    Icon: Users, card: "from-gray-50 to-gray-100/60 border-gray-200 hover:border-gray-400 hover:shadow-gray-100",
                    iconWrap: "bg-gray-100 text-gray-500", label: "text-gray-800",
                    badge: "bg-gray-100 text-gray-500 border-gray-200",
                  };
                  return (
                    <motion.div
                      key={tenant}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ y: -3, boxShadow: "0 10px 28px rgba(0,0,0,0.08)" }}
                      className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br border cursor-default transition-all duration-200 ${cfg.card}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${cfg.iconWrap}`}>
                        <cfg.Icon size={22} strokeWidth={1.8} />
                      </div>
                      <div className="text-center">
                        <p className={`text-[13px] font-black leading-tight ${cfg.label}`}>{tenant}</p>
                        <p className="text-[10px] font-medium text-luxury-black/35 mt-0.5 uppercase tracking-wider">Suitable</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-5 flex items-start gap-2.5 p-4 rounded-2xl bg-luxury-purple/5 border border-luxury-purple/10">
                <UserCheck size={14} className="text-luxury-purple shrink-0 mt-0.5" />
                <p className="text-[12px] text-luxury-black/55 font-medium leading-relaxed">
                  This property is best suited for the tenant types shown above. Contact the dealer to confirm availability.
                </p>
              </div>
            </SectionCard>
          )}

          {/* Amenities */}
          <SectionCard id="amenities" title="Amenities & Features" icon={Star}>
            {amenityChips.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {amenityChips.map((a, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-luxury-purple/5 hover:border-luxury-purple/20 transition-all group cursor-default"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0 group-hover:bg-luxury-purple/10 group-hover:border-luxury-purple/20 transition-all">
                      <a.icon size={14} className="text-luxury-black/45 group-hover:text-luxury-purple transition-colors" />
                    </div>
                    <span className="text-[11px] font-bold text-luxury-black/55 group-hover:text-luxury-black transition-colors leading-tight">
                      {a.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <Star size={20} className="text-gray-300" />
                </div>
                <p className="text-[13px] font-bold text-luxury-black/35">No amenities listed yet</p>
                <p className="text-[11px] text-luxury-black/25 mt-1">Contact the dealer for more details</p>
              </div>
            )}
          </SectionCard>

          {/* Why this Property — highlights */}
          {highlights.length > 0 && (
            <SectionCard title="Why This Property?" icon={Sparkles}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map((h, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3.5 p-4 rounded-2xl bg-gradient-to-br from-luxury-purple/5 to-indigo-50/60 border border-luxury-purple/10 hover:border-luxury-purple/25 hover:shadow-sm transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-luxury-purple/12 flex items-center justify-center shrink-0">
                      <h.icon size={16} className="text-luxury-purple" />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-luxury-black">{h.label}</p>
                      <p className="text-[11px] text-luxury-black/45 mt-0.5">{h.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* About */}
          {property.description?.trim() && (
            <SectionCard id="overview" title="About This Property" icon={Home}>
              <div>
                <p className={cn(
                  "text-[14px] text-luxury-black/60 leading-[1.75] whitespace-pre-line transition-all duration-300",
                  !descExpanded && showExpandBtn && "line-clamp-4",
                )}>
                  {property.description}
                </p>
                {showExpandBtn && (
                  <button
                    onClick={() => setDescExpanded(d => !d)}
                    className="mt-3 flex items-center gap-1.5 text-luxury-purple text-[12px] font-black hover:underline underline-offset-2">
                    {descExpanded ? "Show Less" : "Read More"}
                    <ChevronDown size={14} className={cn("transition-transform duration-200", descExpanded && "rotate-180")} />
                  </button>
                )}
              </div>
            </SectionCard>
          )}

          {/* EMI Calculator — buy only */}
          {isBuy && property.price > 0 && loanAmt > 0 && (
            <SectionCard id="emi" title="EMI Calculator" icon={IndianRupee} badge="Indicative Only">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Loan amount */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-luxury-black/50">Loan Amount</span>
                      <span className="text-[12px] font-black text-luxury-purple">{formatCurrency(loanAmt)}</span>
                    </div>
                    <input type="range" min={500000} max={property.price} step={100000}
                      value={loanAmt} onChange={e => setLoanAmt(Number(e.target.value))}
                      className="w-full accent-luxury-purple h-1.5" />
                    <div className="flex justify-between text-[9px] text-luxury-black/30 font-bold mt-1">
                      <span>₹5 L</span><span>{formatCurrency(property.price)}</span>
                    </div>
                  </div>
                  {/* Interest rate */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-luxury-black/50">Interest Rate</span>
                      <span className="text-[12px] font-black text-luxury-purple">{rate}% p.a.</span>
                    </div>
                    <input type="range" min={6} max={15} step={0.1}
                      value={rate} onChange={e => setRate(Number(e.target.value))}
                      className="w-full accent-luxury-purple h-1.5" />
                    <div className="flex justify-between text-[9px] text-luxury-black/30 font-bold mt-1">
                      <span>6%</span><span>15%</span>
                    </div>
                  </div>
                  {/* Tenure */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-luxury-black/50">Loan Tenure</span>
                      <span className="text-[12px] font-black text-luxury-purple">{tenure} Years</span>
                    </div>
                    <input type="range" min={5} max={30} step={1}
                      value={tenure} onChange={e => setTenure(Number(e.target.value))}
                      className="w-full accent-luxury-purple h-1.5" />
                    <div className="flex justify-between text-[9px] text-luxury-black/30 font-bold mt-1">
                      <span>5 Yrs</span><span>30 Yrs</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex-1 min-h-[120px] p-6 rounded-2xl bg-gradient-to-br from-luxury-purple to-indigo-600 text-white flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-70 mb-1.5">Monthly EMI</p>
                    <p className="text-4xl font-display font-black">{formatCurrency(Math.round(emi))}</p>
                    <p className="text-[10px] opacity-60 mt-1">per month</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                      <p className="text-[9px] uppercase font-bold text-luxury-black/40 tracking-wider">Total Payment</p>
                      <p className="text-[13px] font-black text-luxury-black mt-1">{formatCurrency(Math.round(totalPayment))}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-center">
                      <p className="text-[9px] uppercase font-bold text-red-400 tracking-wider">Total Interest</p>
                      <p className="text-[13px] font-black text-red-600 mt-1">{formatCurrency(Math.round(totalInterest))}</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-luxury-black/30 text-center">
                    *For illustrative purposes. Contact your bank for exact rates.
                  </p>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Location & Map */}
          {(fullLocation || addressRows.length > 0) && (
            <SectionCard id="location" title="Location & Map" icon={MapPin}>

              {/* Structured address grid */}
              {addressRows.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                  {addressRows.map((row, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                      <p className="text-[9px] uppercase font-bold text-luxury-black/35 tracking-wider mb-1">
                        {row.label}
                      </p>
                      <p className="text-[13px] font-bold text-luxury-black leading-snug break-words">
                        {row.val}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Maps link banner */}
              {fullLocation && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-luxury-purple/5 border border-luxury-purple/10 mb-4">
                  <MapPin size={14} className="text-luxury-purple mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-luxury-black">{fullLocation}</p>
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-luxury-purple font-bold flex items-center gap-1 mt-1 hover:underline underline-offset-2"
                    >
                      Open in Google Maps <ArrowUpRight size={11} />
                    </a>
                  </div>
                </div>
              )}

              {/* Embedded map */}
              <div className="rounded-2xl overflow-hidden border border-gray-100 h-72 shadow-sm">
                <iframe
                  src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  title="Property Location"
                />
              </div>
            </SectionCard>
          )}

          {/* Similar Properties */}
          {similar.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-luxury-black flex items-center gap-2.5">
                  <span className="w-1 h-4 rounded-full bg-luxury-purple inline-block" />
                  Similar Properties
                </h2>
                <Link to="/properties"
                  className="text-luxury-purple text-[11px] font-black flex items-center gap-1 hover:underline underline-offset-2">
                  View All <ArrowUpRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {similar.map((p, i) => (
                  <PropertyCard key={p._id} property={mapToLocal(p)} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ══════ RIGHT COLUMN (sticky) ══════ */}
        <div>
          <div className="sticky top-20 space-y-5">

            {/* Price + CTA card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden"
            >
              <div className="h-[3px] bg-gradient-to-r from-luxury-purple to-indigo-500" />
              <div className="p-6 space-y-5">
                {/* Price */}
                <div>
                  <p className="text-[9px] uppercase font-bold text-luxury-black/35 tracking-widest mb-1">
                    {isRent ? "Monthly Rent" : "Sale Price"}
                  </p>
                  <p className="text-3xl font-display font-black text-luxury-purple">
                    {isRent ? formatMonthlyRent(property.price) : formatCurrency(property.price)}
                  </p>
                  {isBuy && pricePerSqft > 0 && (
                    <p className="text-[11px] text-luxury-black/40 mt-0.5">
                      ₹{pricePerSqft.toLocaleString("en-IN")} / sqft
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                    {property.status === "active" ? "Available Now" : toTitleCase(property.status)}
                  </span>
                </div>

                {/* Mini specs */}
                {property.area > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {property.bedrooms > 0 && (
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                        <p className="text-base font-black text-luxury-black">{property.bedrooms} BHK</p>
                        <p className="text-[9px] uppercase font-bold text-luxury-black/30 tracking-wider">Config</p>
                      </div>
                    )}
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                      <p className="text-base font-black text-luxury-black">{property.area.toLocaleString("en-IN")}</p>
                      <p className="text-[9px] uppercase font-bold text-luxury-black/30 tracking-wider">sqft</p>
                    </div>
                  </div>
                )}

                <div className="h-px bg-gray-100" />

                {/* CTA buttons */}
                <div className="space-y-2.5">
                  <button
                    onClick={() => openEnquiry("physical")}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-luxury-purple to-indigo-600 text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-luxury-purple/25">
                    <Home size={15} />
                    {isRent ? "Apply for Rent" : "Book Site Visit"}
                  </button>
                  <button
                    onClick={() => openEnquiry("video")}
                    className="w-full py-3.5 rounded-2xl border border-luxury-purple/20 bg-luxury-purple/8 text-luxury-purple text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-luxury-purple/15 active:scale-[0.98] transition-all">
                    <Video size={14} /> Video Tour
                  </button>
                  <button
                    onClick={() => openEnquiry("physical")}
                    className="w-full py-3.5 rounded-2xl border border-gray-200 text-luxury-black text-[13px] font-bold flex items-center justify-center gap-2 hover:border-luxury-purple/30 hover:text-luxury-purple active:scale-[0.98] transition-all">
                    <MessageSquare size={14} /> Make an Inquiry
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Contact Dealer card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="h-[3px] bg-gradient-to-r from-emerald-400 to-teal-500" />
              <div className="p-6">
                <p className="text-[9px] uppercase font-bold text-luxury-black/30 tracking-widest mb-4">Contact Dealer</p>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-luxury-purple to-indigo-600 flex items-center justify-center text-white text-xl font-black shrink-0 shadow-md shadow-luxury-purple/20">
                    P
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-luxury-black">Property Owner</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 size={11} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600">Verified Dealer</span>
                    </div>
                    {property.views > 0 && (
                      <p className="text-[10px] text-luxury-black/35 mt-0.5">{property.views} property views</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openEnquiry("physical")}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-luxury-purple text-white text-[11px] font-bold hover:opacity-90 active:scale-[0.97] transition-all shadow-md shadow-luxury-purple/20">
                    <Phone size={12} /> Call Now
                  </button>
                  <button
                    onClick={() => openEnquiry("physical")}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-luxury-purple/10 text-luxury-purple text-[11px] font-bold hover:bg-luxury-purple/20 active:scale-[0.97] transition-all">
                    <MessageSquare size={12} /> Enquire
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Share card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5"
            >
              <p className="text-[9px] uppercase font-bold text-luxury-black/30 tracking-widest mb-3">Share Property</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleCopy}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px] font-bold text-luxury-black/50 hover:bg-luxury-purple/8 hover:text-luxury-purple hover:border-luxury-purple/20 active:scale-[0.97] transition-all">
                  <AnimatePresence mode="wait">
                    {copied
                      ? <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={13} className="text-green-600" /></motion.span>
                      : <motion.span key="u" initial={{ scale: 0 }} animate={{ scale: 1 }}><Copy size={13} /></motion.span>}
                  </AnimatePresence>
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={() => typeof navigator.share !== "undefined"
                    ? navigator.share({ title: property.title, url: window.location.href })
                    : handleCopy()}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px] font-bold text-luxury-black/50 hover:bg-luxury-purple/8 hover:text-luxury-purple hover:border-luxury-purple/20 active:scale-[0.97] transition-all">
                  <Share2 size={13} /> Share
                </button>
              </div>
              {property.views > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-luxury-black/40">
                  <Eye size={11} />
                  <span>{property.views.toLocaleString("en-IN")} people viewed this</span>
                </div>
              )}
            </motion.div>

          </div>
        </div>

      </div>

      {/* ── Mobile Sticky Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 xl:hidden">
        <div className="bg-white/96 backdrop-blur-xl border-t border-gray-100 shadow-2xl px-4 py-3">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] uppercase font-bold text-luxury-black/35 tracking-widest">
                {isRent ? "Monthly Rent" : "Sale Price"}
              </p>
              <p className="text-lg font-display font-black text-luxury-purple leading-tight">
                {isRent ? formatMonthlyRent(property.price) : formatCurrency(property.price)}
              </p>
            </div>
            <WishlistButton propertyId={property._id} variant="floating" />
            <button
              onClick={() => openEnquiry("physical")}
              className="px-6 py-3 rounded-xl bg-luxury-purple text-white text-[12px] font-bold shadow-lg shadow-luxury-purple/25 shrink-0 hover:opacity-90 active:scale-[0.97] transition-all">
              {isRent ? "Apply Now" : "Book Visit"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Fullscreen Gallery Lightbox ── */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/90 to-transparent shrink-0">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-white/40">Gallery</p>
                <p className="text-[13px] font-bold text-white mt-0.5">
                  {galleryIndex + 1} <span className="text-white/40">/ {images.length}</span>
                </p>
              </div>
              <button onClick={() => setGalleryOpen(false)}
                className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center px-14 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={galleryIndex}
                  src={images[galleryIndex]}
                  alt=""
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.22 }}
                  className="max-w-full max-h-full object-contain rounded-2xl"
                  draggable={false}
                />
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setGalleryIndex(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <ChevronLeft size={22} className="text-white" />
                  </button>
                  <button
                    onClick={() => setGalleryIndex(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <ChevronRight size={22} className="text-white" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="shrink-0 px-4 py-4 flex gap-2 overflow-x-auto justify-center bg-gradient-to-t from-black/90 to-transparent">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setGalleryIndex(i)}
                    className={cn(
                      "w-16 h-11 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200",
                      i === galleryIndex
                        ? "border-white scale-105 opacity-100"
                        : "border-transparent opacity-40 hover:opacity-70",
                    )}>
                    <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {property && (
        <VisitEnquiryModal
          open={enquiryOpen}
          onClose={() => setEnquiryOpen(false)}
          property={property}
          defaultVisitType={enquiryVisitType}
        />
      )}
    </div>
  );
};
