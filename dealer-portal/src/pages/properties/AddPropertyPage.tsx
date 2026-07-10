import { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ImagePlus, X, Star, Loader2, ChevronRight, Check } from "lucide-react";
import {
  usePropertyStore, type PropertyType, type ListingType, type PropertyStatus,
} from "../../store/usePropertyStore";
import { useAuthStore } from "../../store/useAuthStore";
import { uploadApi, propertiesApi, categoriesApi, type ApiCategory } from "../../services/api";
import { ROUTES } from "../../constants/routes";
import {
  AmenitiesFormSection, amenitiesToApi, type AmenitiesFormData,
} from "../../components/properties/AmenitiesFormSection";
import { AddressAutocomplete } from "../../components/properties/AddressAutocomplete";
import { AiDescriptionField } from "../../components/properties/AiDescriptionField";
import { PropertyTitleField } from "../../components/properties/PropertyTitleField";
import { buildGenerateDescriptionInput } from "../../lib/generateDescription";

type ImageItem =
  | { kind: "url"; url: string; name: string }
  | { kind: "file"; file: File; preview: string; name: string };

const lbl = "block text-xs font-black text-[#0c2417]/50 uppercase tracking-wide mb-1.5";
const sh  = "text-sm font-black text-[#0c2417] uppercase tracking-widest mb-4";

