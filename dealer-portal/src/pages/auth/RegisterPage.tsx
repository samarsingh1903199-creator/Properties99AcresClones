import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, UserPlus, ChevronDown, User, ShieldCheck, Eye } from "lucide-react";
import { useAuthStore, type UserRole } from "../../store/useAuthStore";
import { authApi } from "../../services/api";
import { ROUTES } from "../../constants/routes";

const ROLE_OPTIONS: { value: UserRole; label: string; description: string; icon: React.ElementType; color: string }[] = [
  { value: "visitor", label: "Visitor",  description: "Browse and enquire about properties",      icon: Eye,         color: "#6b7280" },
  { value: "dealer",  label: "Dealer",   description: "List and manage property listings",         icon: Building2,   color: "#5b21b6" },
  { value: "admin",   label: "Admin",    description: "Full platform access and management",        icon: ShieldCheck, color: "#059669" },
];

const label = "block text-xs font-bold text-[#111111]/50 mb-1.5 uppercase tracking-wide";

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    role: "visitor" as UserRole, company: "", licenseNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const set = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const selectedRole = ROLE_OPTIONS.find((r) => r.value === form.role)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.phone && form.phone.length !== 10) { setError("Phone number must be exactly 10 digits."); return; }
    setLoading(true);
    try {
      const res = await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone ? `+91${form.phone}` : "",
        company: form.company,
        licenseNumber: form.licenseNumber,
      });
      setAuth(res.user, res.token);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#5b21b6]/[0.08] rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#5b21b6]/[0.08] rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-[#5b21b6] rounded-2xl flex items-center justify-center mb-5 shadow-lg"
            style={{ boxShadow: "0 8px 24px -6px rgba(91,33,182,0.4)" }}>
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-[#111111] tracking-tight mb-1.5"
            style={{ fontFamily: "Outfit, sans-serif" }}>Create account</h1>
          <p className="text-sm text-gray-400 font-medium">Join the Luxury Real Estate platform.</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8"
          style={{ boxShadow: "0 20px 60px -20px rgba(91,33,182,0.12), 0 4px 20px -4px rgba(0,0,0,0.06)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── Role dropdown ── */}
            <div>
              <label className={label}>Account type</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="w-full flex items-center gap-3 dp-input text-left"
                  style={{ borderRadius: "0.875rem" }}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${selectedRole.color}18`, border: `1px solid ${selectedRole.color}30` }}
                  >
                    <selectedRole.icon className="w-3.5 h-3.5" style={{ color: selectedRole.color }} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-[#111111]">{selectedRole.label}</span>
                    <span className="block text-[11px] text-[#111111]/40 font-medium">{selectedRole.description}</span>
                  </span>
                  <ChevronDown
                    className="w-4 h-4 text-[#111111]/30 shrink-0 transition-transform duration-200"
                    style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div
                      className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white rounded-2xl border border-[rgba(91,33,182,0.1)] overflow-hidden"
                      style={{ boxShadow: "0 16px 40px -8px rgba(91,33,182,0.18)" }}
                    >
                      {ROLE_OPTIONS.map((opt) => {
                        const active = form.role === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => { set("role", opt.value); setDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left hover:bg-[#f8f9fa]"
                            style={active ? { background: `${opt.color}08` } : {}}
                          >
                            <span
                              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: `${opt.color}15`, border: `1px solid ${opt.color}25` }}
                            >
                              <opt.icon className="w-4 h-4" style={{ color: opt.color }} />
                            </span>
                            <span className="flex-1">
                              <span className="block text-sm font-bold" style={{ color: active ? opt.color : "#111111" }}>
                                {opt.label}
                              </span>
                              <span className="block text-[11px] text-[#111111]/40 font-medium">{opt.description}</span>
                            </span>
                            {active && (
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: opt.color }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Name + Phone ── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Full name</label>
                <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Raj Sharma" className="dp-input" style={{ borderRadius: "0.875rem" }} />
              </div>
              <div>
                <label className={label}>Mobile number</label>
                <div className="flex items-stretch" style={{ borderRadius: "0.875rem", border: "1px solid #e5e7eb", overflow: "hidden", background: "#fff" }}
                  onFocusCapture={(e) => (e.currentTarget.style.borderColor = "rgba(91,33,182,0.5)")}
                  onBlurCapture={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                >
                  {/* Country prefix */}
                  <div className="flex items-center gap-1.5 px-3 bg-[#f8f9fa] border-r border-gray-200 shrink-0">
                    <span className="text-base leading-none">🇮🇳</span>
                    <span className="text-xs font-black text-[#5b21b6]">+91</span>
                  </div>
                  {/* Digits only, max 10 */}
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      set("phone", digits);
                    }}
                    placeholder="9876543210"
                    className="flex-1 px-3 py-[0.65rem] text-sm font-medium text-[#111111] outline-none bg-white placeholder:text-gray-300"
                  />
                  {/* Digit counter */}
                  <div className="flex items-center pr-3 shrink-0">
                    <span className={`text-[10px] font-bold tabular-nums ${form.phone.length === 10 ? "text-emerald-500" : "text-[#111111]/20"}`}>
                      {form.phone.length}/10
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Email ── */}
            <div>
              <label className={label}>Email address</label>
              <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className="dp-input" style={{ borderRadius: "0.875rem" }} />
            </div>

            {/* ── Password ── */}
            <div>
              <label className={label}>Password</label>
              <input type="password" required value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="min 6 characters" className="dp-input" style={{ borderRadius: "0.875rem" }} />
            </div>

            {/* ── Dealer-only fields ── */}
            {form.role === "dealer" && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className={label}>Company</label>
                  <input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="VEX Realty" className="dp-input" style={{ borderRadius: "0.875rem" }} />
                </div>
                <div>
                  <label className={label}>License No.</label>
                  <input value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} placeholder="MH-2024-REA-00423" className="dp-input" style={{ borderRadius: "0.875rem" }} />
                </div>
              </div>
            )}

            {/* ── Role info banner ── */}
            {form.role === "admin" && (
              <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-emerald-700">Admin accounts are subject to approval before full access is granted.</p>
              </div>
            )}

            {error && (
              <p className="text-xs bg-red-50 border border-red-100 text-red-500 rounded-xl px-3 py-2 font-medium">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="premium-btn w-full flex items-center justify-center gap-2 h-12 text-xs tracking-widest">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</>
                : <><UserPlus className="w-4 h-4" />CREATE ACCOUNT</>
              }
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to={ROUTES.LOGIN} className="text-[#5b21b6] font-bold hover:underline underline-offset-4">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
