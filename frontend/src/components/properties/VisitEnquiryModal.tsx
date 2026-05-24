import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Home, Video, User, Mail, Phone, Calendar,
  Clock, Users, MessageSquareText, CheckCircle2,
  ShieldCheck, Sparkles, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, MapPin, Star,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { inquiriesApi, type ApiProperty } from "@/src/services/api";
import { useAuthStore } from "@/src/store/useAuthStore";

const TIME_SLOTS = [
  { group: "Morning",   slots: ["9:00 AM", "10:00 AM", "11:00 AM"] },
  { group: "Afternoon", slots: ["12:00 PM", "1:00 PM", "2:00 PM"] },
  { group: "Evening",   slots: ["3:00 PM", "4:00 PM", "5:00 PM"] },
];

const STATUS_META = {
  physical: {
    icon: Home,
    label: "Physical Visit",
    desc: "Visit the property in person",
    gradient: "from-luxury-purple to-indigo-600",
    glow: "shadow-luxury-purple/30",
    bg: "bg-luxury-purple/10",
    text: "text-luxury-purple",
  },
  video: {
    icon: Video,
    label: "Video Tour",
    desc: "Live guided video walkthrough",
    gradient: "from-sky-500 to-indigo-500",
    glow: "shadow-sky-500/30",
    bg: "bg-sky-500/10",
    text: "text-sky-600",
  },
} as const;

type VisitType = "physical" | "video";

interface Props {
  open: boolean;
  onClose: () => void;
  property: ApiProperty;
  defaultVisitType?: VisitType;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  visitDate: string;
  visitTime: string;
  guestCount: number;
  message: string;
}

const EMPTY_FORM: FormState = {
  name: "", email: "", phone: "",
  visitDate: "", visitTime: "",
  guestCount: 1, message: "",
};

const todayStr = () => new Date().toISOString().split("T")[0];

