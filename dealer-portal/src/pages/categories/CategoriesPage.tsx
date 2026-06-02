import { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, Trash2, Tag, Layers, Home, Key, Crown, Building2,
  TreePalm, Briefcase, Map, Sparkles, Users, Search, X, Check,
  Loader2, AlertCircle, ToggleLeft, ToggleRight, ChevronDown,
  GripVertical, LayoutGrid, List as ListIcon,
} from "lucide-react";
import { categoriesApi, type ApiCategory } from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";

/* ── icon registry ── */
const ICON_OPTIONS = [
  { name: "key",        Icon: Key },
  { name: "home",       Icon: Home },
  { name: "layers",     Icon: Layers },
  { name: "crown",      Icon: Crown },
  { name: "building2",  Icon: Building2 },
  { name: "tree-palm",  Icon: TreePalm },
  { name: "briefcase",  Icon: Briefcase },
  { name: "map",        Icon: Map },
  { name: "sparkles",   Icon: Sparkles },
  { name: "users",      Icon: Users },
  { name: "tag",        Icon: Tag },
  { name: "layout-grid",Icon: LayoutGrid },
];

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const found = ICON_OPTIONS.find((o) => o.name === name);
  const Icon = found ? found.Icon : Tag;
  return <Icon className={className ?? "w-4 h-4"} />;
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/* ── Modal ── */
interface ModalProps {
  initial?: ApiCategory | null;
  onClose: () => void;
  onSaved: (cat: ApiCategory) => void;
}

