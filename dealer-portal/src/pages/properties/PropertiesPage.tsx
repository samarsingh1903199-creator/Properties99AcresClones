import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Eye, MessageSquare, Pencil, Trash2, Home,
  LayoutGrid, List, Search, BedDouble, Bath,
  Maximize2, MapPin, ChevronDown, ImageOff,
  TrendingUp, ArrowUpRight, Check, Loader2, RefreshCw,
  X, Users, Phone, Mail, Calendar, BookOpen,
  Building2, AlertCircle, ChevronRight,
} from "lucide-react";
import {
  propertiesApi, viewsApi, inquiriesApi,
  type ApiProperty, type ApiPropertyView, type ApiInquiry,
} from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";
import { type PropertyStatus } from "../../store/usePropertyStore";
import { ROUTES } from "../../constants/routes";

/* ── types ──────────────────────────────────────────────────────── */
type ViewMode      = "grid" | "list";
type SortKey       = "newest" | "price_high" | "price_low" | "views";
type ListingFilter = "all" | "sale" | "rent";
type ModalTarget   = { propertyId: string; propertyTitle: string } | null;

type Property = ApiProperty & { id: string };
function toUiProperty(p: ApiProperty): Property { return { ...p, id: p._id }; }

const LISTING_TABS: { label: string; value: ListingFilter }[] = [
  { label: "All", value: "all" }, { label: "For Sale", value: "sale" }, { label: "For Rent", value: "rent" },
];
const STATUS_TABS: { label: string; value: PropertyStatus | "all" }[] = [
  { label: "All", value: "all" }, { label: "Active", value: "active" }, { label: "Pending", value: "pending" },
  { label: "Sold", value: "sold" }, { label: "Rented", value: "rented" }, { label: "Draft", value: "draft" },
];
const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Newest first", value: "newest" }, { label: "Price: High→Low", value: "price_high" },
  { label: "Price: Low→High", value: "price_low" }, { label: "Most viewed", value: "views" },
];
const STATUS_STYLE: Record<PropertyStatus, { bg: string; text: string; border: string; dot: string }> = {
  active:  { bg: "bg-emerald-50",   text: "text-emerald-700", border: "border-emerald-100",            dot: "bg-emerald-500" },
  pending: { bg: "bg-amber-50",     text: "text-amber-700",   border: "border-amber-100",              dot: "bg-amber-500"   },
  sold:    { bg: "bg-[#5b21b6]/10", text: "text-[#5b21b6]",  border: "border-[rgba(91,33,182,0.15)]", dot: "bg-[#5b21b6]"  },
  rented:  { bg: "bg-blue-50",      text: "text-blue-700",    border: "border-blue-100",               dot: "bg-blue-500"    },
  draft:   { bg: "bg-gray-100",     text: "text-gray-500",    border: "border-gray-200",               dot: "bg-gray-400"    },
};

/* ── helpers ─────────────────────────────────────────────────────── */
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}

