import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Video, Calendar, Clock, Users, Phone, Mail,
  Building2, Search, ChevronDown, Loader2, X,
  CheckCircle2, XCircle, AlertCircle, Clock3, RefreshCw,
  MapPin, ArrowUpRight, Eye, Hash, ChevronLeft, ChevronRight,
  MessageSquareText, Filter, SlidersHorizontal,
} from "lucide-react";
import { visitEnquiriesApi, type ApiVisitEnquiry } from "@/src/services/api";
import { useAuthStore } from "@/src/store/useAuthStore";
import { cn, toTitleCase } from "@/src/lib/utils";
import { Link } from "react-router-dom";
import { ROUTES } from "@/src/constants/routes";

/* ─── Types & Constants ─────────────────────────────────────────────── */
type EnquiryStatus = ApiVisitEnquiry["status"];

const STATUS_META: Record<EnquiryStatus, {
  label: string; color: string; bg: string; border: string;
  barColor: string; icon: React.ElementType;
}> = {
  pending:   { label: "Pending",   color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200", barColor: "bg-amber-400",   icon: Clock3 },
  confirmed: { label: "Confirmed", color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",  barColor: "bg-blue-500",    icon: CheckCircle2 },
  completed: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200",barColor: "bg-emerald-500", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200",   barColor: "bg-red-400",     icon: XCircle },
};

const VISIT_META = {
  physical: {
    icon: Home,  label: "Physical Visit",
    color: "text-luxury-purple", bg: "bg-luxury-purple/8", border: "border-luxury-purple/20",
    gradient: "from-luxury-purple to-indigo-600",
  },
  video: {
    icon: Video, label: "Video Tour",
    color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200",
    gradient: "from-sky-500 to-indigo-500",
  },
} as const;

const STATUS_TABS: { key: "all" | EnquiryStatus; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const PAGE_SIZE = 10;

/* ─── Helpers ────────────────────────────────────────────────────────── */
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}
function fmtVisitDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

/* ─── Status Badge ───────────────────────────────────────────────────── */
function StatusBadge({ status, size = "sm" }: { status: EnquiryStatus; size?: "sm" | "lg" }) {
  const m = STATUS_META[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-xl border font-black uppercase tracking-wider",
      m.bg, m.border, m.color,
      size === "lg" ? "px-3.5 py-1.5 text-[11px]" : "px-2.5 py-1 text-[9px]"
    )}>
      <m.icon size={size === "lg" ? 12 : 10} />
      {m.label}
    </span>
  );
}

/* ─── Status Update Select ───────────────────────────────────────────── */
function StatusSelect({ current, enquiryId, token, onUpdate }: {
  current: EnquiryStatus; enquiryId: string; token: string;
  onUpdate: (id: string, status: EnquiryStatus) => void;
}) {
  const [busy, setBusy] = useState(false);
  const m = STATUS_META[current];

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as EnquiryStatus;
    if (next === current) return;
    setBusy(true);
    try {
      await visitEnquiriesApi.updateStatus(enquiryId, next, token);
      onUpdate(enquiryId, next);
    } catch { /* noop */ }
    finally { setBusy(false); }
  };

  return (
    <div className="relative">
      {busy && <Loader2 size={11} className="absolute right-8 top-1/2 -translate-y-1/2 animate-spin text-luxury-purple pointer-events-none" />}
      <select
        value={current}
        onChange={handleChange}
        disabled={busy}
        className={cn(
          "appearance-none pl-3 pr-8 py-2 rounded-xl border text-[11px] font-bold cursor-pointer focus:outline-none transition-all",
          m.bg, m.border, m.color, busy && "opacity-50"
        )}
      >
        {(Object.keys(STATUS_META) as EnquiryStatus[]).map(s => (
          <option key={s} value={s}>{STATUS_META[s].label}</option>
        ))}
      </select>
      <ChevronDown size={11} className={cn("absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none", m.color)} />
    </div>
  );
}