function CategoryModal({ initial, onClose, onSaved }: ModalProps) {
  const { token } = useAuthStore();
  const isEdit = !!initial;

  const [name, setName]             = useState(initial?.name ?? "");
  const [slug, setSlug]             = useState(initial?.slug ?? "");
  const [slugManual, setSlugManual] = useState(isEdit);
  const [catType, setCatType]       = useState<"listing" | "property">(initial?.categoryType ?? "listing");
  const [icon, setIcon]             = useState(initial?.icon ?? "tag");
  const [order, setOrder]           = useState(initial?.order ?? 0);
  const [isActive, setIsActive]     = useState(initial?.isActive ?? true);
  const [iconOpen, setIconOpen]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");

  function handleNameChange(v: string) {
    setName(v);
    if (!slugManual) setSlug(slugify(v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) { setError("Name and slug are required."); return; }
    setSaving(true);
    setError("");
    try {
      let saved: ApiCategory;
      if (isEdit && initial) {
        const res = await categoriesApi.update(token!, initial._id, { name, slug, categoryType: catType, icon, order, isActive });
        saved = res.data;
      } else {
        const res = await categoriesApi.create(token!, { name, slug, categoryType: catType, icon, order, isActive });
        saved = res.data;
      }
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ boxShadow: "0 25px 60px -10px rgba(91,33,182,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(91,33,182,0.06)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#5b21b6] flex items-center justify-center">
              <Tag className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-base font-black text-[#111111]" style={{ fontFamily: "Outfit, sans-serif" }}>
              {isEdit ? "Edit Category" : "Add Category"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f8f9fa] transition-colors">
            <X className="w-4 h-4 text-[#111111]/40" />
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs font-semibold text-red-600">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-black text-[#111111]/50 uppercase tracking-wider mb-1.5">Name</label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. For Rent"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(91,33,182,0.15)] bg-white text-sm font-semibold text-[#111111] placeholder:text-[#111111]/25 focus:outline-none focus:border-[#5b21b6] focus:ring-2 focus:ring-[#5b21b6]/10 transition-all"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-black text-[#111111]/50 uppercase tracking-wider mb-1.5">
              Slug <span className="text-[#5b21b6]/50 normal-case font-semibold">(stored on properties)</span>
            </label>
            <input
              value={slug}
              onChange={(e) => { setSlugManual(true); setSlug(slugify(e.target.value)); }}
              placeholder="e.g. rent"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(91,33,182,0.15)] bg-[#f8f9fa] text-sm font-mono font-semibold text-[#5b21b6] placeholder:text-[#111111]/25 focus:outline-none focus:border-[#5b21b6] focus:ring-2 focus:ring-[#5b21b6]/10 transition-all"
            />
          </div>

          {/* Category Type */}
          <div>
            <label className="block text-xs font-black text-[#111111]/50 uppercase tracking-wider mb-1.5">Category Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(["listing", "property"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCatType(t)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    catType === t
                      ? "bg-[#5b21b6] border-[#5b21b6] text-white shadow-md"
                      : "border-[rgba(91,33,182,0.15)] text-[#111111]/50 hover:border-[#5b21b6]/30"
                  }`}
                  style={catType === t ? { boxShadow: "0 4px 14px -4px rgba(91,33,182,0.4)" } : {}}
                >
                  {t === "listing" ? <Key className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
                  {t.charAt(0).toUpperCase() + t.slice(1)} Type
                </button>
              ))}
            </div>
          </div>

          {/* Icon picker + Order side by side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Icon */}
            <div>
              <label className="block text-xs font-black text-[#111111]/50 uppercase tracking-wider mb-1.5">Icon</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIconOpen((o) => !o)}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[rgba(91,33,182,0.15)] bg-white text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#5b21b6] transition-all"
                >
                  <div className="w-5 h-5 rounded-md bg-[#5b21b6]/10 flex items-center justify-center">
                    <CategoryIcon name={icon} className="w-3 h-3 text-[#5b21b6]" />
                  </div>
                  <span className="flex-1 text-left text-xs">{icon}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#111111]/30" />
                </button>
                {iconOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[rgba(91,33,182,0.12)] rounded-xl shadow-xl z-10 p-2 grid grid-cols-4 gap-1">
                    {ICON_OPTIONS.map(({ name: iName, Icon }) => (
                      <button
                        key={iName}
                        type="button"
                        onClick={() => { setIcon(iName); setIconOpen(false); }}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                          icon === iName ? "bg-[#5b21b6] text-white" : "hover:bg-[#f8f9fa] text-[#111111]/50"
                        }`}
                        title={iName}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold truncate w-full text-center">{iName.split("-")[0]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order */}
            <div>
              <label className="block text-xs font-black text-[#111111]/50 uppercase tracking-wider mb-1.5">Order</label>
              <input
                type="number"
                value={order}
                min={0}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(91,33,182,0.15)] bg-white text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#5b21b6] focus:ring-2 focus:ring-[#5b21b6]/10 transition-all"
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8f9fa] border border-[rgba(91,33,182,0.06)]">
            <div>
              <p className="text-sm font-bold text-[#111111]">Active</p>
              <p className="text-xs text-[#111111]/40 font-medium">Visible on frontend</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className="transition-all"
            >
              {isActive
                ? <ToggleRight className="w-8 h-8 text-[#5b21b6]" />
                : <ToggleLeft className="w-8 h-8 text-[#111111]/20" />
              }
            </button>
          </div>

          {/* actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[rgba(91,33,182,0.15)] text-sm font-bold text-[#111111]/50 hover:bg-[#f8f9fa] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#5b21b6] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:bg-[#4c1d95]"
              style={{ boxShadow: "0 4px 14px -4px rgba(91,33,182,0.5)" }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isEdit ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Delete confirm ── */
function DeleteConfirm({ cat, onClose, onDeleted }: { cat: ApiCategory; onClose: () => void; onDeleted: (id: string) => void }) {
  const { token } = useAuthStore();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      await categoriesApi.delete(token!, cat._id);
      onDeleted(cat._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        style={{ boxShadow: "0 25px 60px -10px rgba(91,33,182,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-base font-black text-[#111111] text-center mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Delete Category</h3>
        <p className="text-sm text-[#111111]/50 text-center font-medium mb-5">
          Delete <span className="font-bold text-[#111111]">"{cat.name}"</span>? This cannot be undone.
        </p>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs font-semibold text-red-600">{error}</p>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[rgba(91,33,182,0.15)] text-sm font-bold text-[#111111]/50 hover:bg-[#f8f9fa] transition-all">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:bg-red-600"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Category card ── */
function CategoryCard({
  cat, onEdit, onDelete,
}: { cat: ApiCategory; onEdit: (c: ApiCategory) => void; onDelete: (c: ApiCategory) => void }) {
  return (
    <div className="dp-card p-4 flex items-center gap-4 group hover:-translate-y-0.5 transition-all duration-200">
      <GripVertical className="w-4 h-4 text-[#111111]/15 shrink-0" />

      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-[#5b21b6]/8 border border-[rgba(91,33,182,0.12)] flex items-center justify-center shrink-0">
        <CategoryIcon name={cat.icon} className="w-4 h-4 text-[#5b21b6]" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-black text-[#111111] truncate" style={{ fontFamily: "Outfit, sans-serif" }}>{cat.name}</p>
          {!cat.isActive && (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#111111]/5 text-[#111111]/30 border border-[#111111]/8 shrink-0">
              Inactive
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <code className="text-[10px] font-mono font-bold text-[#5b21b6]/70 bg-[#5b21b6]/5 px-1.5 py-0.5 rounded-md border border-[rgba(91,33,182,0.1)]">
            {cat.slug}
          </code>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
            cat.categoryType === "listing"
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-violet-50 border-violet-200 text-violet-700"
          }`}>
            {cat.categoryType}
          </span>
          <span className="text-[10px] text-[#111111]/30 font-semibold">order: {cat.order}</span>
        </div>
      </div>

      {/* Active dot */}
      <div className={`w-2 h-2 rounded-full shrink-0 ${cat.isActive ? "bg-emerald-400" : "bg-[#111111]/15"}`} />

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(cat)}
          className="p-2 rounded-lg hover:bg-[#5b21b6]/8 text-[#111111]/30 hover:text-[#5b21b6] transition-all"
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(cat)}
          className="p-2 rounded-lg hover:bg-red-50 text-[#111111]/30 hover:text-red-500 transition-all"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Main page ── */
export function CategoriesPage() {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [tab, setTab]               = useState<"all" | "listing" | "property">("all");
  const [addOpen, setAddOpen]       = useState(false);
  const [editing, setEditing]       = useState<ApiCategory | null>(null);
  const [deleting, setDeleting]     = useState<ApiCategory | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await categoriesApi.list();
      setCategories(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  function onSaved(cat: ApiCategory) {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c._id === cat._id);
      if (idx >= 0) { const next = [...prev]; next[idx] = cat; return next; }
      return [...prev, cat];
    });
    setAddOpen(false);
    setEditing(null);
  }

  function onDeleted(id: string) {
    setCategories((prev) => prev.filter((c) => c._id !== id));
    setDeleting(null);
  }

  const filtered = categories
    .filter((c) => tab === "all" || c.categoryType === tab)
    .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  const listingCount  = categories.filter((c) => c.categoryType === "listing").length;
  const propertyCount = categories.filter((c) => c.categoryType === "property").length;
  const activeCount   = categories.filter((c) => c.isActive).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Categories</h1>
          <p className="text-sm font-medium text-[#111111]/40 mt-0.5">Manage listing types and property types shown on the frontend</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5b21b6] text-white text-sm font-bold hover:bg-[#4c1d95] transition-all"
          style={{ boxShadow: "0 4px 14px -4px rgba(91,33,182,0.5)" }}
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: categories.length, color: "bg-[#5b21b6]/8 border-[rgba(91,33,182,0.12)] text-[#5b21b6]" },
          { label: "Listing Types", value: listingCount, color: "bg-amber-50 border-amber-200 text-amber-700" },
          { label: "Property Types", value: propertyCount, color: "bg-violet-50 border-violet-200 text-violet-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`dp-card p-4 border ${color}`}>
            <p className="text-2xl font-black" style={{ fontFamily: "Outfit, sans-serif" }}>{value}</p>
            <p className="text-xs font-bold mt-0.5 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#111111]/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[rgba(91,33,182,0.12)] bg-white text-sm font-semibold text-[#111111] placeholder:text-[#111111]/25 focus:outline-none focus:border-[#5b21b6] focus:ring-2 focus:ring-[#5b21b6]/10 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-[#111111]/30" />
            </button>
          )}
        </div>

        {/* Tab pills */}
        <div className="flex items-center bg-[#f8f9fa] border border-[rgba(91,33,182,0.08)] rounded-xl p-1 gap-0.5">
          {([["all", "All"], ["listing", "Listing"], ["property", "Property"]] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === v
                  ? "bg-white text-[#5b21b6] shadow-sm border border-[rgba(91,33,182,0.1)]"
                  : "text-[#111111]/40 hover:text-[#111111]/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-[#5b21b6] animate-spin mb-3" />
          <p className="text-sm font-semibold text-[#111111]/40">Loading categories…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-sm font-bold text-[#111111]/60 mb-1">Failed to load</p>
          <p className="text-xs text-[#111111]/30 mb-4">{error}</p>
          <button onClick={load} className="px-4 py-2 rounded-xl bg-[#5b21b6] text-white text-xs font-bold hover:bg-[#4c1d95] transition-all">
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 rounded-2xl bg-[#5b21b6]/8 border border-[rgba(91,33,182,0.12)] flex items-center justify-center mb-3">
            <Tag className="w-5 h-5 text-[#5b21b6]/50" />
          </div>
          <p className="text-sm font-bold text-[#111111]/50">
            {search ? "No categories match your search" : "No categories yet"}
          </p>
          {!search && (
            <button onClick={() => setAddOpen(true)} className="mt-4 px-4 py-2 rounded-xl bg-[#5b21b6] text-white text-xs font-bold hover:bg-[#4c1d95] transition-all">
              Add your first category
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Section: Listing Types */}
          {(tab === "all" || tab === "listing") && (
            <div className="mb-6">
              {tab === "all" && (
                <div className="flex items-center gap-2 mb-3">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <h2 className="text-xs font-black text-[#111111]/40 uppercase tracking-widest">Listing Types</h2>
                  <div className="flex-1 h-px bg-[#111111]/6" />
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    {filtered.filter((c) => c.categoryType === "listing").length}
                  </span>
                </div>
              )}
              <div className="space-y-2">
                {filtered
                  .filter((c) => c.categoryType === "listing")
                  .map((cat) => (
                    <CategoryCard key={cat._id} cat={cat} onEdit={setEditing} onDelete={setDeleting} />
                  ))}
              </div>
            </div>
          )}

          {/* Section: Property Types */}
          {(tab === "all" || tab === "property") && (
            <div>
              {tab === "all" && (
                <div className="flex items-center gap-2 mb-3">
                  <Home className="w-3.5 h-3.5 text-violet-600" />
                  <h2 className="text-xs font-black text-[#111111]/40 uppercase tracking-widest">Property Types</h2>
                  <div className="flex-1 h-px bg-[#111111]/6" />
                  <span className="text-xs font-bold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                    {filtered.filter((c) => c.categoryType === "property").length}
                  </span>
                </div>
              )}
              <div className="space-y-2">
                {filtered
                  .filter((c) => c.categoryType === "property")
                  .map((cat) => (
                    <CategoryCard key={cat._id} cat={cat} onEdit={setEditing} onDelete={setDeleting} />
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {addOpen    && <CategoryModal onClose={() => setAddOpen(false)} onSaved={onSaved} />}
      {editing    && <CategoryModal initial={editing} onClose={() => setEditing(null)} onSaved={onSaved} />}
      {deleting   && <DeleteConfirm cat={deleting} onClose={() => setDeleting(null)} onDeleted={onDeleted} />}
    </div>
  );
}
