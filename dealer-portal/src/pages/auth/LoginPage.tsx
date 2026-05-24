import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { authApi } from "../../services/api";
import { ROUTES } from "../../constants/routes";

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(form.email, form.password);
      setAuth(res.user, res.token);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Soft purple blobs — exactly like main frontend */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#5b21b6]/[0.08] rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#5b21b6]/[0.08] rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-[#5b21b6] rounded-2xl flex items-center justify-center mb-5 shadow-lg"
            style={{ boxShadow: "0 8px 24px -6px rgba(91,33,182,0.4)" }}>
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-[#111111] tracking-tight mb-1.5"
            style={{ fontFamily: "Outfit, sans-serif" }}>
            Welcome back
          </h1>
          <p className="text-sm text-gray-400 font-medium">Sign in to your dealer account.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8"
          style={{ boxShadow: "0 20px 60px -20px rgba(91,33,182,0.12), 0 4px 20px -4px rgba(0,0,0,0.06)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#5b21b6] transition-colors" />
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                className="dp-input pl-11"
                style={{ borderRadius: "0.875rem" }}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#5b21b6] transition-colors" />
              <input
                type={showPass ? "text" : "password"} required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password"
                className="dp-input pl-11 pr-11"
                style={{ borderRadius: "0.875rem" }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#5b21b6] transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs bg-red-50 border border-red-100 text-red-500 rounded-xl px-3 py-2 font-medium">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="premium-btn w-full flex items-center justify-center gap-2 h-12 text-xs tracking-widest">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
                : <><LogIn className="w-4 h-4" />SIGN IN</>
              }
            </button>
          </form>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-400">
            New dealer?{" "}
            <Link to={ROUTES.REGISTER} className="text-[#5b21b6] font-bold hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Authorised dealers and property owners only.
        </p>
      </div>
    </div>
  );
}
