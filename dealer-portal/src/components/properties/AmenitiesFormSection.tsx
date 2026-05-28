import { useState, useEffect } from "react";
import {
  Car, Zap, Shield, Wifi, Dumbbell, Droplets, Building2,
  Wind, BedDouble, Archive, Lock, MapPin, Check, SkipForward,
  Save, Loader2, Users,
} from "lucide-react";
import type { ApiPropertyAmenities } from "../../services/api";
import { PREFERRED_TENANT_TYPES } from "../../constants/tenants";

/* ── Types ─────────────────────────────────────────────────── */
export type AmenitiesFormData = {
  parking: 0 | 1 | 2 | 3;
  powerBackup: boolean;
  security24x7: boolean;
  highSpeedWifi: boolean;
  gymnasium: boolean;
  swimmingPool: boolean;
  clubHouse: boolean;
  separateElectricityMeter: boolean;
  airConditioning: boolean;
  acCount: number;
  furnishingStatus: "unfurnished" | "semi-furnished" | "fully-furnished";
  bedsCount: number;
  almirah: boolean;
  storage: boolean;
  waterSupply: "municipal" | "borewell" | "both" | "none";
  securityDeposit: string;
  distanceFromLocation: string;
  preferred_tenants: string[];
};

export const AMENITIES_DEFAULT: AmenitiesFormData = {
  parking: 0, powerBackup: false, security24x7: false,
  highSpeedWifi: false, gymnasium: false, swimmingPool: false,
  clubHouse: false, separateElectricityMeter: false,
  airConditioning: false, acCount: 0,
  furnishingStatus: "unfurnished", bedsCount: 0, almirah: false, storage: false,
  waterSupply: "none", securityDeposit: "", distanceFromLocation: "",
  preferred_tenants: [],
};

/** Convert API amenities object → form state */
export function amenitiesFromApi(a: Partial<ApiPropertyAmenities>): AmenitiesFormData {
  return {
    parking: ((a.parking ?? 0) as 0 | 1 | 2 | 3),
    powerBackup: a.powerBackup ?? false,
    security24x7: a.security24x7 ?? false,
    highSpeedWifi: a.highSpeedWifi ?? false,
    gymnasium: a.gymnasium ?? false,
    swimmingPool: a.swimmingPool ?? false,
    clubHouse: a.clubHouse ?? false,
    separateElectricityMeter: a.separateElectricityMeter ?? false,
    airConditioning: a.airConditioning ?? false,
    acCount: a.acCount ?? 0,
    furnishingStatus: a.furnishingStatus ?? "unfurnished",
    bedsCount: a.bedsCount ?? 0,
    almirah: a.almirah ?? false,
    storage: a.storage ?? false,
    waterSupply: a.waterSupply ?? "none",
    securityDeposit: a.securityDeposit ? String(a.securityDeposit) : "",
    distanceFromLocation: a.distanceFromLocation ? String(a.distanceFromLocation) : "",
    preferred_tenants: a.preferred_tenants ?? [],
  };
}

/** Convert form state → API payload.
 *  Sale listings omit rent-only fields (security deposit, tenant prefs,
 *  furnishing inventory) that are not shown in the sale UI. */
export function amenitiesToApi(
  data: AmenitiesFormData,
  listingType: "sale" | "rent" = "rent",
): Partial<ApiPropertyAmenities> {
  const isSale = listingType === "sale";
  return {
    /* ── shared fields ── */
    parking: data.parking,
    powerBackup: data.powerBackup,
    security24x7: data.security24x7,
    separateElectricityMeter: data.separateElectricityMeter,
    highSpeedWifi: data.highSpeedWifi,
    gymnasium: data.gymnasium,
    swimmingPool: data.swimmingPool,
    clubHouse: data.clubHouse,
    airConditioning: data.airConditioning,
    acCount: data.airConditioning ? data.acCount : 0,
    furnishingStatus: data.furnishingStatus,
    waterSupply: data.waterSupply,
    distanceFromLocation: data.distanceFromLocation ? Number(data.distanceFromLocation) : 0,
    /* ── rent-only fields ── */
    ...(!isSale && {
      bedsCount: data.bedsCount,
      almirah: data.almirah,
      storage: data.storage,
      securityDeposit: data.securityDeposit ? Number(data.securityDeposit) : 0,
      preferred_tenants: data.preferred_tenants,
    }),
  };
}