/* ─── Detail Drawer ──────────────────────────────────────────────────── */
function DetailRow({ icon: Icon, label, value, className }: {
  icon: React.ElementType; label: string; value: React.ReactNode; className?: string;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-luxury-purple/8 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-luxury-purple" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-luxury-black/30 mb-0.5">{label}</p>
        <div className={cn("text-[13px] font-semibold text-luxury-black break-words", className)}>{value}</div>
      </div>
    </div>
  );
}

function EnquiryDrawer({ enquiry, token, onClose, onStatusUpdate }: {
  enquiry: ApiVisitEnquiry | null;
  token: string;
  onClose: () => void;
  onStatusUpdate: (id: string, status: EnquiryStatus) => void;
}) {
  /* Close on Escape */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = enquiry ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [enquiry]);

  const vm  = enquiry ? VISIT_META[enquiry.visitType] : null;
  const sm  = enquiry ? STATUS_META[enquiry.status]  : null;
  const VisitIcon = vm?.icon ?? Home;

  return (
    <AnimatePresence>
      {enquiry && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-luxury-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative w-full max-w-[480px] h-full bg-white shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Gradient header */}
            <div className={cn("bg-gradient-to-br text-white p-6 shrink-0", vm?.gradient ?? "from-luxury-purple to-indigo-600")}>
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/50 mb-1">Visit Enquiry</p>
                  <h2 className="text-xl font-display font-black leading-snug">
                    {toTitleCase(enquiry.name)}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center hover:bg-white/25 transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Visit type + status */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/15 border border-white/20 text-[10px] font-black uppercase tracking-wider">
                  <VisitIcon size={11} /> {vm?.label}
                </span>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider",
                  sm?.bg, sm?.border, sm?.color
                )}>
                  {sm && <sm.icon size={10} />}
                  {sm?.label}
                </span>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Contact Info */}
              <div className="px-6 pt-5">
                <p className="text-[9px] font-black uppercase tracking-widest text-luxury-black/25 mb-1">Contact Information</p>
                <div className="divide-y divide-gray-100">
                  <DetailRow icon={Mail}  label="Email Address" value={enquiry.email} />
                  <DetailRow icon={Phone} label="Mobile Number" value={
                    <a href={`tel:+91${enquiry.phone}`} className="text-luxury-purple hover:underline">
                      +91 {enquiry.phone}
                    </a>
                  } />
                </div>
              </div>

              {/* Visit Details */}
              <div className="px-6 pt-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-luxury-black/25 mb-1">Visit Details</p>
                <div className="divide-y divide-gray-100">
                  <DetailRow icon={VisitIcon} label="Visit Type"  value={vm?.label} />
                  <DetailRow icon={Calendar}  label="Visit Date"  value={fmtVisitDate(enquiry.visitDate)} />
                  <DetailRow icon={Clock}     label="Preferred Time" value={enquiry.visitTime} />
                  <DetailRow icon={Users}     label="No. of Guests"
                    value={`${enquiry.guestCount} ${enquiry.guestCount === 1 ? "guest" : "guests"}`}
                  />
                </div>
              </div>

              {/* Property */}
              <div className="px-6 pt-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-luxury-black/25 mb-1">Property</p>
                <div className="divide-y divide-gray-100">
                  <DetailRow icon={Building2} label="Property Name" value={
                    <Link
                      to={ROUTES.PROPERTY_DETAILS(enquiry.propertyId)}
                      className="text-luxury-purple font-bold hover:underline underline-offset-2 flex items-center gap-1"
                      target="_blank"
                    >
                      {toTitleCase(enquiry.propertyTitle)}
                      <ArrowUpRight size={12} />
                    </Link>
                  } />
                  <DetailRow icon={Hash} label="Property ID" value={
                    <span className="font-mono text-[12px] text-luxury-black/50">{enquiry.propertyId}</span>
                  } />
                </div>
              </div>

              {/* Message */}
              {enquiry.message && (
                <div className="px-6 pt-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-luxury-black/25 mb-1">Message / Notes</p>
                  <div className="bg-luxury-gray rounded-2xl border border-gray-200 p-4">
                    <div className="flex gap-2.5">
                      <MessageSquareText size={14} className="text-luxury-purple/50 shrink-0 mt-0.5" />
                      <p className="text-[13px] text-luxury-black/60 leading-relaxed italic">"{enquiry.message}"</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="px-6 pt-4 pb-6">
                <p className="text-[9px] font-black uppercase tracking-widest text-luxury-black/25 mb-1">Enquiry Info</p>
                <div className="divide-y divide-gray-100">
                  <DetailRow icon={Hash}     label="Enquiry ID"    value={
                    <span className="font-mono text-[11px] text-luxury-black/40">{enquiry._id}</span>
                  } />
                  <DetailRow icon={Clock3}   label="Submitted On"  value={fmtDateTime(enquiry.createdAt)} />
                  <DetailRow icon={Clock}    label="Last Updated"  value={fmtDateTime(enquiry.updatedAt)} />
                </div>
              </div>
            </div>

            {/* Footer — status change */}
            <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-white">
              <p className="text-[9px] font-black uppercase tracking-widest text-luxury-black/30 mb-3">Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(STATUS_META) as EnquiryStatus[]).map(s => {
                  const m = STATUS_META[s];
                  const active = enquiry.status === s;
                  return (
                    <button
                      key={s}
                      onClick={async () => {
                        if (active) return;
                        try {
                          await visitEnquiriesApi.updateStatus(enquiry._id, s, token);
                          onStatusUpdate(enquiry._id, s);
                        } catch { /* noop */ }
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all",
                        active
                          ? cn(m.bg, m.border, m.color, "shadow-sm")
                          : "bg-white border-gray-200 text-luxury-black/40 hover:border-luxury-purple/20 hover:text-luxury-black"
                      )}
                    >
                      <m.icon size={12} className={active ? m.color : ""} />
                      {m.label}
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Enquiry Card ───────────────────────────────────────────────────── */
function EnquiryCard({ enquiry, token, onStatusUpdate, onView }: {
  enquiry: ApiVisitEnquiry;
  token: string;
  onStatusUpdate: (id: string, status: EnquiryStatus) => void;
  onView: (e: ApiVisitEnquiry) => void;
}) {
  const vm = VISIT_META[enquiry.visitType];
  const sm = STATUS_META[enquiry.status];
  const VisitIcon = vm.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-luxury-purple/10 transition-all overflow-hidden"
    >
      {/* Status color bar */}
      <div className={cn("h-[3px] w-full", sm.barColor)} />

      <div className="p-4 sm:p-5">
        {/* Top row: avatar + name + badges + actions */}
        <div className="flex items-start gap-3 mb-3">
          {/* Visit type avatar */}
          <div className={cn(
            "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
            vm.bg, vm.border
          )}>
            <VisitIcon size={17} className={vm.color} />
          </div>

          {/* Name + visit type */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[14px] font-black text-luxury-black leading-snug">
                {toTitleCase(enquiry.name)}
              </p>
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-wide",
                vm.bg, vm.border, vm.color
              )}>
                <VisitIcon size={8} />{vm.label}
              </span>
            </div>

            {/* Property */}
            <Link
              to={ROUTES.PROPERTY_DETAILS(enquiry.propertyId)}
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 mt-0.5 text-[11px] text-luxury-purple font-bold hover:underline underline-offset-2"
            >
              <MapPin size={9} />
              {toTitleCase(enquiry.propertyTitle)}
              <ArrowUpRight size={9} />
            </Link>
          </div>

          {/* Status badge */}
          <StatusBadge status={enquiry.status} />
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="bg-luxury-gray rounded-xl p-2.5">
            <p className="text-[8px] font-black uppercase tracking-widest text-luxury-black/30 mb-0.5">Email</p>
            <p className="text-[11px] font-semibold text-luxury-black truncate" title={enquiry.email}>{enquiry.email}</p>
          </div>
          <div className="bg-luxury-gray rounded-xl p-2.5">
            <p className="text-[8px] font-black uppercase tracking-widest text-luxury-black/30 mb-0.5">Mobile</p>
            <p className="text-[11px] font-semibold text-luxury-black">+91 {enquiry.phone}</p>
          </div>
          <div className="bg-luxury-gray rounded-xl p-2.5">
            <p className="text-[8px] font-black uppercase tracking-widest text-luxury-black/30 mb-0.5">Visit Date</p>
            <p className="text-[11px] font-semibold text-luxury-black">{fmtDate(enquiry.visitDate)}</p>
          </div>
          <div className="bg-luxury-gray rounded-xl p-2.5">
            <p className="text-[8px] font-black uppercase tracking-widest text-luxury-black/30 mb-0.5">Time • Guests</p>
            <p className="text-[11px] font-semibold text-luxury-black">{enquiry.visitTime} · {enquiry.guestCount}p</p>
          </div>
        </div>

        {/* Message preview */}
        {enquiry.message && (
          <p className="text-[11px] text-luxury-black/40 italic line-clamp-1 mb-3 flex gap-1.5 items-start">
            <MessageSquareText size={10} className="shrink-0 mt-0.5 text-luxury-black/25" />
            "{enquiry.message}"
          </p>
        )}

        {/* Bottom row: submitted date + status select + view */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
          <p className="text-[10px] text-luxury-black/30 font-medium flex-1">
            Submitted {fmtDateTime(enquiry.createdAt)}
          </p>
          <StatusSelect
            current={enquiry.status}
            enquiryId={enquiry._id}
            token={token}
            onUpdate={onStatusUpdate}
          />
          <button
            onClick={() => onView(enquiry)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-luxury-purple/8 border border-luxury-purple/15 text-luxury-purple text-[11px] font-bold hover:bg-luxury-purple hover:text-white transition-all"
          >
            <Eye size={12} /> View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export const EnquiriesPage = () => {
  const { token, user } = useAuthStore();

  /* Data */
  const [enquiries, setEnquiries] = useState<ApiVisitEnquiry[]>([]);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  /* Filters (server-side) */
  const [statusFilter,   setStatusFilter]   = useState<"all" | EnquiryStatus>("all");
  const [visitFilter,    setVisitFilter]    = useState<"all" | "physical" | "video">("all");
  const [search,         setSearch]         = useState("");
  const [dateFilter,     setDateFilter]     = useState("");
  const [page,           setPage]           = useState(1);

  /* UI */
  const [activeTab,    setActiveTab]    = useState<"all" | EnquiryStatus>("all");
  const [drawerItem,   setDrawerItem]   = useState<ApiVisitEnquiry | null>(null);
  const [filterOpen,   setFilterOpen]   = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Counts for stats (from full unfiltered list—recomputed server-side via separate call) */
  const [allCounts, setAllCounts] = useState<Record<string, number>>({});

  /* ── Fetch data ── */
  const fetchData = useCallback(async (opts?: { silent?: boolean }) => {
    if (!token) return;
    if (!opts?.silent) setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(PAGE_SIZE) };
      if (statusFilter !== "all") params.status    = statusFilter;
      if (visitFilter  !== "all") params.visitType = visitFilter;
      if (search.trim())          params.search    = search.trim();
      if (dateFilter)             params.date      = dateFilter;

      const res = await visitEnquiriesApi.list(token, params);
      setEnquiries(res.data);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, visitFilter, search, dateFilter]);

  /* Separate call for status counts (no filters except visitor filters) */
  const fetchCounts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await visitEnquiriesApi.list(token, { limit: "1000" });
      const c: Record<string, number> = { all: res.total };
      res.data.forEach(e => { c[e.status] = (c[e.status] ?? 0) + 1; });
      setAllCounts(c);
    } catch { /* noop */ }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  /* Debounce search */
  const handleSearchChange = (v: string) => {
    setSearch(v);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => setPage(1), 350);
  };

  /* Tab click also sets server filter */
  const handleTabClick = (key: "all" | EnquiryStatus) => {
    setActiveTab(key);
    setStatusFilter(key);
    setPage(1);
  };

  const handleStatusUpdate = (id: string, status: EnquiryStatus) => {
    setEnquiries(prev => prev.map(e => e._id === id ? { ...e, status } : e));
    if (drawerItem?._id === id) setDrawerItem(prev => prev ? { ...prev, status } : prev);
    fetchCounts();
  };

  const handleReset = () => {
    setSearch(""); setVisitFilter("all"); setDateFilter("");
    setStatusFilter("all"); setActiveTab("all"); setPage(1);
  };

  const hasActiveFilters = search || visitFilter !== "all" || dateFilter || statusFilter !== "all";

  /* ── Access guard ── */
  if (!user || user.role === "visitor") {
    return (
      <div className="min-h-screen bg-luxury-gray flex items-center justify-center pt-24">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-luxury-purple/40 mx-auto mb-4" />
          <p className="text-lg font-black text-luxury-black">Dealer Access Required</p>
          <p className="text-sm text-luxury-black/40 mt-2">Only dealers and admins can view enquiries.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-gray pt-24 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10">

        {/* ── Page Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-luxury-purple mb-1">Dealer Panel</p>
            <h1 className="text-3xl font-display font-black text-luxury-black tracking-tight">Visit Enquiries</h1>
            <p className="text-sm text-luxury-black/40 mt-1.5">
              {loading ? "Loading…" : `${total.toLocaleString("en-IN")} total enquir${total === 1 ? "y" : "ies"} across all your listings`}
            </p>
          </div>
          <button
            onClick={() => fetchData({ silent: true })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[11px] font-bold text-luxury-black/50 hover:text-luxury-purple hover:border-luxury-purple/20 transition-all shadow-sm"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {(["pending", "confirmed", "completed", "cancelled"] as EnquiryStatus[]).map(s => {
            const m = STATUS_META[s];
            const count = allCounts[s] ?? 0;
            return (
              <motion.button
                key={s}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTabClick(s)}
                className={cn(
                  "bg-white rounded-2xl border p-4 text-left transition-all shadow-sm",
                  activeTab === s
                    ? "border-luxury-purple/30 shadow-md shadow-luxury-purple/8"
                    : "border-gray-100 hover:border-luxury-purple/15 hover:shadow-md"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2 rounded-xl border", m.bg, m.border)}>
                    <m.icon size={14} className={m.color} />
                  </div>
                  <span className="text-2xl font-black text-luxury-black">{count}</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-wider text-luxury-black/40">{m.label}</p>
                <div className={cn("h-0.5 rounded-full mt-2 transition-all", m.barColor, activeTab === s ? "opacity-100 w-full" : "opacity-20 w-1/2")} />
              </motion.button>
            );
          })}
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-luxury-black/30 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, email, property, phone…"
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-luxury-gray text-[12px] focus:outline-none focus:border-luxury-purple/40 focus:bg-white transition-all placeholder:text-luxury-black/25"
              />
              {search && (
                <button onClick={() => { setSearch(""); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-black/25 hover:text-luxury-black transition-colors">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Advanced filters toggle */}
            <button
              onClick={() => setFilterOpen(o => !o)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[12px] font-bold transition-all",
                filterOpen || (visitFilter !== "all" || dateFilter)
                  ? "bg-luxury-purple text-white border-luxury-purple shadow-md"
                  : "bg-luxury-gray border-gray-200 text-luxury-black/50 hover:border-luxury-purple/20"
              )}
            >
              <SlidersHorizontal size={13} />
              Filters
              {(visitFilter !== "all" || dateFilter) && (
                <span className="w-4 h-4 rounded-full bg-white/30 text-[9px] flex items-center justify-center font-black">
                  {[visitFilter !== "all", !!dateFilter].filter(Boolean).length}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button onClick={handleReset}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 text-[11px] font-bold text-luxury-black/40 hover:text-red-500 hover:border-red-200 transition-all">
                <RefreshCw size={11} /> Reset
              </button>
            )}
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-gray-100">
                  {/* Visit type */}
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-luxury-black/30 mb-2">Visit Type</p>
                    <div className="relative">
                      <Filter size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-black/30 pointer-events-none" />
                      <select
                        value={visitFilter}
                        onChange={e => { setVisitFilter(e.target.value as typeof visitFilter); setPage(1); }}
                        className="w-full appearance-none pl-8 pr-8 py-2.5 rounded-xl border border-gray-200 bg-luxury-gray text-[12px] font-bold text-luxury-black/60 focus:outline-none focus:border-luxury-purple/40 cursor-pointer"
                      >
                        <option value="all">All Types</option>
                        <option value="physical">Physical Visit</option>
                        <option value="video">Video Tour</option>
                      </select>
                      <ChevronDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-black/30 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex-1 min-w-[160px]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-luxury-black/30 mb-2">Visit Date</p>
                    <div className="relative">
                      <Calendar size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-black/30 pointer-events-none" />
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={e => { setDateFilter(e.target.value); setPage(1); }}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 bg-luxury-gray text-[12px] text-luxury-black/60 focus:outline-none focus:border-luxury-purple/40 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Status Tabs ── */}
        <div className="flex items-center gap-1.5 mb-5 overflow-x-auto hide-scrollbar pb-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all shrink-0",
                activeTab === tab.key
                  ? "bg-luxury-purple text-white shadow-md shadow-luxury-purple/25"
                  : "bg-white border border-gray-200 text-luxury-black/40 hover:border-luxury-purple/20 hover:text-luxury-purple"
              )}
            >
              {tab.label}
              <span className={cn(
                "inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black",
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-luxury-gray text-luxury-black/40"
              )}>
                {allCounts[tab.key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* ── Results meta ── */}
        {!loading && !error && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-luxury-black/35">
              Showing {enquiries.length} of {total} enquir{total === 1 ? "y" : "ies"}
              {hasActiveFilters && " (filtered)"}
            </p>
            {pages > 1 && (
              <p className="text-[11px] font-bold text-luxury-black/35">
                Page {page} of {pages}
              </p>
            )}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Loader2 className="w-8 h-8 text-luxury-purple" />
            </motion.div>
            <p className="text-sm text-luxury-black/40 font-medium">Loading enquiries…</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-red-600">{error}</p>
            <button onClick={() => fetchData()}
              className="mt-4 px-5 py-2 rounded-xl bg-red-100 text-red-600 text-[12px] font-bold hover:bg-red-200 transition-colors">
              Try Again
            </button>
          </div>
        ) : enquiries.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-luxury-purple/8 flex items-center justify-center mx-auto mb-4">
              <Building2 size={28} className="text-luxury-purple/30" />
            </div>
            <p className="text-lg font-black text-luxury-black mb-2">No enquiries found</p>
            <p className="text-sm text-luxury-black/40 max-w-xs mx-auto">
              {hasActiveFilters
                ? "No results match your current filters. Try adjusting them."
                : "When visitors request property visits, they'll appear here."}
            </p>
            {hasActiveFilters && (
              <button onClick={handleReset}
                className="mt-5 px-5 py-2.5 rounded-xl bg-luxury-purple text-white text-[12px] font-bold hover:opacity-90 transition-opacity">
                Clear All Filters
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <motion.div layout className="space-y-3">
                {enquiries.map(enquiry => (
                  <EnquiryCard
                    key={enquiry._id}
                    enquiry={enquiry}
                    token={token!}
                    onStatusUpdate={handleStatusUpdate}
                    onView={setDrawerItem}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* ── Pagination ── */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-luxury-black/40 hover:border-luxury-purple/30 hover:text-luxury-purple disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                  const p = pages <= 7 ? i + 1 : (() => {
                    if (i === 0) return 1;
                    if (i === 6) return pages;
                    if (page <= 4) return i + 1;
                    if (page >= pages - 3) return pages - 6 + i;
                    return page - 3 + i;
                  })();
                  const isActive = p === page;
                  const isEllipsis = pages > 7 && ((i === 1 && page > 4) || (i === 5 && page < pages - 3));
                  if (isEllipsis) return (
                    <span key={`e${i}`} className="w-10 h-10 flex items-center justify-center text-luxury-black/25 text-sm font-bold">…</span>
                  );
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-10 h-10 rounded-xl border text-[12px] font-black transition-all",
                        isActive
                          ? "bg-luxury-purple border-luxury-purple text-white shadow-md shadow-luxury-purple/25"
                          : "bg-white border-gray-200 text-luxury-black/50 hover:border-luxury-purple/30 hover:text-luxury-purple"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-luxury-black/40 hover:border-luxury-purple/30 hover:text-luxury-purple disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Drawer ── */}
      <EnquiryDrawer
        enquiry={drawerItem}
        token={token!}
        onClose={() => setDrawerItem(null)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};