export const VisitEnquiryModal = ({ open, onClose, property, defaultVisitType = "physical" }: Props) => {
  const { user } = useAuthStore();

  const [visitType, setVisitType] = useState<VisitType>(defaultVisitType);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY_FORM,
        name:  user?.name  ?? "",
        email: user?.email ?? "",
        phone: user?.phone?.replace(/^\+91/, "") ?? "",
      });
      setVisitType(defaultVisitType);
      setError(null);
      setSuccess(false);
    }
  }, [open, defaultVisitType, user]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const set = (key: keyof FormState, val: string | number) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.visitDate) { setError("Please select a visit date"); return; }
    if (!form.visitTime) { setError("Please choose a preferred time slot"); return; }

    const meta = STATUS_META[visitType];
    const message = [
      `Visit Type: ${meta.label}`,
      `Date: ${form.visitDate}`,
      `Time: ${form.visitTime}`,
      `Guests: ${form.guestCount}`,
      form.message ? `Note: ${form.message}` : "",
    ].filter(Boolean).join(" | ");

    setError(null);
    setLoading(true);
    try {
      await inquiriesApi.create({
        propertyId: property._id,
        name:  form.name,
        email: form.email,
        phone: form.phone,
        message,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const meta = STATUS_META[visitType];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-luxury-black/75 backdrop-blur-md"
          />

          {/* Panel — wider, shorter */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative w-full sm:max-w-3xl max-h-[80dvh] sm:max-h-[78dvh] bg-white sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Progress bar */}
            <div className="h-1 w-full bg-gray-100 shrink-0">
              <motion.div
                className={cn("h-full bg-gradient-to-r", meta.gradient)}
                initial={{ width: "0%" }}
                animate={{ width: success ? "100%" : "55%" }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-luxury-black/40 hover:text-luxury-black hover:bg-gray-200 transition-all"
            >
              <X size={16} />
            </button>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <AnimatePresence mode="wait">
                {success ? (
                  /* ── Success State ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col items-center justify-center px-8 py-10 text-center"
                    style={{ minHeight: "360px" }}
                  >
                    {/* Animated check */}
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
                      className="relative mb-6"
                    >
                      <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-luxury-purple/20 to-indigo-100 flex items-center justify-center shadow-xl shadow-luxury-purple/15">
                        <CheckCircle2 className="w-12 h-12 text-luxury-purple" />
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-400 flex items-center justify-center shadow-md shadow-green-400/30"
                      >
                        <Star size={14} className="text-white fill-white" />
                      </motion.div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luxury-purple mb-2">
                        Request Submitted
                      </p>
                      <h2 className="text-2xl font-display font-black text-luxury-black mb-3">
                        Visit Confirmed! 🎉
                      </h2>
                      <p className="text-sm text-luxury-black/50 max-w-sm leading-relaxed mx-auto">
                        Your <span className="font-bold text-luxury-black/70">{meta.label}</span> for{" "}
                        <span className="font-bold text-luxury-black/70">{property.title}</span> has been submitted.
                        The dealer will confirm your slot shortly.
                      </p>
                    </motion.div>

                    {/* Info pills */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="mt-6 flex flex-wrap gap-3 justify-center"
                    >
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-luxury-purple/8 border border-luxury-purple/15">
                        <Calendar size={13} className="text-luxury-purple" />
                        <span className="text-[13px] font-black text-luxury-black">{form.visitDate}</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-luxury-purple/8 border border-luxury-purple/15">
                        <Clock size={13} className="text-luxury-purple" />
                        <span className="text-[13px] font-black text-luxury-black">{form.visitTime}</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-luxury-purple/8 border border-luxury-purple/15">
                        <Users size={13} className="text-luxury-purple" />
                        <span className="text-[13px] font-black text-luxury-black">{form.guestCount} Guest{form.guestCount > 1 ? "s" : ""}</span>
                      </div>
                    </motion.div>

                    {/* Property row */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="mt-4 w-full max-w-sm p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3 text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-luxury-purple/10 flex items-center justify-center shrink-0">
                        <MapPin size={16} className="text-luxury-purple" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-black text-luxury-black truncate">{property.title}</p>
                        <p className="text-[11px] text-luxury-black/40 truncate">
                          {[property.location, property.city].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.55 }}
                      onClick={onClose}
                      className="mt-6 px-10 py-3.5 rounded-2xl bg-gradient-to-r from-luxury-purple to-indigo-600 text-white text-[13px] font-bold shadow-lg shadow-luxury-purple/25 hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      Done
                    </motion.button>
                  </motion.div>
                ) : (
                  /* ── Form ── */
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Header */}
                    <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-luxury-purple mb-1">
                        Schedule a Visit
                      </p>
                      <h2 className="text-lg font-display font-black text-luxury-black pr-10 leading-snug">
                        {property.title}
                      </h2>
                      <p className="text-[12px] text-luxury-black/40 mt-0.5 flex items-center gap-1">
                        <MapPin size={11} className="text-luxury-purple shrink-0" />
                        {[property.location, property.city].filter(Boolean).join(", ")}
                      </p>
                    </div>

                    <form id="visit-form" onSubmit={handleSubmit} className="px-6 py-4 space-y-5">
                      {/* Error */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-600"
                          >
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span className="font-semibold">{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Visit Type */}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-luxury-black/40 mb-2.5">Visit Type</p>
                        <div className="grid grid-cols-2 gap-3">
                          {(["physical", "video"] as VisitType[]).map((type) => {
                            const m = STATUS_META[type];
                            const active = visitType === type;
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setVisitType(type)}
                                className={cn(
                                  "relative flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all overflow-hidden",
                                  active
                                    ? "border-luxury-purple shadow-md shadow-luxury-purple/10"
                                    : "border-gray-200 bg-white hover:border-luxury-purple/30"
                                )}
                              >
                                {active && (
                                  <motion.div
                                    layoutId="visit-type-bg"
                                    className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.08]", m.gradient)}
                                  />
                                )}
                                <div className={cn(
                                  "relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                  active ? "bg-luxury-purple text-white" : "bg-gray-100 text-luxury-purple"
                                )}>
                                  <m.icon size={16} />
                                </div>
                                <div className="relative">
                                  <p className={cn("text-[13px] font-black leading-tight", active ? "text-luxury-purple" : "text-luxury-black")}>
                                    {m.label}
                                  </p>
                                  <p className="text-[10px] text-luxury-black/35 mt-0.5">{m.desc}</p>
                                </div>
                                {active && (
                                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-luxury-purple flex items-center justify-center">
                                    <CheckCircle2 size={12} className="text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Personal Details + Schedule — 2 col on sm+ */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Left: personal details */}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-luxury-black/40 mb-2.5">Your Details</p>
                          <div className="space-y-2.5">
                            <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 bg-white focus-within:border-luxury-purple/50 focus-within:shadow-sm transition-all">
                              <User size={14} className="text-luxury-purple shrink-0" />
                              <input
                                type="text"
                                placeholder="Full Name *"
                                value={form.name}
                                onChange={e => set("name", e.target.value)}
                                className="flex-1 bg-transparent text-[13px] text-luxury-black focus:outline-none placeholder:text-luxury-black/25"
                                autoCapitalize="words"
                                required
                              />
                            </label>
                            <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 bg-white focus-within:border-luxury-purple/50 focus-within:shadow-sm transition-all">
                              <Mail size={14} className="text-luxury-purple shrink-0" />
                              <input
                                type="email"
                                placeholder="Email Address *"
                                value={form.email}
                                onChange={e => set("email", e.target.value)}
                                className="flex-1 bg-transparent text-[13px] text-luxury-black focus:outline-none placeholder:text-luxury-black/25 min-w-0"
                                autoCapitalize="none"
                                autoCorrect="off"
                                required
                              />
                            </label>
                            <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 bg-white focus-within:border-luxury-purple/50 focus-within:shadow-sm transition-all">
                              <Phone size={14} className="text-luxury-purple shrink-0" />
                              <input
                                type="tel"
                                placeholder="Mobile Number *"
                                value={form.phone}
                                onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                                className="flex-1 bg-transparent text-[13px] text-luxury-black focus:outline-none placeholder:text-luxury-black/25 min-w-0"
                                inputMode="numeric"
                                required
                              />
                            </label>
                          </div>
                        </div>

                        {/* Right: schedule */}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-luxury-black/40 mb-2.5">Schedule</p>
                          <div className="space-y-2.5">
                            <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 bg-white focus-within:border-luxury-purple/50 focus-within:shadow-sm transition-all">
                              <Calendar size={14} className="text-luxury-purple shrink-0" />
                              <input
                                type="date"
                                value={form.visitDate}
                                onChange={e => { set("visitDate", e.target.value); setError(null); }}
                                min={todayStr()}
                                className="flex-1 bg-transparent text-[13px] text-luxury-black focus:outline-none min-w-0"
                                required
                              />
                            </label>

                            {/* Guest stepper */}
                            <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 bg-white">
                              <Users size={14} className="text-luxury-purple shrink-0" />
                              <span className="text-[13px] text-luxury-black/40 flex-1">Guests</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => set("guestCount", Math.max(1, form.guestCount - 1))}
                                  className="w-7 h-7 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-luxury-black/50 hover:border-luxury-purple/30 hover:text-luxury-purple transition-all"
                                >
                                  <ChevronLeft size={13} />
                                </button>
                                <span className="w-6 text-center text-[14px] font-black text-luxury-black">{form.guestCount}</span>
                                <button
                                  type="button"
                                  onClick={() => set("guestCount", Math.min(10, form.guestCount + 1))}
                                  className="w-7 h-7 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-luxury-black/50 hover:border-luxury-purple/30 hover:text-luxury-purple transition-all"
                                >
                                  <ChevronRight size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Time slots */}
                            <div className="p-3.5 rounded-2xl border border-gray-200 bg-white">
                              <p className="text-[9px] font-black uppercase tracking-widest text-luxury-black/30 flex items-center gap-1 mb-2.5">
                                <Clock size={10} /> Preferred Time
                              </p>
                              <div className="space-y-2">
                                {TIME_SLOTS.map(({ group, slots }) => (
                                  <div key={group}>
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-luxury-black/20 mb-1.5">{group}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {slots.map(slot => {
                                        const active = form.visitTime === slot;
                                        return (
                                          <button
                                            key={slot}
                                            type="button"
                                            onClick={() => { set("visitTime", slot); setError(null); }}
                                            className={cn(
                                              "px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                                              active
                                                ? "bg-luxury-purple text-white border-luxury-purple shadow-sm shadow-luxury-purple/20"
                                                : "bg-gray-50 border-gray-200 text-luxury-black/50 hover:border-luxury-purple/30 hover:text-luxury-purple"
                                            )}
                                          >
                                            {slot}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-200 bg-white focus-within:border-luxury-purple/50 focus-within:shadow-sm transition-all">
                        <MessageSquareText size={14} className="text-luxury-purple shrink-0 mt-0.5" />
                        <textarea
                          placeholder="Any specific requests or notes? (Optional)"
                          value={form.message}
                          onChange={e => set("message", e.target.value)}
                          className="flex-1 h-16 bg-transparent text-[13px] text-luxury-black focus:outline-none resize-none placeholder:text-luxury-black/25"
                          autoCorrect="on"
                        />
                      </label>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Sticky footer with submit button ── */}
            {!success && (
              <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white">
                <button
                  type="submit"
                  form="visit-form"
                  disabled={loading}
                  className={cn(
                    "w-full h-12 rounded-2xl text-white text-[13px] font-black tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-lg",
                    `bg-gradient-to-r ${meta.gradient} shadow-luxury-purple/20`,
                    loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90 active:scale-[0.98]"
                  )}
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                  ) : (
                    <><Sparkles size={15} /> Confirm {meta.label}</>
                  )}
                </button>
                <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-luxury-black/25 uppercase tracking-widest mt-2.5">
                  <ShieldCheck size={11} className="text-luxury-purple" />
                  Your details are kept private
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
