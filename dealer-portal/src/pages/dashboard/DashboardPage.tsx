import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Eye, MessageSquare, Home, TrendingUp, Plus, ArrowUpRight,
  Building2, IndianRupee, BarChart3, Loader2, RefreshCw,
  CheckCheck, Clock, XCircle, Star, Layers,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { analyticsApi, propertiesApi, inquiriesApi, type ApiAnalytics, type ApiProperty, type ApiInquiry } from "../../services/api";
import { ROUTES } from "../../constants/routes";

/* ── helpers ─────────────────────────────────────────────── */
function greeting(name: string) {
  const h = new Date().getHours();
  const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${g}, ${name.split(" ")[0]} 👋`;
}

function fmt(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ── Skeleton ─────────────────────────────────────────────── */
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

function StatSkeleton() {
  return (
    <div className="dp-card p-5">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="w-20 h-7 mb-1" />
      <Skeleton className="w-28 h-3" />
    </div>
  );
}

/* ── Stat Card ────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, trend, sub, accent = false }: {
  label: string; value: string | number; icon: React.ElementType;
  trend?: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className={`dp-card p-5 transition-all duration-300 hover:-translate-y-0.5 ${accent ? "border-[#166534]/20 bg-gradient-to-br from-[#166534]/5 to-emerald-50/60" : ""}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? "bg-[#166534]/15" : "bg-[#166534]/8"}`}>
          <Icon className="w-4.5 h-4.5 text-[#166534]" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-2.5 h-2.5" />{trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-[#0c2417] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
        {value}
      </p>
      <p className="text-xs font-medium text-[#0c2417]/40 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] font-bold text-[#166534]/60 mt-1">{sub}</p>}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────── */
export function DashboardPage() {
  const { user, token } = useAuthStore();

  const [analytics, setAnalytics]   = useState<ApiAnalytics | null>(null);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [inquiries, setInquiries]   = useState<ApiInquiry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    Promise.all([
      analyticsApi.get(token),
      propertiesApi.list(token),
      inquiriesApi.list(token),
    ])
      .then(([aRes, pRes, iRes]) => {
        setAnalytics(aRes.data);
        setProperties(pRes.data);
        setInquiries(iRes.data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const recent   = [...properties].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const newInqs  = inquiries.filter(i => i.status === "new").slice(0, 4);
  const s        = analytics?.summary;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0c2417] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            {user ? greeting(user.name) : "Dashboard"}
          </h1>
          <p className="text-sm font-medium text-[#0c2417]/40 mt-0.5">
            {loading ? "Loading your overview…" : "Here's what's happening with your listings today."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#0c2417]/40 hover:text-[#166534] hover:border-[#166534]/30 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link to={ROUTES.PROPERTY_ADD}
            className="premium-btn flex items-center gap-2 px-5 h-10 text-xs tracking-widest">
            <Plus className="w-3.5 h-3.5" />ADD PROPERTY
          </Link>
        </div>
      </div>

      {error && (
        <div className="dp-card p-4 flex items-center gap-3 border-red-100 bg-red-50">
          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm font-medium text-red-500 flex-1">{error}</p>
          <button onClick={load} className="text-xs font-bold text-red-500 hover:underline">Retry</button>
        </div>
      )}

      {/* ── Stats Grid ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(n => <StatSkeleton key={n} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Properties"
            value={s?.totalProperties ?? 0}
            icon={Home}
            sub={`${(analytics?.byListing?.["sale"] ?? 0)} sale · ${(analytics?.byListing?.["rent"] ?? 0)} rent`}
          />
          <StatCard
            label="Active Listings"
            value={s?.activeListings ?? 0}
            icon={Building2}
            trend={s?.activeListings ? `${s.activeListings} live` : undefined}
          />
          <StatCard
            label="Total Views"
            value={(s?.totalViews ?? 0).toLocaleString("en-IN")}
            icon={Eye}
          />
          <StatCard
            label="Inquiries"
            value={s?.totalInquiries ?? 0}
            icon={MessageSquare}
            trend={analytics?.inquiryBreakdown?.new ? `${analytics.inquiryBreakdown.new} new` : undefined}
            accent
          />
        </div>
      )}

      {/* ── Portfolio Value + Inquiry Breakdown ── */}
      {!loading && analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Portfolio Value */}
          <div className="dp-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#166534]/15 to-emerald-100 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5 text-[#166534]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#0c2417]/30 mb-0.5">Portfolio Value</p>
              <p className="text-2xl font-black text-[#0c2417] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                {fmt(s?.portfolioValue ?? 0)}
              </p>
              <p className="text-[11px] text-[#0c2417]/35 font-medium mt-0.5">Active sale listings</p>
            </div>
          </div>

          {/* Inquiry Breakdown */}
          <div className="dp-card p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#0c2417]/30 mb-3">Inquiry Status</p>
            <div className="flex items-center gap-3">
              {[
                { key: "new",       label: "New",       icon: Star,       cls: "bg-emerald-50 border-emerald-100 text-emerald-700" },
                { key: "responded", label: "Responded", icon: CheckCheck,  cls: "bg-emerald-50 border-emerald-100 text-emerald-600" },
                { key: "closed",    label: "Closed",    icon: XCircle,    cls: "bg-gray-50 border-gray-200 text-gray-400" },
              ].map(({ key, label, icon: Icon, cls }) => (
                <div key={key} className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border ${cls}`}>
                  <Icon className="w-4 h-4" />
                  <p className="text-xl font-black" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {analytics.inquiryBreakdown?.[key] ?? 0}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Listings + New Inquiries ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Recent Listings — wider */}
        <div className="dp-card overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(22,101,52,0.06)]">
            <h2 className="text-[11px] font-black text-[#0c2417] uppercase tracking-widest" style={{ fontFamily: "Outfit, sans-serif" }}>
              Recent Listings
            </h2>
            <Link to={ROUTES.PROPERTIES} className="flex items-center gap-1 text-[10px] font-black text-[#166534] hover:underline underline-offset-4 uppercase tracking-widest">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-4">
              {[1,2,3].map(n => (
                <div key={n} className="flex items-center gap-3 animate-pulse">
                  <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-40 h-3.5" />
                    <Skeleton className="w-24 h-3" />
                  </div>
                  <Skeleton className="w-16 h-4" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="py-10 text-center text-[#0c2417]/30 text-xs font-medium">
              No properties yet. <Link to={ROUTES.PROPERTY_ADD} className="text-[#166534] hover:underline">Add one →</Link>
            </div>
          ) : (
            recent.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors"
                style={{ borderBottom: i < recent.length - 1 ? "1px solid rgba(22,101,52,0.05)" : "none" }}>
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                  {p.images[0]
                    ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Home className="w-5 h-5 text-[#166534]/20" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#0c2417] truncate">{p.title}</p>
                  <p className="text-[11px] font-medium text-[#0c2417]/35 truncate mt-0.5">{p.city || p.location}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-black text-[#0c2417]">
                    {fmt(p.price)}{p.listingType === "rent" && <span className="text-[10px] font-medium text-[#0c2417]/35">/mo</span>}
                  </p>
                  <div className="flex items-center gap-1.5 justify-end mt-1">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full capitalize border ${
                      p.status === "active"  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : p.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-100"
                      : "bg-gray-50 text-gray-400 border-gray-100"}`}>
                      {p.status}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-[#0c2417]/25 font-medium">
                      <Eye className="w-2.5 h-2.5" />{p.views}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Inquiries — narrower */}
        <div className="dp-card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(22,101,52,0.06)]">
            <h2 className="text-[11px] font-black text-[#0c2417] uppercase tracking-widest" style={{ fontFamily: "Outfit, sans-serif" }}>
              New Inquiries
            </h2>
            <Link to={ROUTES.INQUIRIES} className="flex items-center gap-1 text-[10px] font-black text-[#166534] hover:underline underline-offset-4 uppercase tracking-widest">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-4">
              {[1,2,3].map(n => (
                <div key={n} className="animate-pulse space-y-2">
                  <Skeleton className="w-28 h-3.5" />
                  <Skeleton className="w-40 h-3" />
                </div>
              ))}
            </div>
          ) : newInqs.length === 0 ? (
            <div className="py-10 text-center text-[#0c2417]/30 text-xs font-medium">No new inquiries</div>
          ) : (
            newInqs.map((inq, i) => (
              <div key={inq._id} className="px-5 py-4 hover:bg-gray-50/80 transition-colors"
                style={{ borderBottom: i < newInqs.length - 1 ? "1px solid rgba(22,101,52,0.05)" : "none" }}>
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#166534] flex items-center justify-center shrink-0 text-[11px] font-black text-white">
                    {inq.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-bold text-[#0c2417] truncate">{inq.name}</p>
                      <span className="text-[10px] text-[#0c2417]/25 font-medium shrink-0 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />{timeAgo(inq.createdAt)}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-[#166534] truncate mt-0.5">{inq.propertyTitle}</p>
                    <p className="text-[11px] text-[#0c2417]/40 line-clamp-1 mt-0.5">{inq.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Top Properties by Views ── */}
      {!loading && (analytics?.topProperties?.length ?? 0) > 0 && (
        <div className="dp-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[rgba(22,101,52,0.06)]">
            <BarChart3 className="w-4 h-4 text-[#166534]" />
            <h2 className="text-[11px] font-black text-[#0c2417] uppercase tracking-widest" style={{ fontFamily: "Outfit, sans-serif" }}>
              Top Properties by Views
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {analytics!.topProperties.map((p, i) => {
              const maxViews = analytics!.topProperties[0]?.views || 1;
              const pct = Math.round((p.views / maxViews) * 100);
              return (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-[#0c2417]/20 w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[12px] font-bold text-[#0c2417] truncate">{p.title}</p>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#0c2417]/40">
                          <Eye className="w-3 h-3" />{p.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#0c2417]/40">
                          <MessageSquare className="w-3 h-3" />{p.inquiries}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#166534] to-emerald-400 rounded-full"
                        style={{ width: `${pct}%`, transition: "width 0.8s ease" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
