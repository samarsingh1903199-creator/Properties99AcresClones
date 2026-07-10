import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, RefreshCw, Loader2, AlertCircle, ImageOff,
  MapPin, BedDouble, Bath, Maximize2, Pencil, Home,
} from "lucide-react";
import { propertiesApi, type ApiProperty } from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";
import { ROUTES } from "../../constants/routes";
import { HighlightToggle } from "../../components/properties/HighlightToggle";

type Property = ApiProperty & { id: string };
function toUiProperty(p: ApiProperty): Property {
  return { ...p, id: p._id };
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function HighlightedCard({
  p,
  loading,
  onToggle,
}: {
  p: Property;
  loading: boolean;
  onToggle: (id: string, highlighted: boolean) => void;
}) {
  return (
    <div className="dp-card overflow-hidden group flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(245,158,11,0.25)]">
      <div className="relative overflow-hidden bg-[#f4f9f6]" style={{ aspectRatio: "16/10" }}>
        {p.images.length > 0 ? (
          <>
            <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ImageOff className="w-8 h-8 text-amber-400/40" />
            <span className="text-xs font-medium text-[#0c2417]/30">No photos yet</span>
          </div>
        )}
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg">
          <Sparkles className="w-3 h-3" />
          Featured
        </span>
        <span className="absolute bottom-3 right-3 bg-[#166534] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
          For {p.listingType}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">{p.type}</span>
        </div>
        <h3 className="font-black text-[#0c2417] text-sm leading-tight mb-1 line-clamp-1" style={{ fontFamily: "Outfit, sans-serif" }}>
          {p.title}
        </h3>
        <div className="flex items-center gap-1 text-xs font-medium text-[#0c2417]/40 mb-3">
          <MapPin className="w-3 h-3 shrink-0 text-[#166534]/40" />
          <span className="truncate">{p.location}</span>
        </div>

        <div className="flex items-center gap-3 pb-3 mb-3 border-b border-[rgba(22,101,52,0.06)]">
          <span className="flex items-center gap-1 text-xs font-semibold text-[#0c2417]/60">
            <BedDouble className="w-3.5 h-3.5 text-[#166534]/40" />{p.bedrooms} Beds
          </span>
          <span className="w-px h-3 bg-gray-200" />
          <span className="flex items-center gap-1 text-xs font-semibold text-[#0c2417]/60">
            <Bath className="w-3.5 h-3.5 text-[#166534]/40" />{p.bathrooms} Baths
          </span>
          <span className="w-px h-3 bg-gray-200" />
          <span className="flex items-center gap-1 text-xs font-semibold text-[#0c2417]/60">
            <Maximize2 className="w-3.5 h-3.5 text-[#166534]/40" />{p.area.toLocaleString()} sq.ft
          </span>
        </div>

        <p className="text-xl font-black text-[#0c2417] tracking-tight mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
          ₹{p.price.toLocaleString("en-IN")}
          {p.listingType === "rent" && <span className="text-sm font-semibold text-[#0c2417]/40">/mo</span>}
        </p>
        <p className="text-[11px] font-medium text-[#0c2417]/35 mb-4">
          Highlighted on {fmtDate(p.highlightedAt)}
        </p>

        <div className="flex gap-2 mt-auto">
          <HighlightToggle
            isHighlighted
            loading={loading}
            showLabel
            onToggle={() => onToggle(p.id, false)}
          />
          <Link
            to={ROUTES.PROPERTY_EDIT(p.id)}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-black uppercase tracking-wider border border-[rgba(22,101,52,0.15)] text-[#166534] hover:bg-[#166534] hover:text-white hover:border-[#166534] transition-all duration-200"
          >
            <Pencil className="w-3.5 h-3.5" />Edit
          </Link>
        </div>
      </div>
    </div>
  );
}

export function HighlightedPropertiesPage() {
  const { token } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const fetchHighlighted = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await propertiesApi.listHighlighted(token);
      setProperties(res.data.map(toUiProperty));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load highlighted properties");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHighlighted();
  }, [fetchHighlighted]);

  const handleToggle = async (id: string, highlighted: boolean) => {
    if (!token || togglingIds.has(id)) return;

    setTogglingIds((prev) => new Set(prev).add(id));
    if (!highlighted) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }

    try {
      await propertiesApi.setHighlighted(token, id, highlighted);
      if (highlighted) {
        await fetchHighlighted();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update highlight");
      await fetchHighlighted();
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <h1 className="text-2xl font-black text-[#0c2417] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Highlighted Properties
            </h1>
          </div>
          <p className="text-sm font-medium text-[#0c2417]/40 max-w-xl">
            Featured listings appear on the public site. Mark properties as highlighted from My Properties using the sparkle icon.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHighlighted}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[rgba(22,101,52,0.08)] text-[#0c2417]/30 hover:text-[#166534] hover:border-[rgba(22,101,52,0.2)] transition-all disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to={ROUTES.PROPERTIES}
            className="premium-btn flex items-center gap-2 px-5 h-11 text-xs tracking-widest shrink-0"
          >
            <Home className="w-4 h-4" />MY PROPERTIES
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm font-medium text-[#0c2417]/40">Loading highlighted listings…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && properties.length === 0 && (
        <div className="dp-card flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-lg font-black text-[#0c2417] mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
            No highlighted properties yet
          </h2>
          <p className="text-sm font-medium text-[#0c2417]/40 mb-6 max-w-md">
            Open My Properties and use the sparkle icon on active or pending listings to feature them on the public website.
          </p>
          <Link to={ROUTES.PROPERTIES} className="premium-btn flex items-center gap-2 px-5 h-10 text-xs tracking-widest">
            <Home className="w-4 h-4" />GO TO MY PROPERTIES
          </Link>
        </div>
      )}

      {!loading && !error && properties.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((p) => (
              <HighlightedCard
                key={p.id}
                p={p}
                loading={togglingIds.has(p.id)}
                onToggle={handleToggle}
              />
            ))}
          </div>
          <p className="text-xs font-medium text-[#0c2417]/30 mt-4 text-center">
            {properties.length} highlighted {properties.length === 1 ? "property" : "properties"}
          </p>
        </>
      )}
    </div>
  );
}