/* ── Internal sub-components ───────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/30 ${checked ? "bg-[#5b21b6]" : "bg-gray-200"}`}
      aria-checked={checked}
      role="switch"
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function AmenityRow({
  icon: Icon, label, sub, checked, onChange,
}: {
  icon: React.ElementType; label: string; sub?: string; checked: boolean; onChange: () => void;
}) {
  return (
    <div
      onClick={onChange}
      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all select-none ${
        checked ? "bg-[#5b21b6]/[0.05] border-[#5b21b6]/20" : "bg-white border-gray-100 hover:border-[#5b21b6]/15 hover:bg-gray-50/60"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-[#5b21b6]/15" : "bg-gray-100"}`}>
        <Icon className={`w-4 h-4 transition-colors ${checked ? "text-[#5b21b6]" : "text-[#111111]/35"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[#111111]">{label}</p>
        {sub && <p className="text-[11px] text-[#111111]/35 font-medium">{sub}</p>}
      </div>
      <Toggle checked={checked} onChange={() => {}} />
    </div>
  );
}

function ParkingChip({ value, selected, onClick }: { value: 0 | 1 | 2 | 3; selected: boolean; onClick: () => void }) {
  const labels = ["No Parking", "1 Spot", "2 Spots", "3 Spots"];
  return (
    <button type="button" onClick={onClick}
      className={`flex-1 py-3 rounded-2xl text-[13px] font-bold transition-all border ${
        selected ? "bg-[#5b21b6] text-white border-[#5b21b6] shadow-sm" : "bg-white text-[#111111]/50 border-gray-200 hover:border-[#5b21b6]/30 hover:text-[#5b21b6]"
      }`}
    >
      <span className="block text-lg font-black" style={{ fontFamily: "Outfit, sans-serif" }}>{value === 0 ? "✗" : value}</span>
      <span className="text-[10px] font-bold opacity-70">{labels[value]}</span>
    </button>
  );
}

/* ── Section heading style ─────────────────────────────────── */
const SH = "text-sm font-black text-[#111111] uppercase tracking-widest";
const label = "block text-xs font-black text-[#111111]/50 uppercase tracking-wide mb-1.5";

/* ── Props ─────────────────────────────────────────────────── */
interface AmenitiesFormSectionProps {
  initialValues?: Partial<AmenitiesFormData>;
  onSave: (data: AmenitiesFormData) => Promise<void>;
  saving?: boolean;
  onSkip?: () => void;
  successMessage?: string;
  listingType?: "sale" | "rent";
}