/* ── sub-components ──────────────────────────────────────────────── */
function StatusBadge({ s, size = "sm" }: { s: PropertyStatus; size?: "sm" | "lg" }) {
  const st = STATUS_STYLE[s];
  const pad = size === "lg" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]";
  return (
    <span className={`inline-flex items-center gap-1.5 font-black capitalize rounded-full border ${st.bg} ${st.text} ${st.border} ${pad}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{s}
    </span>
  );
}

function StatusDropdown({ property, onStatusChange }: {
  property: Property; onStatusChange: (id: string, status: PropertyStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const STATUSES: PropertyStatus[] = ["active", "pending", "sold", "rented", "draft"];
  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#111111]/40 hover:text-[#5b21b6] transition-colors">
        Change status <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-xl border border-[rgba(91,33,182,0.1)] shadow-xl overflow-hidden min-w-[140px]"
            style={{ boxShadow: "0 12px 32px -8px rgba(91,33,182,0.15)" }}>
            {STATUSES.map((s) => {
              const st = STATUS_STYLE[s];
              return (
                <button key={s} onClick={(e) => { e.stopPropagation(); onStatusChange(property.id, s); setOpen(false); }}
                  className={`flex items-center justify-between w-full px-3 py-2 text-xs font-bold capitalize hover:bg-[#f8f9fa] transition-colors ${property.status === s ? "text-[#5b21b6]" : "text-[#111111]/60"}`}>
                  <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${st.dot}`} />{s}</span>
                  {property.status === s && <Check className="w-3.5 h-3.5 text-[#5b21b6]" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ImageDots({ count, active }: { count: number; active: number }) {
  if (count <= 1) return null;
  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
      {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
        <span key={i} className={`rounded-full transition-all ${i === active ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`} />
      ))}
    </div>
  );
}

/* ── Stat Button ─────────────────────────────────────────────────── */
function StatBtn({ icon: Icon, count, label, color, onClick }: {
  icon: typeof Eye; count: number; label: string;
  color: "purple" | "emerald";
  onClick: () => void;
}) {
  const styles = color === "purple"
    ? "bg-[#5b21b6]/6 border-[rgba(91,33,182,0.12)] text-[#5b21b6]/60 hover:bg-[#5b21b6] hover:text-white hover:border-[#5b21b6] hover:shadow-[0_4px_12px_-3px_rgba(91,33,182,0.45)]"
    : "bg-emerald-50 border-emerald-100 text-emerald-600/70 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-[0_4px_12px_-3px_rgba(16,185,129,0.4)]";
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={`Click to see ${label}`}
      className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all duration-200 cursor-pointer ${styles}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="text-xs font-black">{count}</span>
      <span className="text-[10px] hidden sm:inline">{label}</span>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-current flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-2 h-2 text-white" />
        </span>
      )}
    </button>
  );
}

/* ── GRID CARD ───────────────────────────────────────────────────── */
function PropertyCard({ p, confirmDelete, onDelete, onStatusChange, onViewClick, onInquiryClick }: {
  p: Property; confirmDelete: string | null;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: PropertyStatus) => void;
  onViewClick: (p: Property) => void;
  onInquiryClick: (p: Property) => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  return (
    <div className="dp-card overflow-hidden group flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-12px_rgba(91,33,182,0.2)]">
      <div className="relative overflow-hidden bg-[#f8f9fa]" style={{ aspectRatio: "16/10" }}>
        {p.images.length > 0 ? (
          <>
            <img src={p.images[imgIdx]} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {p.images.length > 1 && (
              <>
                <button onClick={(e) => { e.preventDefault(); setImgIdx((i) => (i - 1 + p.images.length) % p.images.length); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 text-white text-xs font-bold">‹</button>
                <button onClick={(e) => { e.preventDefault(); setImgIdx((i) => (i + 1) % p.images.length); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 text-white text-xs font-bold">›</button>
                <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {imgIdx + 1}/{p.images.length}
                </span>
              </>
            )}
            <ImageDots count={p.images.length} active={imgIdx} />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ImageOff className="w-8 h-8 text-[#5b21b6]/20" />
            <span className="text-xs font-medium text-[#111111]/30">No photos yet</span>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5"><StatusBadge s={p.status as PropertyStatus} /></div>
        <span className="absolute bottom-3 right-3 bg-[#5b21b6] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
          For {p.listingType}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#5b21b6]">{p.type}</span>
        </div>
        <h3 className="font-black text-[#111111] text-sm leading-tight mb-1 line-clamp-1" style={{ fontFamily: "Outfit, sans-serif" }}>{p.title}</h3>
        <div className="flex items-center gap-1 text-xs font-medium text-[#111111]/40 mb-3">
          <MapPin className="w-3 h-3 shrink-0 text-[#5b21b6]/40" />
          <span className="truncate">{p.location}</span>
        </div>
        <div className="flex items-center gap-3 pb-3 mb-3 border-b border-[rgba(91,33,182,0.06)]">
          <span className="flex items-center gap-1 text-xs font-semibold text-[#111111]/60"><BedDouble className="w-3.5 h-3.5 text-[#5b21b6]/40" />{p.bedrooms} Beds</span>
          <span className="w-px h-3 bg-gray-200" />
          <span className="flex items-center gap-1 text-xs font-semibold text-[#111111]/60"><Bath className="w-3.5 h-3.5 text-[#5b21b6]/40" />{p.bathrooms} Baths</span>
          <span className="w-px h-3 bg-gray-200" />
          <span className="flex items-center gap-1 text-xs font-semibold text-[#111111]/60"><Maximize2 className="w-3.5 h-3.5 text-[#5b21b6]/40" />{p.area.toLocaleString()} sq.ft</span>
        </div>

        {/* ── Clickable stat buttons ── */}
        <div className="flex items-center gap-2 mb-4">
          <StatBtn icon={Eye} count={p.views} label="views" color="purple" onClick={() => onViewClick(p)} />
          <StatBtn icon={MessageSquare} count={p.inquiries} label="inquiries" color="emerald" onClick={() => onInquiryClick(p)} />
          {p.inquiries > 10 && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />Hot
            </span>
          )}
        </div>

        <div className="mb-4">
          <p className="text-xl font-black text-[#111111] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            ₹{p.price.toLocaleString("en-IN")}
            {p.listingType === "rent" && <span className="text-sm font-semibold text-[#111111]/40">/mo</span>}
          </p>
        </div>
        <div className="mb-4">
          <StatusDropdown property={p} onStatusChange={onStatusChange} />
        </div>
        <div className="flex gap-2 mt-auto">
          <Link to={`/properties/${p.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-black uppercase tracking-wider border border-[rgba(91,33,182,0.15)] text-[#5b21b6] hover:bg-[#5b21b6] hover:text-white hover:border-[#5b21b6] transition-all duration-200">
            <Pencil className="w-3.5 h-3.5" />Edit
          </Link>
          <button onClick={() => onDelete(p.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-black uppercase tracking-wider border transition-all duration-200 ${
              confirmDelete === p.id ? "bg-red-500 text-white border-red-500" : "border-gray-200 text-[#111111]/40 hover:bg-red-50 hover:text-red-500 hover:border-red-100"
            }`}>
            <Trash2 className="w-3.5 h-3.5" />
            {confirmDelete === p.id ? "Confirm?" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── LIST ROW ────────────────────────────────────────────────────── */
function PropertyRow({ p, confirmDelete, onDelete, onStatusChange, isLast, onViewClick, onInquiryClick }: {
  p: Property; confirmDelete: string | null; isLast: boolean;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: PropertyStatus) => void;
  onViewClick: (p: Property) => void;
  onInquiryClick: (p: Property) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-[#f8f9fa] transition-colors"
      style={{ borderBottom: isLast ? "none" : "1px solid rgba(91,33,182,0.05)" }}>
      <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-[#f8f9fa] border border-[rgba(91,33,182,0.06)] flex items-center justify-center relative">
        {p.images[0] ? (
          <>
            <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
            {p.images.length > 1 && (
              <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[9px] font-black px-1 rounded">+{p.images.length - 1}</span>
            )}
          </>
        ) : <ImageOff className="w-5 h-5 text-[#5b21b6]/20" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-black text-[#111111] truncate" style={{ fontFamily: "Outfit, sans-serif" }}>{p.title}</p>
          <StatusBadge s={p.status as PropertyStatus} />
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-[#111111]/40 mb-2">
          <MapPin className="w-3 h-3 text-[#5b21b6]/30" /><span className="truncate">{p.location}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs font-semibold text-[#111111]/40"><BedDouble className="w-3 h-3" />{p.bedrooms}</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-[#111111]/40"><Bath className="w-3 h-3" />{p.bathrooms}</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-[#111111]/40"><Maximize2 className="w-3 h-3" />{p.area.toLocaleString()} sq.ft</span>
          <div className="flex items-center gap-1.5 ml-1">
            <StatBtn icon={Eye} count={p.views} label="views" color="purple" onClick={() => onViewClick(p)} />
            <StatBtn icon={MessageSquare} count={p.inquiries} label="inquiries" color="emerald" onClick={() => onInquiryClick(p)} />
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 mr-2 hidden sm:block">
        <p className="text-base font-black text-[#111111] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
          ₹{p.price.toLocaleString("en-IN")}
          {p.listingType === "rent" && <span className="text-xs font-semibold text-[#111111]/40">/mo</span>}
        </p>
        <span className="text-[10px] font-black text-[#5b21b6] uppercase tracking-wider">For {p.listingType}</span>
      </div>
      <div className="shrink-0 hidden md:block"><StatusDropdown property={p} onStatusChange={onStatusChange} /></div>
      <div className="flex items-center gap-1 shrink-0">
        <Link to={`/properties/${p.id}/edit`}
          className="p-2 rounded-xl text-[#111111]/30 hover:text-[#5b21b6] hover:bg-[#5b21b6]/8 border border-transparent hover:border-[rgba(91,33,182,0.12)] transition-all duration-200" title="Edit">
          <Pencil className="w-4 h-4" />
        </Link>
        <button onClick={() => onDelete(p.id)}
          className={`p-2 rounded-xl transition-all duration-200 border ${
            confirmDelete === p.id ? "text-red-500 bg-red-50 border-red-100" : "text-[#111111]/30 border-transparent hover:text-red-500 hover:bg-red-50 hover:border-red-100"
          }`} title={confirmDelete === p.id ? "Click again to confirm" : "Delete"}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Modal Shell ─────────────────────────────────────────────────── */
function ModalShell({ title, subtitle, icon: Icon, accent, onClose, children }: {
  title: string; subtitle: string;
  icon: typeof Eye; accent: string;
  onClose: () => void; children: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl lg:max-w-3xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
        style={{ boxShadow: "0 32px 80px -16px rgba(0,0,0,0.35)" }}>

        {/* Colour bar */}
        <div className={`h-1 w-full ${accent}`} />

        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent === "bg-[#5b21b6]" ? "bg-[#5b21b6]/10" : "bg-emerald-50"}`}>
            <Icon className={`w-4.5 h-4.5 ${accent === "bg-[#5b21b6]" ? "text-[#5b21b6]" : "text-emerald-600"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-black text-[#111111] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>{title}</h2>
            <p className="text-xs text-[#111111]/40 font-medium truncate mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#111111]/30 hover:text-[#111111] hover:bg-gray-100 transition-all shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}

/* ── Viewers Modal ───────────────────────────────────────────────── */
function ViewersModal({ target, token, onClose }: { target: NonNullable<ModalTarget>; token: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ totalViews: number; bookClicks: number; uniqueVisitors: number } | null>(null);
  const [viewers, setViewers] = useState<ApiPropertyView[]>([]);

  useEffect(() => {
    setLoading(true); setError(null);
    viewsApi.getPropertyViews(token, target.propertyId, { limit: "100" })
      .then((res) => { setSummary(res.summary); setViewers(res.data); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, target.propertyId]);

  return (
    <ModalShell title="Property Viewers" subtitle={target.propertyTitle} icon={Eye} accent="bg-[#5b21b6]" onClose={onClose}>
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-7 h-7 text-[#5b21b6] animate-spin" />
          <p className="text-sm text-[#111111]/40 font-medium">Loading viewers…</p>
        </div>
      )}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm font-semibold text-red-500">{error}</p>
        </div>
      )}
      {!loading && !error && (
        <>
          {/* Summary strip */}
          {summary && (
            <div className="grid grid-cols-3 gap-px bg-gray-100 border-b border-gray-100">
              {[
                { label: "Total Views", value: summary.totalViews, icon: Eye, color: "text-[#5b21b6]" },
                { label: "Book Clicks", value: summary.bookClicks, icon: BookOpen, color: "text-amber-600" },
                { label: "Unique Visitors", value: summary.uniqueVisitors, icon: Users, color: "text-emerald-600" },
              ].map(({ label, value, icon: Ic, color }) => (
                <div key={label} className="bg-white px-4 py-3 flex flex-col items-center text-center">
                  <Ic className={`w-4 h-4 mb-1 ${color}`} />
                  <p className={`text-lg font-black ${color}`} style={{ fontFamily: "Outfit, sans-serif" }}>{value}</p>
                  <p className="text-[10px] font-bold text-[#111111]/35 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {viewers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#5b21b6]/8 flex items-center justify-center">
                <Eye className="w-6 h-6 text-[#5b21b6]/30" />
              </div>
              <p className="text-sm font-black text-[#111111]">No viewers yet</p>
              <p className="text-xs text-[#111111]/40 font-medium">Views will appear here once customers open this property.</p>
            </div>
          )}

          {/* List */}
          {viewers.length > 0 && (
            <div className="divide-y divide-gray-50">
              {viewers.map((v, i) => (
                <div key={v._id} className="flex items-start gap-3 px-5 py-4 hover:bg-[#f8f9fa] transition-colors">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-[#5b21b6]/10 border border-[rgba(91,33,182,0.12)] flex items-center justify-center shrink-0 text-[#5b21b6] text-xs font-black">
                    {initials(v.userName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-black text-[#111111]" style={{ fontFamily: "Outfit, sans-serif" }}>{v.userName}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        v.source === "book"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-[#5b21b6]/8 text-[#5b21b6] border-[rgba(91,33,182,0.12)]"
                      }`}>{v.source === "book" ? "Book Click" : "Viewed"}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {v.userEmail && (
                        <a href={`mailto:${v.userEmail}`} className="flex items-center gap-1 text-xs text-[#111111]/50 hover:text-[#5b21b6] transition-colors font-medium">
                          <Mail className="w-3 h-3" />{v.userEmail}
                        </a>
                      )}
                      {v.userPhone && (
                        <a href={`tel:${v.userPhone}`} className="flex items-center gap-1 text-xs text-[#111111]/50 hover:text-[#5b21b6] transition-colors font-medium">
                          <Phone className="w-3 h-3" />{v.userPhone}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[#111111]/30 font-medium">
                      <Calendar className="w-3 h-3" />
                      {fmtDate(v.viewedAt)} at {fmtTime(v.viewedAt)}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#111111]/25 shrink-0 mt-1">#{i + 1}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </ModalShell>
  );
}

/* ── Inquiries Modal ─────────────────────────────────────────────── */
const INQ_STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  new:       { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-100"    },
  responded: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-100"   },
  closed:    { bg: "bg-gray-100",   text: "text-gray-500",    border: "border-gray-200"    },
};

function InquiriesModal({ target, token, onClose }: { target: NonNullable<ModalTarget>; token: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<ApiInquiry[]>([]);

  useEffect(() => {
    setLoading(true); setError(null);
    inquiriesApi.list(token, { propertyId: target.propertyId })
      .then((res) => setInquiries(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, target.propertyId]);

  const byStatus = {
    new: inquiries.filter((i) => i.status === "new").length,
    responded: inquiries.filter((i) => i.status === "responded").length,
    closed: inquiries.filter((i) => i.status === "closed").length,
  };

  return (
    <ModalShell title="Inquiries" subtitle={target.propertyTitle} icon={MessageSquare} accent="bg-emerald-500" onClose={onClose}>
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
          <p className="text-sm text-[#111111]/40 font-medium">Loading inquiries…</p>
        </div>
      )}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm font-semibold text-red-500">{error}</p>
        </div>
      )}
      {!loading && !error && (
        <>
          {/* Summary strip */}
          {inquiries.length > 0 && (
            <div className="grid grid-cols-3 gap-px bg-gray-100 border-b border-gray-100">
              {[
                { label: "New", value: byStatus.new, color: "text-blue-600" },
                { label: "Responded", value: byStatus.responded, color: "text-amber-600" },
                { label: "Closed", value: byStatus.closed, color: "text-gray-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white px-4 py-3 flex flex-col items-center text-center">
                  <p className={`text-lg font-black ${color}`} style={{ fontFamily: "Outfit, sans-serif" }}>{value}</p>
                  <p className="text-[10px] font-bold text-[#111111]/35 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {inquiries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-emerald-300" />
              </div>
              <p className="text-sm font-black text-[#111111]">No inquiries yet</p>
              <p className="text-xs text-[#111111]/40 font-medium">Inquiries from customers will appear here.</p>
            </div>
          )}

          {/* List */}
          {inquiries.length > 0 && (
            <div className="divide-y divide-gray-50">
              {inquiries.map((inq, i) => {
                const st = INQ_STATUS_STYLE[inq.status] ?? INQ_STATUS_STYLE.new;
                return (
                  <div key={inq._id} className="flex items-start gap-3 px-5 py-4 hover:bg-[#f8f9fa] transition-colors">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 text-xs font-black">
                      {initials(inq.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-black text-[#111111]" style={{ fontFamily: "Outfit, sans-serif" }}>{inq.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${st.bg} ${st.text} ${st.border}`}>
                          {inq.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-1.5">
                        {inq.email && (
                          <a href={`mailto:${inq.email}`} className="flex items-center gap-1 text-xs text-[#111111]/50 hover:text-emerald-600 transition-colors font-medium">
                            <Mail className="w-3 h-3" />{inq.email}
                          </a>
                        )}
                        {inq.phone && (
                          <a href={`tel:${inq.phone}`} className="flex items-center gap-1 text-xs text-[#111111]/50 hover:text-emerald-600 transition-colors font-medium">
                            <Phone className="w-3 h-3" />{inq.phone}
                          </a>
                        )}
                      </div>
                      {inq.message && (
                        <p className="text-xs text-[#111111]/50 font-medium line-clamp-2 mb-1.5 italic bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100">
                          "{inq.message}"
                        </p>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-[#111111]/30 font-medium">
                          <Calendar className="w-3 h-3" />{fmtDate(inq.createdAt)}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[#111111]/30 font-medium">
                          <Building2 className="w-3 h-3" />{inq.propertyTitle}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#111111]/25 shrink-0 mt-1">#{i + 1}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </ModalShell>
  );
}

/* ── MAIN PAGE ───────────────────────────────────────────────────── */
export function PropertiesPage() {
  const { token } = useAuthStore();

  const [properties, setProperties]       = useState<Property[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [activeTab, setActiveTab]         = useState<PropertyStatus | "all">("all");
  const [listingFilter, setListingFilter] = useState<ListingFilter>("all");
  const [viewMode, setViewMode]           = useState<ViewMode>("grid");
  const [search, setSearch]               = useState("");
  const [sort, setSort]                   = useState<SortKey>("newest");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sortOpen, setSortOpen]           = useState(false);
  const [viewersTarget, setViewersTarget] = useState<ModalTarget>(null);
  const [inquiriesTarget, setInquiriesTarget] = useState<ModalTarget>(null);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [search]);

  const fetchProperties = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const params: Record<string, string> = {};
      if (activeTab !== "all")     params.status      = activeTab;
      if (listingFilter !== "all") params.listingType = listingFilter;
      if (debouncedSearch.trim())  params.search      = debouncedSearch.trim();
      const res = await propertiesApi.list(token, params);
      setProperties(res.data.map(toUiProperty));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, listingFilter, debouncedSearch]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const sorted = [...properties];
  if (sort === "price_high") sorted.sort((a, b) => b.price - a.price);
  if (sort === "price_low")  sorted.sort((a, b) => a.price - b.price);
  if (sort === "views")      sorted.sort((a, b) => b.views - a.views);

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    try {
      if (token) await propertiesApi.delete(token, id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setConfirmDelete(null);
    } catch { setConfirmDelete(null); }
  };

  const handleStatusChange = async (id: string, status: PropertyStatus) => {
    try {
      if (token) await propertiesApi.update(token, id, { status });
      setProperties((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
    } catch { /* silently ignore */ }
  };

  const openViewers   = (p: Property) => setViewersTarget({ propertyId: p.id, propertyTitle: p.title });
  const openInquiries = (p: Property) => setInquiriesTarget({ propertyId: p.id, propertyTitle: p.title });

  const sortLabel      = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";
  const totalInquiries = properties.reduce((s, p) => s + p.inquiries, 0);

  return (
    <div className="max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>My Properties</h1>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <p className="text-sm font-medium text-[#111111]/40">{properties.length} listings</p>
            <span className="flex items-center gap-1 text-xs font-medium text-[#111111]/30">
              <MessageSquare className="w-3.5 h-3.5" />{totalInquiries} inquiries
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchProperties} disabled={loading}
            className="p-2.5 rounded-xl border border-[rgba(91,33,182,0.08)] text-[#111111]/30 hover:text-[#5b21b6] hover:border-[rgba(91,33,182,0.2)] transition-all disabled:opacity-40" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link to={ROUTES.PROPERTY_ADD} className="premium-btn flex items-center gap-2 px-5 h-11 text-xs tracking-widest shrink-0">
            <Plus className="w-4 h-4" />ADD PROPERTY
          </Link>
        </div>
      </div>

      {/* ── Controls bar ── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex gap-1 bg-white border border-[rgba(91,33,182,0.06)] rounded-xl p-1"
          style={{ boxShadow: "0 2px 8px -4px rgba(91,33,182,0.08)" }}>
          {STATUS_TABS.map((tab) => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-black capitalize transition-all duration-200 whitespace-nowrap"
              style={activeTab === tab.value
                ? { background: "#5b21b6", color: "#fff", boxShadow: "0 2px 8px -2px rgba(91,33,182,0.4)" }
                : { color: "rgba(17,17,17,0.4)" }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-white border border-[rgba(91,33,182,0.06)] rounded-xl p-1"
          style={{ boxShadow: "0 2px 8px -4px rgba(91,33,182,0.08)" }}>
          {LISTING_TABS.map((tab) => (
            <button key={tab.value} onClick={() => setListingFilter(tab.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-black transition-all duration-200 whitespace-nowrap"
              style={listingFilter === tab.value
                ? { background: tab.value === "sale" ? "#059669" : tab.value === "rent" ? "#2563eb" : "#5b21b6", color: "#fff", boxShadow: "0 2px 8px -2px rgba(0,0,0,0.25)" }
                : { color: "rgba(17,17,17,0.4)" }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or location…"
            className="dp-input pl-8 h-9 text-xs w-52" style={{ borderRadius: "0.75rem" }} />
        </div>

        <div className="relative">
          <button onClick={() => setSortOpen((o) => !o)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-black text-[#111111]/50 bg-white border border-[rgba(91,33,182,0.08)] hover:border-[rgba(91,33,182,0.2)] hover:text-[#5b21b6] transition-all whitespace-nowrap">
            {sortLabel} <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border border-[rgba(91,33,182,0.1)] shadow-xl overflow-hidden min-w-[160px]"
                style={{ boxShadow: "0 12px 32px -8px rgba(91,33,182,0.15)" }}>
                {SORT_OPTIONS.map((o) => (
                  <button key={o.value} onClick={() => { setSort(o.value); setSortOpen(false); }}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-xs font-bold text-left hover:bg-[#f8f9fa] transition-colors ${sort === o.value ? "text-[#5b21b6]" : "text-[#111111]/60"}`}>
                    {o.label}
                    {sort === o.value && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-0.5 bg-white border border-[rgba(91,33,182,0.08)] rounded-xl p-1">
          {([["grid", LayoutGrid], ["list", List]] as const).map(([mode, Icon]) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className="p-1.5 rounded-lg transition-all duration-200"
              style={viewMode === mode
                ? { background: "#5b21b6", color: "#fff", boxShadow: "0 1px 6px -1px rgba(91,33,182,0.4)" }
                : { color: "rgba(17,17,17,0.3)" }}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-[#5b21b6] animate-spin" />
          <p className="text-sm font-medium text-[#111111]/40">Loading properties…</p>
        </div>
      )}

      {!loading && error && (
        <div className="dp-card flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-sm font-semibold text-red-500">{error}</p>
          <button onClick={fetchProperties} className="premium-btn flex items-center gap-2 px-4 h-9 text-xs tracking-widest">
            <RefreshCw className="w-3.5 h-3.5" />Retry
          </button>
        </div>
      )}

      {!loading && !error && sorted.length === 0 && (
        <div className="dp-card flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#5b21b6]/8 border border-[rgba(91,33,182,0.1)] flex items-center justify-center mb-4">
            <Home className="w-7 h-7 text-[#5b21b6]/30" />
          </div>
          <p className="text-base font-black text-[#111111] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>No properties found</p>
          <p className="text-sm font-medium text-[#111111]/40 mb-6">
            {search ? `No results for "${search}"` : listingFilter !== "all" ? `No properties for ${listingFilter === "sale" ? "sale" : "rent"} match this filter.` : activeTab !== "all" ? `No ${activeTab} properties yet.` : "Add your first listing to get started."}
          </p>
          {!search && activeTab === "all" && (
            <Link to={ROUTES.PROPERTY_ADD} className="premium-btn flex items-center gap-2 px-5 h-10 text-xs tracking-widest">
              <Plus className="w-4 h-4" />ADD PROPERTY
            </Link>
          )}
        </div>
      )}

      {!loading && !error && sorted.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((p) => (
            <PropertyCard key={p.id} p={p} confirmDelete={confirmDelete}
              onDelete={handleDelete} onStatusChange={handleStatusChange}
              onViewClick={openViewers} onInquiryClick={openInquiries} />
          ))}
        </div>
      )}

      {!loading && !error && sorted.length > 0 && viewMode === "list" && (
        <div className="dp-card overflow-hidden">
          {sorted.map((p, i) => (
            <PropertyRow key={p.id} p={p} confirmDelete={confirmDelete} isLast={i === sorted.length - 1}
              onDelete={handleDelete} onStatusChange={handleStatusChange}
              onViewClick={openViewers} onInquiryClick={openInquiries} />
          ))}
        </div>
      )}

      {!loading && !error && sorted.length > 0 && (
        <p className="text-xs font-medium text-[#111111]/30 mt-4 text-center">
          Showing {sorted.length} {sorted.length === 1 ? "property" : "properties"}
        </p>
      )}

      {/* ── Modals ── */}
      {viewersTarget && token && (
        <ViewersModal target={viewersTarget} token={token} onClose={() => setViewersTarget(null)} />
      )}
      {inquiriesTarget && token && (
        <InquiriesModal target={inquiriesTarget} token={token} onClose={() => setInquiriesTarget(null)} />
      )}
    </div>
  );
}
