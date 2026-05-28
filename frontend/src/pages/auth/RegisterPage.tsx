import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, Landmark } from "lucide-react";
import { ROUTES } from "@/src/constants/routes";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useWishlistStore } from "@/src/store/useWishlistStore";
import { authApi } from "@/src/services/api";

const inputBase =
  "w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-luxury-purple/50 focus:ring-2 focus:ring-luxury-purple/10 transition-all font-medium";

export const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const navigate              = useNavigate();
  const { setAuthFromApi }    = useAuthStore();
  const { syncFromServer }    = useWishlistStore();

  const set = (key: keyof typeof form, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.phone && form.phone.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({
        name:     form.name,
        email:    form.email,
        password: form.password,
        phone:    form.phone ? `+91${form.phone}` : undefined,
      });
      setAuthFromApi(res.user, res.token);
      syncFromServer(res.token);
      navigate(ROUTES.HOME);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-gray flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-luxury-purple/8 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-luxury-purple/8 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo + title */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link
            to="/"
            className="w-14 h-14 bg-luxury-purple rounded-2xl flex items-center justify-center shadow-lg shadow-luxury-purple/25 mb-5 hover:rotate-6 transition-transform"
          >
            <Landmark className="text-white w-7 h-7" />
          </Link>
          <h1 className="text-3xl font-display font-black tracking-tight text-luxury-black mb-1.5">
            Create an account
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            Join Aetheria and discover premium properties.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* Full name */}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-luxury-purple transition-colors" />
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={e => set("name", e.target.value)}
                className={inputBase}
                autoCorrect="on"
                autoCapitalize="words"
                required
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-luxury-purple transition-colors" />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                className={inputBase}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-luxury-purple transition-colors" />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={e => set("password", e.target.value)}
                className={inputBase}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                minLength={6}
              />
            </div>

            {/* Phone — Indian +91 prefix */}
            <div className="relative group flex items-center">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-luxury-purple transition-colors z-10" />
              {/* prefix badge */}
              <span className="absolute left-11 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500 select-none pointer-events-none z-10">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  set("phone", digits);
                }}
                className={`${inputBase} pl-28`}
                inputMode="numeric"
                maxLength={10}
              />
              {form.phone.length > 0 && (
                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold ${form.phone.length === 10 ? "text-emerald-500" : "text-gray-300"}`}>
                  {form.phone.length}/10
                </span>
              )}
            </div>

            {/* Register button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-13 bg-luxury-purple hover:bg-luxury-purple/90 active:scale-[0.98] text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-luxury-purple/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or continue with</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="flex items-center justify-center gap-2.5 h-12 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 active:scale-[0.97] transition-all text-sm font-semibold text-gray-700 shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2.5 h-12 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 active:scale-[0.97] transition-all text-sm font-semibold text-gray-700 shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to={ROUTES.AUTH.LOGIN} className="text-luxury-purple font-bold hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