/* ── Main export ───────────────────────────────────────────── */
export function AmenitiesFormSection({
  initialValues, onSave, saving = false, onSkip, successMessage, listingType = "rent",
}: AmenitiesFormSectionProps) {
  const [form, setForm] = useState<AmenitiesFormData>({ ...AMENITIES_DEFAULT, ...initialValues });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* sync if initialValues loads async (e.g. after API fetch in edit mode) */
  useEffect(() => {
    if (initialValues) setForm({ ...AMENITIES_DEFAULT, ...initialValues });
  }, [JSON.stringify(initialValues)]);  // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof AmenitiesFormData>(key: K, val: AmenitiesFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    try {
      await onSave(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save amenities");
    }
  };

  return (
    <div className="space-y-5 pb-28">

      {/* ── 1. Preferred Tenants (rent only) ── */}
      {listingType !== "sale" && (
        <div className="dp-card p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#5b21b6]/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#5b21b6]" />
            </div>
            <div>
              <h3 className={SH} style={{ fontFamily: "Outfit, sans-serif" }}>Preferred Tenants</h3>
              <p className="text-[11px] text-[#111111]/35 font-medium mt-0.5">Select all tenant types suitable for this property</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PREFERRED_TENANT_TYPES.map(tenant => {
              const selected = form.preferred_tenants.includes(tenant);
              return (
                <button
                  key={tenant}
                  type="button"
                  onClick={() => {
                    const next = selected
                      ? form.preferred_tenants.filter(t => t !== tenant)
                      : [...form.preferred_tenants, tenant];
                    set("preferred_tenants", next);
                  }}
                  className={`px-4 py-2 rounded-2xl text-[13px] font-bold border transition-all ${
                    selected
                      ? "bg-[#5b21b6] text-white border-[#5b21b6] shadow-sm"
                      : "bg-white text-[#111111]/50 border-gray-200 hover:border-[#5b21b6]/30 hover:text-[#5b21b6]"
                  }`}
                >
                  {selected && <Check className="w-3 h-3 inline mr-1.5 -mt-0.5" />}
                  {tenant}
                </button>
              );
            })}
          </div>
          {form.preferred_tenants.length === 0 && (
            <p className="text-[11px] text-[#111111]/30 font-medium mt-3">No preference selected — property will be open to all tenant types</p>
          )}
        </div>
      )}

      {/* ── 2. Parking ── */}
      <div className="dp-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#5b21b6]/10 flex items-center justify-center">
            <Car className="w-4 h-4 text-[#5b21b6]" />
          </div>
          <div>
            <h3 className={SH} style={{ fontFamily: "Outfit, sans-serif" }}>Parking Availability</h3>
            <p className="text-[11px] text-[#111111]/35 font-medium mt-0.5">Number of dedicated parking spots</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {([0, 1, 2, 3] as const).map(v => (
            <ParkingChip key={v} value={v} selected={form.parking === v} onClick={() => set("parking", v)} />
          ))}
        </div>
      </div>

      {/* ── 3. Basic Amenities ── */}
      <div className="dp-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#5b21b6]/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-[#5b21b6]" />
          </div>
          <div>
            <h3 className={SH} style={{ fontFamily: "Outfit, sans-serif" }}>Basic Amenities</h3>
            <p className="text-[11px] text-[#111111]/35 font-medium mt-0.5">Tap to toggle available amenities</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <AmenityRow icon={Zap}       label="Power Backup"               sub="Full / partial backup"    checked={form.powerBackup}              onChange={() => set("powerBackup", !form.powerBackup)} />
          <AmenityRow icon={Shield}    label="24/7 Security"              sub="Round-the-clock guards"   checked={form.security24x7}             onChange={() => set("security24x7", !form.security24x7)} />
          <AmenityRow icon={Wifi}      label="High-Speed WiFi"            sub="Broadband / fibre ready"  checked={form.highSpeedWifi}            onChange={() => set("highSpeedWifi", !form.highSpeedWifi)} />
          <AmenityRow icon={Dumbbell}  label="Gymnasium"                  sub="Fully equipped gym"       checked={form.gymnasium}               onChange={() => set("gymnasium", !form.gymnasium)} />
          <AmenityRow icon={Droplets}  label="Swimming Pool"              sub="Common / private pool"    checked={form.swimmingPool}            onChange={() => set("swimmingPool", !form.swimmingPool)} />
          <AmenityRow icon={Building2} label="Club House"                 sub="Community / party hall"   checked={form.clubHouse}               onChange={() => set("clubHouse", !form.clubHouse)} />
          <AmenityRow icon={Zap}       label="Separate Electricity Meter" sub="Individual unit meter"    checked={form.separateElectricityMeter} onChange={() => set("separateElectricityMeter", !form.separateElectricityMeter)} />
        </div>
      </div>

      {/* ── 4. Air Conditioning ── */}
      <div className="dp-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#5b21b6]/10 flex items-center justify-center">
            <Wind className="w-4 h-4 text-[#5b21b6]" />
          </div>
          <div>
            <h3 className={SH} style={{ fontFamily: "Outfit, sans-serif" }}>Air Conditioning</h3>
            <p className="text-[11px] text-[#111111]/35 font-medium mt-0.5">AC availability and unit count</p>
          </div>
        </div>
        <div
          onClick={() => { set("airConditioning", !form.airConditioning); if (form.airConditioning) set("acCount", 0); }}
          className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer select-none mb-3 transition-all ${
            form.airConditioning ? "bg-[#5b21b6]/[0.05] border-[#5b21b6]/20" : "bg-gray-50/60 border-gray-100"
          }`}
        >
          <div>
            <p className="text-[13px] font-bold text-[#111111]">Air Conditioning Installed</p>
            <p className="text-[11px] text-[#111111]/35 font-medium">AC units available in property</p>
          </div>
          <Toggle checked={form.airConditioning} onChange={() => {}} />
        </div>
        {form.airConditioning && (
          <div>
            <label className={label}>Number of AC Units</label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => set("acCount", n)}
                  className={`py-3 rounded-2xl text-sm font-black transition-all border ${
                    form.acCount === n ? "bg-[#5b21b6] text-white border-[#5b21b6]" : "bg-white text-[#111111]/50 border-gray-200 hover:border-[#5b21b6]/30 hover:text-[#5b21b6]"
                  }`}
                >
                  {n}{n === 5 ? "+" : ""}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 5. Furnishing ── */}
      <div className="dp-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#5b21b6]/10 flex items-center justify-center">
            <BedDouble className="w-4 h-4 text-[#5b21b6]" />
          </div>
          <div>
            <h3 className={SH} style={{ fontFamily: "Outfit, sans-serif" }}>Furnishing Details</h3>
            <p className="text-[11px] text-[#111111]/35 font-medium mt-0.5">Furnishing level and inventory</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(["unfurnished", "semi-furnished", "fully-furnished"] as const).map(fs => (
            <button key={fs} type="button" onClick={() => set("furnishingStatus", fs)}
              className={`py-3 rounded-2xl text-[12px] font-bold transition-all border ${
                form.furnishingStatus === fs ? "bg-[#5b21b6] text-white border-[#5b21b6] shadow-sm" : "bg-white text-[#111111]/50 border-gray-200 hover:border-[#5b21b6]/30 hover:text-[#5b21b6]"
              }`}
            >
              {fs === "unfurnished" ? "Unfurnished" : fs === "semi-furnished" ? "Semi-Furnished" : "Fully Furnished"}
            </button>
          ))}
        </div>
        {form.furnishingStatus !== "unfurnished" && listingType !== "sale" && (
          <div className="space-y-3 pt-3 border-t border-[rgba(91,33,182,0.06)]">
            <div>
              <label className={label}>Total Beds Across All Rooms</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => set("bedsCount", Math.max(0, form.bedsCount - 1))}
                  className="w-10 h-10 rounded-xl border border-gray-200 font-black text-[#111111]/40 hover:border-[#5b21b6]/30 hover:text-[#5b21b6] transition-all flex items-center justify-center text-lg">−</button>
                <span className="text-2xl font-black text-[#111111] w-10 text-center" style={{ fontFamily: "Outfit, sans-serif" }}>{form.bedsCount}</span>
                <button type="button" onClick={() => set("bedsCount", Math.min(20, form.bedsCount + 1))}
                  className="w-10 h-10 rounded-xl border border-gray-200 font-black text-[#111111]/40 hover:border-[#5b21b6]/30 hover:text-[#5b21b6] transition-all flex items-center justify-center text-lg">+</button>
                <span className="text-sm font-medium text-[#111111]/35">beds</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <AmenityRow icon={Archive} label="Almirah / Wardrobe" sub="Built-in storage" checked={form.almirah} onChange={() => set("almirah", !form.almirah)} />
              <AmenityRow icon={Archive} label="Storage Room"       sub="Extra storage"   checked={form.storage}  onChange={() => set("storage",  !form.storage)} />
            </div>
          </div>
        )}
      </div>

      {/* ── 6. Water Supply ── */}
      <div className="dp-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#5b21b6]/10 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-[#5b21b6]" />
          </div>
          <div>
            <h3 className={SH} style={{ fontFamily: "Outfit, sans-serif" }}>Water Supply</h3>
            <p className="text-[11px] text-[#111111]/35 font-medium mt-0.5">Primary water source for the property</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: "municipal" as const, label: "Municipal Water",  sub: "24-hour corporation supply" },
            { value: "borewell"  as const, label: "Borewell",         sub: "Underground water source" },
            { value: "both"      as const, label: "Both",             sub: "Municipal + Borewell" },
            { value: "none"      as const, label: "Not Available",    sub: "No supply info" },
          ]).map(({ value, label: l, sub }) => (
            <button key={value} type="button" onClick={() => set("waterSupply", value)}
              className={`flex items-start gap-2.5 p-3.5 rounded-2xl border text-left transition-all ${
                form.waterSupply === value ? "bg-[#5b21b6]/[0.05] border-[#5b21b6]/20" : "bg-white border-gray-100 hover:border-[#5b21b6]/15 hover:bg-gray-50/60"
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                form.waterSupply === value ? "border-[#5b21b6] bg-[#5b21b6]" : "border-gray-300"
              }`}>
                {form.waterSupply === value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className={`text-[13px] font-bold transition-colors ${form.waterSupply === value ? "text-[#5b21b6]" : "text-[#111111]"}`}>{l}</p>
                <p className="text-[11px] text-[#111111]/35 font-medium mt-0.5">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 7 & 8. Security Deposit + Distance ── */}
      <div className="dp-card p-6 space-y-5">
        <h3 className={SH} style={{ fontFamily: "Outfit, sans-serif" }}>
          {listingType === "sale" ? "Location & Accessibility" : "Additional Details"}
        </h3>
        {listingType !== "sale" && (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Lock className="w-3.5 h-3.5 text-[#5b21b6]/60" />
              <label className={label.replace("mb-1.5", "mb-0")}>Security Deposit Amount (₹)</label>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#111111]/30 font-bold text-sm">₹</span>
              <input type="number" min="0" value={form.securityDeposit}
                onChange={e => set("securityDeposit", e.target.value)}
                placeholder="Enter security deposit amount"
                className="dp-input pl-8" style={{ borderRadius: "0.875rem" }} />
            </div>
            <p className="text-[11px] text-[#111111]/30 font-medium mt-1.5">Refundable amount collected from tenant</p>
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#5b21b6]/60" />
            <label className={label.replace("mb-1.5", "mb-0")}>Distance from Nearest Landmark</label>
          </div>
          <div className="relative">
            <input type="number" min="0" step="0.1" value={form.distanceFromLocation}
              onChange={e => set("distanceFromLocation", e.target.value)}
              placeholder="e.g. 2"
              className="dp-input pr-14" style={{ borderRadius: "0.875rem" }} />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#111111]/30 font-bold text-sm">km</span>
          </div>
          <p className="text-[11px] text-[#111111]/30 font-medium mt-1.5">Distance from metro, school, or major landmark</p>
        </div>
      </div>

      {error && (
        <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-[rgba(91,33,182,0.08)] px-4 py-3 flex items-center justify-end gap-3 lg:left-64">
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-600 text-[12px] font-bold mr-auto">
            <Check className="w-3.5 h-3.5" />
            {successMessage ?? "Amenities saved!"}
          </span>
        )}
        {onSkip && (
          <button type="button" onClick={onSkip}
            className="px-5 h-11 flex items-center gap-2 rounded-xl text-sm font-bold text-[#111111]/40 border border-[rgba(91,33,182,0.08)] hover:bg-[#f8f9fa] hover:text-[#111111] transition-all">
            <SkipForward className="w-4 h-4" />Skip for now
          </button>
        )}
        <button type="button" onClick={handleSave} disabled={saving}
          className="premium-btn flex items-center gap-2 px-6 h-11 text-xs tracking-widest disabled:opacity-60 disabled:cursor-not-allowed">
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" />SAVING…</>
            : <><Save className="w-4 h-4" /><span>{listingType === "sale" ? "SAVE FEATURES" : "SAVE AMENITIES"}</span></>
          }
        </button>
      </div>
    </div>
  );
}
