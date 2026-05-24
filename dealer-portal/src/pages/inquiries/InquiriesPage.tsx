import { useState, useEffect, useMemo } from "react";
import {
  MessageSquare, Phone, Mail, Clock, Building2,
  Search, RefreshCw, CheckCheck, X, Inbox,
  ChevronDown, SlidersHorizontal, User,
  AlertCircle, Loader2,
} from "lucide-react";
import { inquiriesApi, propertiesApi, type ApiInquiry } from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";

/* ── helpers ───────────────────────────────────────────── */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

const STATUS_CONFIG = {
  new:       { label: "New",        cls: "bg-purple-50 text-purple-700 border-purple-200",  dot: "bg-purple-500" },
  responded: { label: "Responded",  cls: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
  closed:    { label: "Closed",     cls: "bg-gray-100 text-gray-400 border-gray-200",        dot: "bg-gray-400" },
} as const;

const AVATAR_COLORS = [
  "bg-purple-600", "bg-indigo-600", "bg-sky-600",
  "bg-rose-600",   "bg-amber-600",  "bg-teal-600",
];
function avatarColor(name: string) {
  let n = 0;
  for (const c of name) n += c.charCodeAt(0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

type StatusFilter = "all" | ApiInquiry["status"];

const TAB_LABELS: { id: StatusFilter; label: string }[] = [
  { id: "all",       label: "All" },
  { id: "new",       label: "New" },
  { id: "responded", label: "Responded" },
  { id: "closed",    label: "Closed" },
];

/* ── Skeleton ────────────────────────────────────────────── */
function InquirySkeleton() {
  return (
    <div className="dp-card p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-5 rounded bg-gray-200" />
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="ml-auto h-5 w-16 rounded-full bg-gray-200" />
      </div>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="h-3 w-48 rounded bg-gray-200" />
        </div>
      </div>
      <div className="space-y-2 mb-4 pl-13">
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-3/4 rounded bg-gray-200" />
      </div>
      <div className="flex gap-3 pt-3 border-t border-gray-100">
        <div className="h-8 w-28 rounded-xl bg-gray-200" />
        <div className="h-8 w-28 rounded-xl bg-gray-200" />
        <div className="h-8 w-24 rounded-xl bg-gray-200 ml-auto" />
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export function InquiriesPage() {
  const { token } = useAuthStore();

  const [inquiries, setInquiries]   = useState<ApiInquiry[]>([]);
  const [propImages, setPropImages] = useState<Record<string, string>>({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [updating, setUpdating]     = useState<string | null>(null);

  const [tab, setTab]       = useState<StatusFilter>("all");
  const [query, setQuery]   = useState("");
  const [propFilter, setPropFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    Promise.all([
      inquiriesApi.list(token),
      propertiesApi.list(token),
    ])
      .then(([inqRes, propRes]) => {
        setInquiries(inqRes.data);
        const map: Record<string, string> = {};
        propRes.data.forEach(p => {
          if (p.images?.[0]) map[p._id] = p.images[0];
        });
        setPropImages(map);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  /* unique property list for dropdown */
  const propertyOptions = useMemo(() => {
    const titles = [...new Set(inquiries.map(i => i.propertyTitle).filter(Boolean))];
    return titles;
  }, [inquiries]);

  /* filtered list */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inquiries.filter(i => {
      if (tab !== "all" && i.status !== tab) return false;
      if (propFilter !== "all" && i.propertyTitle !== propFilter) return false;
      if (q && !i.name.toLowerCase().includes(q) &&
               !i.propertyTitle?.toLowerCase().includes(q) &&
               !i.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [inquiries, tab, query, propFilter]);

  /* counts per tab */
  const counts = useMemo(() => {
    const c = { all: inquiries.length, new: 0, responded: 0, closed: 0 };
    inquiries.forEach(i => { c[i.status] = (c[i.status] ?? 0) + 1; });
    return c;
  }, [inquiries]);

  const handleStatusChange = async (id: string, status: ApiInquiry["status"]) => {
    if (!token) return;
    setUpdating(id);
    try {
      const res = await inquiriesApi.updateStatus(token, id, status);
      setInquiries(prev => prev.map(i => i._id === id ? res.data : i));
    } catch {
      /* silently ignore */
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            Inquiries
          </h1>
          <p className="text-sm font-medium text-[#111111]/40 mt-0.5">
            {loading ? "Loading…" : `${counts.all} total · ${counts.new} new`}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-[#111111]/50 hover:text-[#5b21b6] hover:border-[#5b21b6]/30 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── Toolbar: tabs + search + property filter ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Status tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl shrink-0">
          {TAB_LABELS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all ${
                tab === t.id
                  ? "bg-white text-[#5b21b6] shadow-sm shadow-black/5"
                  : "text-[#111111]/40 hover:text-[#111111]/70"
              }`}
            >
              {t.label}
              {counts[t.id] > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                  tab === t.id
                    ? "bg-[#5b21b6] text-white"
                    : "bg-[#111111]/10 text-[#111111]/50"
                }`}>
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#111111]/30" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            type="text"
            placeholder="Search by name, email or property…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-[13px] font-medium text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/15 focus:border-[#5b21b6]/30 placeholder:text-[#111111]/25 transition-all"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-[#111111]/30 hover:text-[#111111]/60 transition-colors" />
            </button>
          )}
        </div>

        {/* Property filter */}
        {propertyOptions.length > 1 && (
          <div className="relative shrink-0">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5b21b6]/60 pointer-events-none" />
            <select
              value={propFilter}
              onChange={e => setPropFilter(e.target.value)}
              className="pl-8 pr-8 py-2.5 bg-white border border-gray-200 rounded-2xl text-[13px] font-medium text-[#111111]/70 focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/15 focus:border-[#5b21b6]/30 appearance-none cursor-pointer transition-all"
            >
              <option value="all">All Properties</option>
              {propertyOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#111111]/30 pointer-events-none" />
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => <InquirySkeleton key={n} />)}
        </div>
      ) : error ? (
        <div className="dp-card p-8 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-sm font-bold text-[#111111]/60">Failed to load inquiries</p>
          <p className="text-xs text-[#111111]/30">{error}</p>
          <button onClick={load} className="premium-btn text-xs px-4 py-2 mt-1">
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dp-card p-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#5b21b6]/8 flex items-center justify-center">
            <Inbox className="w-7 h-7 text-[#5b21b6]/40" />
          </div>
          <p className="text-base font-black text-[#111111]/50">
            {tab === "all" && !query ? "No inquiries yet" : "No matching inquiries"}
          </p>
          <p className="text-xs text-[#111111]/30 max-w-xs">
            {tab === "all" && !query
              ? "When customers enquire about your properties, they'll appear here."
              : "Try adjusting your filters or search term."}
          </p>
          {(tab !== "all" || query || propFilter !== "all") && (
            <button
              onClick={() => { setTab("all"); setQuery(""); setPropFilter("all"); }}
              className="mt-1 text-[12px] font-bold text-[#5b21b6] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(inq => {
            const sc = STATUS_CONFIG[inq.status];
            const isExpanded = expanded === inq._id;
            const isUpdating = updating === inq._id;
            const color = avatarColor(inq.name);

            return (
              <div
                key={inq._id}
                className={`dp-card overflow-hidden transition-all duration-300 ${inq.status === "new" ? "border-l-[3px] border-l-[#5b21b6]" : ""}`}
              >
                {/* ── Property banner ── */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  {/* Property thumbnail */}
                  {propImages[inq.propertyId] ? (
                    <img
                      src={propImages[inq.propertyId]}
                      alt={inq.propertyTitle}
                      className="w-14 h-10 rounded-xl object-cover shrink-0 border border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-10 rounded-xl bg-[#5b21b6]/10 flex items-center justify-center shrink-0 border border-[#5b21b6]/10">
                      <Building2 className="w-4 h-4 text-[#5b21b6]/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-[#5b21b6] truncate leading-tight">
                      {inq.propertyTitle || "Property Inquiry"}
                    </p>
                    <p className="text-[10px] text-[#111111]/30 font-medium mt-0.5 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {timeAgo(inq.createdAt)}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full capitalize border shrink-0 ${sc.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                </div>

                {/* ── Card body ── */}
                <div className="p-5">
                  {/* Customer row */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0 shadow-sm`}>
                      <span className="text-[13px] font-black text-white">{initials(inq.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-black text-[#111111] leading-tight">{inq.name}</p>
                        {inq.status === "new" && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#5b21b6] text-white tracking-widest uppercase">
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <a
                          href={`tel:${inq.phone}`}
                          className="flex items-center gap-1 text-[12px] font-medium text-[#111111]/40 hover:text-[#5b21b6] transition-colors"
                        >
                          <Phone className="w-3 h-3 shrink-0" />
                          {inq.phone}
                        </a>
                        <a
                          href={`mailto:${inq.email}`}
                          className="flex items-center gap-1 text-[12px] font-medium text-[#111111]/40 hover:text-[#5b21b6] transition-colors"
                        >
                          <Mail className="w-3 h-3 shrink-0" />
                          {inq.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="pl-13 mb-4">
                    <div className={`relative bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 ${!isExpanded && inq.message.length > 120 ? "cursor-pointer" : ""}`}
                      onClick={() => inq.message.length > 120 && setExpanded(isExpanded ? null : inq._id)}
                    >
                      <MessageSquare className="absolute top-3 right-3 w-3.5 h-3.5 text-[#111111]/15" />
                      <p className={`text-[13px] text-[#111111]/65 font-medium leading-relaxed pr-5 ${!isExpanded && inq.message.length > 120 ? "line-clamp-2" : ""}`}>
                        {inq.message || <span className="italic text-[#111111]/30">No message provided</span>}
                      </p>
                      {inq.message.length > 120 && (
                        <button className="text-[11px] font-bold text-[#5b21b6] mt-1 hover:underline">
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap pl-13">
                    <a
                      href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.propertyTitle || "Your Inquiry")}&body=Dear ${encodeURIComponent(inq.name)},%0A%0A`}
                      onClick={() => inq.status === "new" && handleStatusChange(inq._id, "responded")}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5b21b6] text-white text-[11px] font-black tracking-wider hover:opacity-90 active:scale-[0.97] transition-all shadow-sm shadow-[#5b21b6]/20"
                    >
                      <Mail className="w-3.5 h-3.5" /> Reply via Email
                    </a>

                    <a
                      href={`tel:${inq.phone}`}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-[11px] font-bold text-[#111111]/60 hover:border-[#5b21b6]/30 hover:text-[#5b21b6] transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>

                    {/* Status actions */}
                    <div className="ml-auto flex items-center gap-2">
                      {inq.status === "new" && (
                        <button
                          onClick={() => handleStatusChange(inq._id, "responded")}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-[11px] font-bold hover:bg-emerald-100 transition-all disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                          Mark Responded
                        </button>
                      )}
                      {inq.status === "responded" && (
                        <button
                          onClick={() => handleStatusChange(inq._id, "closed")}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 text-[11px] font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                          Close
                        </button>
                      )}
                      {inq.status === "closed" && (
                        <button
                          onClick={() => handleStatusChange(inq._id, "new")}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 text-[11px] font-bold hover:bg-purple-100 transition-all disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Summary footer ── */}
      {!loading && !error && filtered.length > 0 && (
        <div className="flex items-center justify-between text-[11px] font-bold text-[#111111]/25 pt-2">
          <span>Showing {filtered.length} of {counts.all} inquiries</span>
          {counts.new > 0 && (
            <span className="text-[#5b21b6]/60">{counts.new} need{counts.new === 1 ? "s" : ""} attention</span>
          )}
        </div>
      )}
    </div>
  );
}
