import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft, ImagePlus, X, Star, Loader2, ChevronRight, Check,
} from "lucide-react";
import { type PropertyType, type ListingType, type PropertyStatus } from "../../store/usePropertyStore";
import { useAuthStore } from "../../store/useAuthStore";
import { uploadApi, propertiesApi } from "../../services/api";
import { ROUTES } from "../../constants/routes";
import {
  AmenitiesFormSection, amenitiesFromApi, amenitiesToApi,
  type AmenitiesFormData,
} from "../../components/properties/AmenitiesFormSection";

type ImageItem =
  | { kind: "url"; url: string; name: string }
  | { kind: "file"; file: File; preview: string; name: string };

const lbl = "block text-xs font-black text-[#111111]/50 uppercase tracking-wide mb-1.5";
const sh  = "text-sm font-black text-[#111111] uppercase tracking-widest mb-4";

/* ── Step bar ──────────────────────────────────────────────── */
function StepBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center mb-8">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black transition-colors ${
          step >= 1 ? "bg-[#5b21b6] text-white" : "bg-gray-100 text-[#111111]/30"
        }`}>
          {step > 1 ? <Check className="w-4 h-4" /> : "1"}
        </div>
        <div>
          <p className={`text-[11px] font-black uppercase tracking-wide leading-none ${step === 1 ? "text-[#5b21b6]" : "text-[#111111]/40"}`}>
            Step 1
          </p>
          <p className="text-[11px] font-medium text-[#111111]/40 leading-tight">Property Details</p>
        </div>
      </div>

      <div className="flex-1 mx-4 h-px bg-gray-200 relative">
        <div className={`absolute inset-y-0 left-0 bg-[#5b21b6] transition-all duration-500 ${step > 1 ? "w-full" : "w-0"}`} />
      </div>

      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black transition-colors ${
          step >= 2 ? "bg-[#5b21b6] text-white" : "bg-gray-100 text-[#111111]/30"
        }`}>
          2
        </div>
        <div>
          <p className={`text-[11px] font-black uppercase tracking-wide leading-none ${step === 2 ? "text-[#5b21b6]" : "text-[#111111]/40"}`}>
            Step 2
          </p>
          <p className="text-[11px] font-medium text-[#111111]/40 leading-tight">Amenities</p>
        </div>
      </div>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */
export function EditPropertyPage() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const { token }  = useAuthStore();

  const [step, setStep] = useState<1 | 2>(1);

  /* fetch state */
  const [fetching, setFetching]     = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /* details form */
  const [form, setForm] = useState({
    title: "", type: "apartment" as PropertyType, listingType: "sale" as ListingType,
    price: "", area: "", bedrooms: "2", bathrooms: "2",
    location: "", city: "", description: "", status: "active" as PropertyStatus,
  });
  const [images, setImages]           = useState<ImageItem[]>([]);
  const [coverIndex, setCoverIndex]   = useState(0);
  const [uploading, setUploading]     = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* amenities */
  const [amenitiesInit, setAmenitiesInit]     = useState<Partial<AmenitiesFormData> | undefined>(undefined);
  const [savingAmenities, setSavingAmenities] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const setField = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  /* ── Fetch property + amenities on mount ── */
  useEffect(() => {
    if (!id || !token) return;
    setFetching(true);
    setFetchError(null);

    Promise.all([
      propertiesApi.get(token, id),
      propertiesApi.getAmenities(token, id).catch(() => null),
    ])
      .then(([{ data: p }, aRes]) => {
        setForm({
          title: p.title,
          type: p.type as PropertyType,
          listingType: p.listingType as ListingType,
          price: String(p.price),
          area: String(p.area),
          bedrooms: String(p.bedrooms),
          bathrooms: String(p.bathrooms),
          location: p.location,
          city: p.city,
          description: p.description,
          status: p.status as PropertyStatus,
        });
        setImages(
          p.images.map(url => ({ kind: "url" as const, url, name: url.split("/").pop() ?? "image" }))
        );
        setCoverIndex(0);
        /* prefill amenities — always set (even to empty defaults) so Step 2 never shows blanks */
        setAmenitiesInit(aRes?.data ? amenitiesFromApi(aRes.data) : {});
      })
      .catch(err => setFetchError(err instanceof Error ? err.message : "Failed to load property"))
      .finally(() => setFetching(false));
  }, [id, token]);

  /* ── Image helpers ── */
  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    setImages(prev => [
      ...prev,
      ...Array.from(files)
        .filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"))
        .slice(0, 10 - prev.length)
        .map(f => ({ kind: "file" as const, file: f, preview: URL.createObjectURL(f), name: f.name })),
    ]);
  };

  const removeImage = (idx: number) => {
    const item = images[idx];
    if (item.kind === "file") URL.revokeObjectURL(item.preview);
    setImages(prev => prev.filter((_, i) => i !== idx));
    if (coverIndex >= idx && coverIndex > 0) setCoverIndex(c => c - 1);
  };

  /* ── Step 1: update property → advance to Step 2 ── */
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!token || !id) { setSubmitError("Not authenticated."); return; }
    setUploading(true);
    try {
      /* upload any new files */
      const fileItems = images.filter((i): i is Extract<ImageItem, { kind: "file" }> => i.kind === "file");
      let cloudUrls: string[] = [];
      if (fileItems.length > 0) {
        const r = await uploadApi.uploadFiles(token, fileItems.map(i => i.file));
        cloudUrls = r.data.map(d => d.url);
      }
      let ui = 0;
      const allUrls  = images.map(i => i.kind === "url" ? i.url : cloudUrls[ui++]);
      const ordered  = [...allUrls.slice(coverIndex), ...allUrls.slice(0, coverIndex)];

      await propertiesApi.update(token, id, {
        title: form.title, type: form.type, listingType: form.listingType,
        price: Number(form.price), area: Number(form.area),
        bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms),
        location: form.location, city: form.city,
        description: form.description, status: form.status,
        images: ordered,
      });

      /* convert uploaded files back to url items so state stays consistent */
      fileItems.forEach(i => URL.revokeObjectURL(i.preview));
      setImages(ordered.map(url => ({ kind: "url" as const, url, name: url.split("/").pop() ?? "image" })));

      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save property");
    } finally {
      setUploading(false);
    }
  };

  /* ── Step 2: update amenities → navigate away ── */
  const handleSaveAmenities = async (data: AmenitiesFormData) => {
    if (!token || !id) return;
    setSavingAmenities(true);
    try {
      await propertiesApi.updateAmenities(token, id, amenitiesToApi(data));
      setAmenitiesInit(data);
      navigate(ROUTES.PROPERTIES);
    } finally {
      setSavingAmenities(false);
    }
  };

  /* ── Loading ── */
  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-8 h-8 text-[#5b21b6] animate-spin" />
        <p className="text-sm font-medium text-[#111111]/40">Loading property…</p>
      </div>
    );
  }

  /* ── Fetch error ── */
  if (fetchError) {
    return (
      <div className="text-center py-20 text-[#111111]/40">
        <p className="text-sm font-semibold text-red-500 mb-4">{fetchError}</p>
        <Link to={ROUTES.PROPERTIES} className="text-[#5b21b6] font-bold hover:underline">
          ← Back to properties
        </Link>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="max-w-2xl mx-auto pb-28">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {step === 1 ? (
          <Link to={ROUTES.PROPERTIES}
            className="p-2 rounded-xl text-[#111111]/30 hover:text-[#5b21b6] hover:bg-[#5b21b6]/8 border border-[rgba(91,33,182,0.06)] hover:border-[rgba(91,33,182,0.15)] transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => { setSubmitError(null); setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="p-2 rounded-xl text-[#111111]/30 hover:text-[#5b21b6] hover:bg-[#5b21b6]/8 border border-[rgba(91,33,182,0.06)] hover:border-[rgba(91,33,182,0.15)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1
            className="text-2xl font-black text-[#111111] tracking-tight"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Edit Property
          </h1>
          <p className="text-sm font-medium text-[#111111]/40 mt-0.5 truncate max-w-xs">
            {step === 1 ? `Editing "${form.title}"` : `Amenities for "${form.title}"`}
          </p>
        </div>
      </div>

      <StepBar step={step} />

      {/* ══ STEP 1 — Property Details ══ */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-5">

          {/* Basic Info */}
          <div className="dp-card p-6 space-y-4">
            <h2 className={sh} style={{ fontFamily: "Outfit, sans-serif" }}>Basic Information</h2>
            <div>
              <label className={lbl}>Property Title</label>
              <input
                required
                value={form.title}
                onChange={e => setField("title", e.target.value)}
                className="dp-input"
                style={{ borderRadius: "0.875rem" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Type</label>
                <select
                  value={form.type}
                  onChange={e => setField("type", e.target.value)}
                  className="dp-input dp-select"
                  style={{ borderRadius: "0.875rem" }}
                >
                  {["apartment","villa","plot","commercial","penthouse"].map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Listing</label>
                <select
                  value={form.listingType}
                  onChange={e => setField("listingType", e.target.value)}
                  className="dp-input dp-select"
                  style={{ borderRadius: "0.875rem" }}
                >
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>
                  Price (₹){form.listingType === "rent" && (
                    <span className="normal-case font-medium text-[#111111]/30"> /mo</span>
                  )}
                </label>
                <input
                  type="number" required min="1"
                  value={form.price}
                  onChange={e => setField("price", e.target.value)}
                  className="dp-input"
                  style={{ borderRadius: "0.875rem" }}
                />
              </div>
              <div>
                <label className={lbl}>Area (sq.ft)</label>
                <input
                  type="number" required min="1"
                  value={form.area}
                  onChange={e => setField("area", e.target.value)}
                  className="dp-input"
                  style={{ borderRadius: "0.875rem" }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={lbl}>Bedrooms</label>
                <select
                  value={form.bedrooms}
                  onChange={e => setField("bedrooms", e.target.value)}
                  className="dp-input dp-select"
                  style={{ borderRadius: "0.875rem" }}
                >
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Bathrooms</label>
                <select
                  value={form.bathrooms}
                  onChange={e => setField("bathrooms", e.target.value)}
                  className="dp-input dp-select"
                  style={{ borderRadius: "0.875rem" }}
                >
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Status</label>
                <select
                  value={form.status}
                  onChange={e => setField("status", e.target.value)}
                  className="dp-input dp-select"
                  style={{ borderRadius: "0.875rem" }}
                >
                  {["active","pending","sold","rented","draft"].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="dp-card p-6 space-y-4">
            <h2 className={sh} style={{ fontFamily: "Outfit, sans-serif" }}>Location</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Address</label>
                <input
                  required
                  value={form.location}
                  onChange={e => setField("location", e.target.value)}
                  className="dp-input"
                  style={{ borderRadius: "0.875rem" }}
                />
              </div>
              <div>
                <label className={lbl}>City</label>
                <input
                  required
                  value={form.city}
                  onChange={e => setField("city", e.target.value)}
                  className="dp-input"
                  style={{ borderRadius: "0.875rem" }}
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="dp-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className={sh} style={{ fontFamily: "Outfit, sans-serif" }}>Property Media</h2>
              <span className="text-xs font-bold text-[#111111]/30">{images.length}/10</span>
            </div>
            {images.length < 10 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={e => { e.preventDefault(); handleImageFiles(e.dataTransfer.files); }}
                onDragOver={e => e.preventDefault()}
                className="border-2 border-dashed border-[rgba(91,33,182,0.15)] hover:border-[#5b21b6] hover:bg-[#5b21b6]/[0.03] rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#5b21b6]/8 border border-[rgba(91,33,182,0.12)] flex items-center justify-center group-hover:bg-[#5b21b6]/15 transition-colors">
                  <ImagePlus className="w-5 h-5 text-[#5b21b6]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#111111]/50 group-hover:text-[#111111]/70 transition-colors">
                    Drop images / videos here or <span className="text-[#5b21b6]">browse</span>
                  </p>
                  <p className="text-xs text-[#111111]/30 mt-0.5">JPG, PNG, WEBP, MP4 — up to 10 files</p>
                </div>
                <input
                  ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden"
                  onChange={e => handleImageFiles(e.target.files)}
                />
              </div>
            )}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((item, idx) => {
                  const src     = item.kind === "file" ? item.preview : item.url;
                  const isVideo = item.kind === "file" && item.file.type.startsWith("video/");
                  return (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden aspect-square bg-[#f8f9fa] border border-[rgba(91,33,182,0.06)]"
                    >
                      {isVideo
                        ? <video src={src} className="w-full h-full object-cover" muted />
                        : <img src={src} alt={item.name} className="w-full h-full object-cover" />
                      }
                      {idx === coverIndex && (
                        <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-[#5b21b6] text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg">
                          <Star className="w-2.5 h-2.5 fill-current" />Cover
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {idx !== coverIndex && !isVideo && (
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setCoverIndex(idx); }}
                            className="p-1.5 bg-[#5b21b6] rounded-lg text-white"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); removeImage(idx); }}
                          className="p-1.5 bg-red-500 rounded-lg text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {images.length === 0 && (
              <p className="text-xs font-medium text-[#111111]/30 text-center py-2">No media added yet.</p>
            )}
          </div>

          {/* Description */}
          <div className="dp-card p-6">
            <label className={lbl}>Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => setField("description", e.target.value)}
              className="dp-input resize-none"
              style={{ borderRadius: "0.875rem" }}
            />
          </div>

          {submitError && (
            <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {submitError}
            </p>
          )}

          {/* Sticky footer */}
          <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-[rgba(91,33,182,0.08)] px-4 py-3 flex justify-end gap-3 lg:left-64">
            <Link
              to={ROUTES.PROPERTIES}
              className="px-5 h-11 flex items-center rounded-xl text-sm font-bold text-[#111111]/40 border border-[rgba(91,33,182,0.08)] hover:bg-[#f8f9fa] hover:text-[#111111] transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading}
              className="premium-btn flex items-center gap-2 px-6 h-11 text-xs tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" />SAVING…</>
                : <><span>SAVE & CONTINUE</span><ChevronRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </form>
      )}

      {/* ══ STEP 2 — Amenities & Features ══ */}
      {step === 2 && (
        <AmenitiesFormSection
          initialValues={amenitiesInit}
          onSave={handleSaveAmenities}
          saving={savingAmenities}
          onSkip={() => navigate(ROUTES.PROPERTIES)}
          successMessage="Amenities updated successfully!"
        />
      )}
    </div>
  );
}