/* ── Step bar ──────────────────────────────────────────────── */
function StepBar({ step, step2Label = "Amenities" }: { step: 1 | 2; step2Label?: string }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black transition-colors ${step >= 1 ? "bg-[#166534] text-white" : "bg-gray-100 text-[#0c2417]/30"}`}>
          {step > 1 ? <Check className="w-4 h-4" /> : "1"}
        </div>
        <div>
          <p className={`text-[11px] font-black uppercase tracking-wide leading-none ${step === 1 ? "text-[#166534]" : "text-[#0c2417]/40"}`}>Step 1</p>
          <p className="text-[11px] font-medium text-[#0c2417]/40 leading-tight">Property Details</p>
        </div>
      </div>
      <div className="flex-1 mx-4 h-px bg-gray-200 relative">
        <div className={`absolute inset-y-0 left-0 bg-[#166534] transition-all duration-500 ${step > 1 ? "w-full" : "w-0"}`} />
      </div>
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black transition-colors ${step >= 2 ? "bg-[#166534] text-white" : "bg-gray-100 text-[#0c2417]/30"}`}>
          2
        </div>
        <div>
          <p className={`text-[11px] font-black uppercase tracking-wide leading-none ${step === 2 ? "text-[#166534]" : "text-[#0c2417]/40"}`}>Step 2</p>
          <p className="text-[11px] font-medium text-[#0c2417]/40 leading-tight">{step2Label}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────── */
export function AddPropertyPage() {
  const navigate = useNavigate();
  const { addProperty } = usePropertyStore();
  const { token } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);

  const [listingCategories, setListingCategories] = useState<ApiCategory[]>([]);
  const [propertyCategories, setPropertyCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoriesApi.list({ type: "listing" }),
      categoriesApi.list({ type: "property" }),
    ]).then(([listingRes, propertyRes]) => {
      const listing = listingRes.data.filter(c => c.isActive);
      const property = propertyRes.data.filter(c => c.isActive);
      setListingCategories(listing);
      setPropertyCategories(property);
      setForm(prev => ({
        ...prev,
        listingType: (listing[0]?.slug ?? prev.listingType) as ListingType,
        type: (property[0]?.slug ?? prev.type) as PropertyType,
      }));
    }).catch(() => {}).finally(() => setCategoriesLoading(false));
  }, []);

  const [form, setForm] = useState({
    title: "", type: "apartment" as PropertyType, listingType: "sale" as ListingType,
    price: "", area: "", bedrooms: "2", bathrooms: "2",
    description: "", status: "active" as PropertyStatus,
  });

  const [address, setAddress] = useState({
    country: "India", state: "", city: "", locality: "",
    street: "", landmark: "", postalCode: "",
    lat: 0, lng: 0,
  });
  const setAddr = (k: keyof typeof address, v: string | number) =>
    setAddress(p => ({ ...p, [k]: v }));
  const [saleDetails, setSaleDetails] = useState({
    pricePerSqft: "", bookingAmount: "", ownershipType: "freehold",
    propertyAge: "", possessionStatus: "ready-to-move", possessionDate: "",
    reraNumber: "", registryStatus: "clear", loanAvailable: "yes",
    negotiable: "yes", maintenanceCharges: "", floorNumber: "", totalFloors: "",
    facing: "east", vastuCompliant: "yes", carpetArea: "", builtUpArea: "",
    superBuiltUpArea: "", legalApprovals: "approved",
  });
  const [images, setImages] = useState<ImageItem[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [savingAmenities, setSavingAmenities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const setSale = (k: string, v: string) => setSaleDetails(p => ({ ...p, [k]: v }));

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

  /* Step 1: upload images → create property → advance */
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) { setError("Not authenticated."); return; }
    setUploading(true);
    try {
      const fileItems = images.filter((i): i is Extract<ImageItem, { kind: "file" }> => i.kind === "file");
      let cloudUrls: string[] = [];
      if (fileItems.length > 0) {
        const r = await uploadApi.uploadFiles(token, fileItems.map(i => i.file));
        cloudUrls = r.data.map(d => d.url);
      }
      let ui = 0;
      const allUrls = images.map(i => i.kind === "url" ? i.url : cloudUrls[ui++]);
      const ordered = [...allUrls.slice(coverIndex), ...allUrls.slice(0, coverIndex)];

      const res = await propertiesApi.create(token, {
        title: form.title, type: form.type, listingType: form.listingType,
        price: Number(form.price), area: Number(form.area),
        bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms),
        address,
        description: form.description, status: form.status, images: ordered,
        ...(form.listingType === "sale" && { saleDetails: {
          pricePerSqft: saleDetails.pricePerSqft ? Number(saleDetails.pricePerSqft) : undefined,
          bookingAmount: saleDetails.bookingAmount ? Number(saleDetails.bookingAmount) : undefined,
          ownershipType: saleDetails.ownershipType || undefined,
          propertyAge: saleDetails.propertyAge ? Number(saleDetails.propertyAge) : undefined,
          possessionStatus: saleDetails.possessionStatus || undefined,
          possessionDate: saleDetails.possessionDate || undefined,
          reraNumber: saleDetails.reraNumber || undefined,
          registryStatus: saleDetails.registryStatus || undefined,
          loanAvailable: saleDetails.loanAvailable === "yes",
          negotiable: saleDetails.negotiable === "yes",
          maintenanceCharges: saleDetails.maintenanceCharges ? Number(saleDetails.maintenanceCharges) : undefined,
          floorNumber: saleDetails.floorNumber || undefined,
          totalFloors: saleDetails.totalFloors ? Number(saleDetails.totalFloors) : undefined,
          facing: saleDetails.facing || undefined,
          vastuCompliant: saleDetails.vastuCompliant === "yes",
          carpetArea: saleDetails.carpetArea ? Number(saleDetails.carpetArea) : undefined,
          builtUpArea: saleDetails.builtUpArea ? Number(saleDetails.builtUpArea) : undefined,
          superBuiltUpArea: saleDetails.superBuiltUpArea ? Number(saleDetails.superBuiltUpArea) : undefined,
          legalApprovals: saleDetails.legalApprovals || undefined,
        } as import("../../services/api").ApiSaleDetails}),
      });
      const p = res.data;
      addProperty({
        title: p.title, type: p.type as PropertyType, listingType: p.listingType as ListingType,
        price: p.price, area: p.area, bedrooms: p.bedrooms, bathrooms: p.bathrooms,
        location: p.location, city: p.city, description: p.description,
        status: p.status as PropertyStatus, images: p.images, ownerId: p.ownerId,
      });
      fileItems.forEach(i => URL.revokeObjectURL(i.preview));
      setCreatedPropertyId(p._id);
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save property");
    } finally {
      setUploading(false);
    }
  };

  /* Step 2: save amenities → navigate */
  const handleSaveAmenities = async (data: AmenitiesFormData) => {
    if (!createdPropertyId || !token) return;
    setSavingAmenities(true);
    try {
      await propertiesApi.updateAmenities(token, createdPropertyId, amenitiesToApi(data, form.listingType));
      navigate(ROUTES.PROPERTIES);
    } finally {
      setSavingAmenities(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {step === 1 ? (
          <Link to={ROUTES.PROPERTIES}
            className="p-2 rounded-xl text-[#0c2417]/30 hover:text-[#166534] hover:bg-[#166534]/8 border border-[rgba(22,101,52,0.06)] hover:border-[rgba(22,101,52,0.15)] transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        ) : (
          <button type="button"
            onClick={() => { setStep(1); setError(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="p-2 rounded-xl text-[#0c2417]/30 hover:text-[#166534] hover:bg-[#166534]/8 border border-[rgba(22,101,52,0.06)] hover:border-[rgba(22,101,52,0.15)] transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-black text-[#0c2417] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            Add New Property
          </h1>
          <p className="text-sm font-medium text-[#0c2417]/40 mt-0.5">
            {step === 1
              ? "Fill in property details to continue"
              : form.listingType === "sale"
                ? `Features & Amenities for "${form.title}"`
                : `Amenities for "${form.title}"`}
          </p>
        </div>
      </div>

      <StepBar step={step} step2Label={form.listingType === "sale" ? "Features" : "Amenities"} />

      {/* ══ STEP 1 ══ */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-5">
          {/* Basic Info */}
          <div className="dp-card p-6 space-y-4">
            <h2 className={sh} style={{ fontFamily: "Outfit, sans-serif" }}>Basic Information</h2>
            <div>
              <label className={lbl}>Listing Type</label>
              <select
                value={form.listingType}
                onChange={e => set("listingType", e.target.value)}
                disabled={categoriesLoading || listingCategories.length === 0}
                className={`dp-input dp-select disabled:opacity-60 ${!categoriesLoading && listingCategories.length === 0 ? "border-amber-300 bg-amber-50/50" : ""}`}
                style={{ borderRadius: "0.875rem" }}
              >
                {categoriesLoading
                  ? <option value="">Loading…</option>
                  : listingCategories.length === 0
                    ? <option value="">— No listing types configured —</option>
                    : listingCategories.map(c => (
                        <option key={c._id} value={c.slug}>{c.name}</option>
                      ))
                }
              </select>
              {!categoriesLoading && listingCategories.length === 0 && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <span className="shrink-0 mt-px">⚠</span>
                  No Listing Types have been configured yet. An admin must add listing categories in the system before a property can be created.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Bedrooms</label>
                <select value={form.bedrooms} onChange={e => set("bedrooms", e.target.value)} className="dp-input dp-select" style={{ borderRadius: "0.875rem" }}>
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Washrooms</label>
                <select value={form.bathrooms} onChange={e => set("bathrooms", e.target.value)} className="dp-input dp-select" style={{ borderRadius: "0.875rem" }}>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={lbl}>Property Type</label>
              <select
                value={form.type}
                onChange={e => set("type", e.target.value)}
                disabled={categoriesLoading || propertyCategories.length === 0}
                className={`dp-input dp-select disabled:opacity-60 ${!categoriesLoading && propertyCategories.length === 0 ? "border-amber-300 bg-amber-50/50" : ""}`}
                style={{ borderRadius: "0.875rem" }}
              >
                {categoriesLoading
                  ? <option value="">Loading…</option>
                  : propertyCategories.length === 0
                    ? <option value="">— No property types configured —</option>
                    : propertyCategories.map(c => (
                        <option key={c._id} value={c.slug}>{c.name}</option>
                      ))
                }
              </select>
              {!categoriesLoading && propertyCategories.length === 0 && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <span className="shrink-0 mt-px">⚠</span>
                  No Property Types have been configured yet. An admin must add property categories in the system before a property can be created.
                </p>
              )}
            </div>
            <PropertyTitleField
              value={form.title}
              onChange={v => set("title", v)}
              listingType={form.listingType}
              listingCategoryName={listingCategories.find(c => c.slug === form.listingType)?.name}
              bedrooms={form.bedrooms}
              propertyTypeSlug={form.type}
              propertyTypeName={propertyCategories.find(c => c.slug === form.type)?.name}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Price (₹){form.listingType === "rent" && <span className="normal-case font-medium text-[#0c2417]/30"> /mo</span>}</label>
                <input type="number" required min="1" value={form.price} onChange={e => set("price", e.target.value)} placeholder="8750000" className="dp-input" style={{ borderRadius: "0.875rem" }} />
              </div>
              <div>
                <label className={lbl}>Area (sq.ft)</label>
                <input type="number" required min="1" value={form.area} onChange={e => set("area", e.target.value)} placeholder="2400" className="dp-input" style={{ borderRadius: "0.875rem" }} />
              </div>
            </div>
            <div>
              <label className={lbl}>Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className="dp-input dp-select" style={{ borderRadius: "0.875rem" }}>
                {["active","pending","draft"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Sale-only sections */}
          {form.listingType === "sale" && (
            <>
              {/* Pricing & Financials */}
              <div className="dp-card p-6 space-y-4">
                <h2 className={sh} style={{ fontFamily: "Outfit, sans-serif" }}>Pricing & Financials</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Price per sq.ft (₹)</label>
                    <input type="number" min="0" value={saleDetails.pricePerSqft}
                      onChange={e => setSale("pricePerSqft", e.target.value)}
                      placeholder="e.g. 8500" className="dp-input" style={{ borderRadius: "0.875rem" }} />
                  </div>
                  <div>
                    <label className={lbl}>Booking / Token Amount (₹)</label>
                    <input type="number" min="0" value={saleDetails.bookingAmount}
                      onChange={e => setSale("bookingAmount", e.target.value)}
                      placeholder="e.g. 500000" className="dp-input" style={{ borderRadius: "0.875rem" }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Maintenance Charges (₹/mo)</label>
                    <input type="number" min="0" value={saleDetails.maintenanceCharges}
                      onChange={e => setSale("maintenanceCharges", e.target.value)}
                      placeholder="e.g. 5000" className="dp-input" style={{ borderRadius: "0.875rem" }} />
                  </div>
                  <div>
                    <label className={lbl}>Negotiable</label>
                    <select value={saleDetails.negotiable} onChange={e => setSale("negotiable", e.target.value)}
                      className="dp-input dp-select" style={{ borderRadius: "0.875rem" }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Loan Availability</label>
                  <select value={saleDetails.loanAvailable} onChange={e => setSale("loanAvailable", e.target.value)}
                    className="dp-input dp-select" style={{ borderRadius: "0.875rem" }}>
                    <option value="yes">Available</option>
                    <option value="no">Not Available</option>
                  </select>
                </div>
              </div>

              {/* Property Details */}
              <div className="dp-card p-6 space-y-4">
                <h2 className={sh} style={{ fontFamily: "Outfit, sans-serif" }}>Property Details</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Ownership Type</label>
                    <select value={saleDetails.ownershipType} onChange={e => setSale("ownershipType", e.target.value)}
                      className="dp-input dp-select" style={{ borderRadius: "0.875rem" }}>
                      <option value="freehold">Freehold</option>
                      <option value="leasehold">Leasehold</option>
                      <option value="builder-owned">Builder-Owned</option>
                      <option value="resale">Resale</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Property Age (years)</label>
                    <input type="number" min="0" value={saleDetails.propertyAge}
                      onChange={e => setSale("propertyAge", e.target.value)}
                      placeholder="e.g. 5" className="dp-input" style={{ borderRadius: "0.875rem" }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Possession Status</label>
                    <select value={saleDetails.possessionStatus} onChange={e => setSale("possessionStatus", e.target.value)}
                      className="dp-input dp-select" style={{ borderRadius: "0.875rem" }}>
                      <option value="ready-to-move">Ready to Move</option>
                      <option value="under-construction">Under Construction</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Possession Date</label>
                    <input type="date" value={saleDetails.possessionDate}
                      onChange={e => setSale("possessionDate", e.target.value)}
                      className="dp-input" style={{ borderRadius: "0.875rem" }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Floor Number</label>
                    <input type="text" value={saleDetails.floorNumber}
                      onChange={e => setSale("floorNumber", e.target.value)}
                      placeholder="e.g. 4" className="dp-input" style={{ borderRadius: "0.875rem" }} />
                  </div>
                  <div>
                    <label className={lbl}>Total Floors</label>
                    <input type="number" min="1" value={saleDetails.totalFloors}
                      onChange={e => setSale("totalFloors", e.target.value)}
                      placeholder="e.g. 12" className="dp-input" style={{ borderRadius: "0.875rem" }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Facing</label>
                    <select value={saleDetails.facing} onChange={e => setSale("facing", e.target.value)}
                      className="dp-input dp-select" style={{ borderRadius: "0.875rem" }}>
                      {["north","south","east","west","north-east","north-west","south-east","south-west"].map(d => (
                        <option key={d} value={d}>{d.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("-")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Vastu Compliant</label>
                    <select value={saleDetails.vastuCompliant} onChange={e => setSale("vastuCompliant", e.target.value)}
                      className="dp-input dp-select" style={{ borderRadius: "0.875rem" }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Area Breakdown */}
              <div className="dp-card p-6 space-y-4">
                <h2 className={sh} style={{ fontFamily: "Outfit, sans-serif" }}>Area Breakdown</h2>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={lbl}>Carpet Area (sq.ft)</label>
                    <input type="number" min="1" value={saleDetails.carpetArea}
                      onChange={e => setSale("carpetArea", e.target.value)}
                      placeholder="1800" className="dp-input" style={{ borderRadius: "0.875rem" }} />
                  </div>
                  <div>
                    <label className={lbl}>Built-up Area (sq.ft)</label>
                    <input type="number" min="1" value={saleDetails.builtUpArea}
                      onChange={e => setSale("builtUpArea", e.target.value)}
                      placeholder="2000" className="dp-input" style={{ borderRadius: "0.875rem" }} />
                  </div>
                  <div>
                    <label className={lbl}>Super Built-up (sq.ft)</label>
                    <input type="number" min="1" value={saleDetails.superBuiltUpArea}
                      onChange={e => setSale("superBuiltUpArea", e.target.value)}
                      placeholder="2400" className="dp-input" style={{ borderRadius: "0.875rem" }} />
                  </div>
                </div>
              </div>

              {/* Legal & Documentation */}
              <div className="dp-card p-6 space-y-4">
                <h2 className={sh} style={{ fontFamily: "Outfit, sans-serif" }}>Legal & Documentation</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>RERA Number</label>
                    <input type="text" value={saleDetails.reraNumber}
                      onChange={e => setSale("reraNumber", e.target.value)}
                      placeholder="RERA/GGM/2024/XXXXX" className="dp-input" style={{ borderRadius: "0.875rem" }} />
                  </div>
                  <div>
                    <label className={lbl}>Registry / Mutation Status</label>
                    <select value={saleDetails.registryStatus} onChange={e => setSale("registryStatus", e.target.value)}
                      className="dp-input dp-select" style={{ borderRadius: "0.875rem" }}>
                      <option value="clear">Clear</option>
                      <option value="pending">Pending</option>
                      <option value="disputed">Disputed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Legal Approvals / Title Status</label>
                  <select value={saleDetails.legalApprovals} onChange={e => setSale("legalApprovals", e.target.value)}
                    className="dp-input dp-select" style={{ borderRadius: "0.875rem" }}>
                    <option value="approved">Approved / Title Clear</option>
                    <option value="pending">Pending Approval</option>
                    <option value="disputed">Disputed</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Address Information */}
          <div className="dp-card p-6 space-y-4">
            <h2 className={sh} style={{ fontFamily: "Outfit, sans-serif" }}>Address Information</h2>

            {/* Autocomplete search */}
            <div>
              <label className={lbl}>Search Location</label>
              <AddressAutocomplete
                onSelect={parsed => setAddress(p => ({ ...p, ...parsed }))}
              />
              <p className="mt-1.5 text-[11px] font-medium text-[#0c2417]/35">
                Select a suggestion to auto-fill the fields below, then review and adjust.
              </p>
            </div>

            <div className="border-t border-[rgba(22,101,52,0.07)] pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Country</label>
                  <input
                    value={address.country}
                    onChange={e => setAddr("country", e.target.value)}
                    placeholder="India"
                    className="dp-input"
                    style={{ borderRadius: "0.875rem" }}
                  />
                </div>
                <div>
                  <label className={lbl}>State</label>
                  <input
                    value={address.state}
                    onChange={e => setAddr("state", e.target.value)}
                    placeholder="e.g. Haryana"
                    className="dp-input"
                    style={{ borderRadius: "0.875rem" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>City <span className="text-red-400">*</span></label>
                  <input
                    required
                    value={address.city}
                    onChange={e => setAddr("city", e.target.value)}
                    placeholder="e.g. Gurugram"
                    className="dp-input"
                    style={{ borderRadius: "0.875rem" }}
                  />
                </div>
                <div>
                  <label className={lbl}>Locality / Area</label>
                  <input
                    value={address.locality}
                    onChange={e => setAddr("locality", e.target.value)}
                    placeholder="e.g. Sector 54, DLF Phase 2"
                    className="dp-input"
                    style={{ borderRadius: "0.875rem" }}
                  />
                </div>
              </div>

              <div>
                <label className={lbl}>Street Address <span className="text-red-400">*</span></label>
                <input
                  required
                  value={address.street}
                  onChange={e => setAddr("street", e.target.value)}
                  placeholder="e.g. Golf Course Road, Plot No. 12"
                  className="dp-input"
                  style={{ borderRadius: "0.875rem" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Landmark</label>
                  <input
                    value={address.landmark}
                    onChange={e => setAddr("landmark", e.target.value)}
                    placeholder="e.g. Near Ambience Mall"
                    className="dp-input"
                    style={{ borderRadius: "0.875rem" }}
                  />
                </div>
                <div>
                  <label className={lbl}>Postal Code</label>
                  <input
                    value={address.postalCode}
                    onChange={e => setAddr("postalCode", e.target.value)}
                    placeholder="e.g. 122002"
                    maxLength={10}
                    className="dp-input"
                    style={{ borderRadius: "0.875rem" }}
                  />
                </div>
              </div>

              {/* Coordinates — read-only, populated by autocomplete */}
              {(address.lat !== 0 || address.lng !== 0) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Latitude</label>
                    <input
                      readOnly
                      value={address.lat}
                      className="dp-input bg-[#f4f9f6] cursor-default"
                      style={{ borderRadius: "0.875rem" }}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Longitude</label>
                    <input
                      readOnly
                      value={address.lng}
                      className="dp-input bg-[#f4f9f6] cursor-default"
                      style={{ borderRadius: "0.875rem" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Media */}
          <div className="dp-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className={sh} style={{ fontFamily: "Outfit, sans-serif" }}>Property Media</h2>
              <span className="text-xs font-bold text-[#0c2417]/30">{images.length}/10</span>
            </div>
            {images.length < 10 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={e => { e.preventDefault(); handleImageFiles(e.dataTransfer.files); }}
                onDragOver={e => e.preventDefault()}
                className="border-2 border-dashed border-[rgba(22,101,52,0.15)] hover:border-[#166534] hover:bg-[#166534]/[0.03] rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#166534]/8 border border-[rgba(22,101,52,0.12)] flex items-center justify-center group-hover:bg-[#166534]/15 transition-colors">
                  <ImagePlus className="w-5 h-5 text-[#166534]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#0c2417]/50 group-hover:text-[#0c2417]/70 transition-colors">
                    Drop images / videos here or <span className="text-[#166534]">browse</span>
                  </p>
                  <p className="text-xs text-[#0c2417]/30 mt-0.5">JPG, PNG, WEBP, MP4 — up to 10 files</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden"
                  onChange={e => handleImageFiles(e.target.files)} />
              </div>
            )}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((item, idx) => {
                  const src = item.kind === "file" ? item.preview : item.url;
                  const isVideo = item.kind === "file" && item.file.type.startsWith("video/");
                  return (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-[#f4f9f6] border border-[rgba(22,101,52,0.06)]">
                      {isVideo ? <video src={src} className="w-full h-full object-cover" muted /> : <img src={src} alt={item.name} className="w-full h-full object-cover" />}
                      {idx === coverIndex && (
                        <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-[#166534] text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg">
                          <Star className="w-2.5 h-2.5 fill-current" />Cover
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {idx !== coverIndex && !isVideo && (
                          <button type="button" onClick={e => { e.stopPropagation(); setCoverIndex(idx); }}
                            className="p-1.5 bg-[#166534] rounded-lg text-white"><Star className="w-3.5 h-3.5" /></button>
                        )}
                        <button type="button" onClick={e => { e.stopPropagation(); removeImage(idx); }}
                          className="p-1.5 bg-red-500 rounded-lg text-white"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="dp-card p-6">
            <AiDescriptionField
              value={form.description}
              onChange={v => set("description", v)}
              token={token}
              onError={setError}
              getPayload={() => buildGenerateDescriptionInput({
                listingType: form.listingType,
                propertyTypeSlug: form.type,
                propertyTypeName: propertyCategories.find(c => c.slug === form.type)?.name,
                title: form.title,
                city: address.city,
                locality: address.locality,
                street: address.street,
                bedrooms: form.bedrooms,
                bathrooms: form.bathrooms,
                area: form.area,
                price: form.price,
                existingDescription: form.description,
              })}
            />
          </div>

          {error && <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

          {/* Sticky footer */}
          <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-[rgba(22,101,52,0.08)] px-4 py-3 flex justify-end gap-3 lg:left-64">
            <Link to={ROUTES.PROPERTIES}
              className="px-5 h-11 flex items-center rounded-xl text-sm font-bold text-[#0c2417]/40 border border-[rgba(22,101,52,0.08)] hover:bg-[#f4f9f6] hover:text-[#0c2417] transition-all">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading || listingCategories.length === 0 || propertyCategories.length === 0}
              title={listingCategories.length === 0 || propertyCategories.length === 0 ? "Categories must be configured before a property can be added" : undefined}
              className="premium-btn flex items-center gap-2 px-6 h-11 text-xs tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />SAVING…</> : <><span>CONTINUE</span><ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        </form>
      )}

      {/* ══ STEP 2 ══ */}
      {step === 2 && (
        <AmenitiesFormSection
          onSave={handleSaveAmenities}
          saving={savingAmenities}
          onSkip={() => navigate(ROUTES.PROPERTIES)}
          listingType={form.listingType}
        />
      )}
    </div>
  );
}
