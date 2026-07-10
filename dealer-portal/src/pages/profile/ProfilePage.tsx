import { useState } from "react";
import { Save, ShieldCheck, User } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const label = "block text-xs font-black text-[#0c2417]/50 uppercase tracking-wide mb-1.5";

export function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "", company: user?.company ?? "", licenseNumber: user?.licenseNumber ?? "" });
  const [saved, setSaved] = useState(false);
  const set = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#0c2417] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Profile Settings</h1>
        <p className="text-sm font-medium text-[#0c2417]/40 mt-0.5">Manage your account information</p>
      </div>

      {/* Avatar card */}
      <div className="dp-card p-6 mb-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-[#166534] flex items-center justify-center shadow-xl shrink-0"
          style={{ boxShadow: "0 8px 24px -6px rgba(22,101,52,0.4)" }}>
          <User className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="text-lg font-black text-[#0c2417] tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>{user?.name}</p>
          <p className="text-sm text-[#0c2417]/40 font-medium">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center text-xs font-black capitalize px-2.5 py-0.5 rounded-full bg-[#f4f9f6] text-[#0c2417]/50 border border-[rgba(22,101,52,0.08)] uppercase tracking-wider">
              {user?.role}
            </span>
            {user?.verified && (
              <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShieldCheck className="w-3 h-3" />Verified
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="dp-card p-6 space-y-4">
          <h2 className="text-sm font-black text-[#0c2417] uppercase tracking-widest mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Personal Information</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Full name</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className="dp-input" style={{ borderRadius: "0.875rem" }} />
            </div>
            <div>
              <label className={label}>Phone number</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" className="dp-input" style={{ borderRadius: "0.875rem" }} />
            </div>
          </div>
          <div>
            <label className={label}>Email address</label>
            <input value={user?.email ?? ""} disabled className="dp-input" style={{ borderRadius: "0.875rem" }} />
            <p className="text-xs font-medium text-[#0c2417]/30 mt-1">Email cannot be changed.</p>
          </div>
        </div>

        {user?.role === "dealer" && (
          <div className="dp-card p-6 space-y-4">
            <h2 className="text-sm font-black text-[#0c2417] uppercase tracking-widest mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Dealer Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Company</label>
                <input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="VEX Realty" className="dp-input" style={{ borderRadius: "0.875rem" }} />
              </div>
              <div>
                <label className={label}>License number</label>
                <input value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} className="dp-input" style={{ borderRadius: "0.875rem" }} />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit"
            className="flex items-center gap-2 px-5 h-11 rounded-xl text-xs font-black tracking-widest text-white transition-all duration-200 active:scale-[0.98]"
            style={saved
              ? { background: "#059669", boxShadow: "0 4px 14px -4px rgba(5,150,105,0.4)" }
              : { background: "#166534", boxShadow: "0 4px 14px -4px rgba(22,101,52,0.4)" }}>
            <Save className="w-4 h-4" />
            {saved ? "SAVED!" : "SAVE CHANGES"}
          </button>
        </div>
      </form>
    </div>
  );
}
