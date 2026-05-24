import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Video,
  Home,
  Clock,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { useUIStore } from "@/src/store/useUIStore";
import { Button } from "../ui/Button";
import { useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";

const VISIT_TYPES = [
  { id: "physical", label: "Physical Visit", desc: "Meet an advisor at the property", icon: Home },
  { id: "video", label: "Video Tour", desc: "Live guided walkthrough on call", icon: Video },
];

export const BookingModal = () => {
  const { isBookingModalOpen, bookingVisitType, closeBookingModal } = useUIStore();
  const [visitType, setVisitType] = useState("physical");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isBookingModalOpen) {
      setVisitType(bookingVisitType);
      setSubmitted(false);
    }
  }, [bookingVisitType, isBookingModalOpen]);

  if (!isBookingModalOpen) return null;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      closeBookingModal();
    }, 2200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeBookingModal}
          className="absolute inset-0 bg-luxury-black/70 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/70"
        >
          {submitted ? (
            <div className="flex flex-col items-center justify-center min-h-[520px] px-8 text-center bg-gradient-to-br from-white via-luxury-purple/5 to-indigo-50">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-24 h-24 rounded-[2rem] bg-luxury-purple/10 border border-luxury-purple/15 flex items-center justify-center mb-7 shadow-lg shadow-luxury-purple/10"
              >
                <CheckCircle2 className="w-12 h-12 text-luxury-purple" />
              </motion.div>
              <h2 className="text-3xl font-display font-black text-luxury-black mb-3">Visit Booked</h2>
              <p className="text-sm text-luxury-black/50 max-w-sm leading-relaxed">
                Our property advisor will confirm your preferred slot and share the next steps shortly.
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[0.9fr_1.35fr] max-h-[92vh] overflow-y-auto">
              <button
                onClick={closeBookingModal}
                className="absolute top-5 right-5 z-20 w-11 h-11 rounded-2xl bg-white/80 border border-luxury-black/5 shadow-sm hover:bg-luxury-gray transition-colors text-luxury-black/45 hover:text-luxury-black flex items-center justify-center"
                aria-label="Close booking modal"
              >
                <X size={19} />
              </button>

              <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-luxury-black p-9 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.48),transparent_34%),radial-gradient(circle_at_85%_75%,rgba(79,70,229,0.35),transparent_34%)]" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl flex items-center justify-center mb-7">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45 mb-3">
                    Concierge Booking
                  </p>
                  <h2 className="text-4xl font-display font-black leading-tight tracking-tight">
                    Schedule your private property experience.
                  </h2>
                  <p className="mt-4 text-sm text-white/55 leading-relaxed">
                    Choose a visit style, pick your preferred slot, and our advisor will handle the coordination.
                  </p>
                </div>

                <div className="relative space-y-3">
                  {[
                    { icon: ShieldCheck, label: "Verified advisor coordination" },
                    { icon: Clock, label: "Fast slot confirmation" },
                    { icon: Video, label: "Physical or live video walkthrough" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-white/8 border border-white/10 px-4 py-3 backdrop-blur-xl">
                      <item.icon size={16} className="text-white/80" />
                      <span className="text-xs font-bold text-white/75">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="mb-8 pr-12">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-luxury-purple mb-2">
                    Book Appointment
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-display font-black text-luxury-black tracking-tight">
                    Book a Property Visit
                  </h2>
                  <p className="text-sm text-luxury-black/45 mt-2">
                    Share your details and preferred timing. We will arrange everything.
                  </p>
                </div>

                <div className="space-y-7">
                {/* Visit type */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-luxury-black/40 mb-3">Visit Type</p>
                  <div className="grid grid-cols-2 gap-3">
                    {VISIT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setVisitType(type.id)}
                        className={cn(
                          "relative min-h-32 p-5 rounded-[1.35rem] border text-left transition-all overflow-hidden",
                          visitType === type.id
                            ? "border-luxury-purple bg-gradient-to-br from-luxury-purple/10 to-indigo-50 shadow-lg shadow-luxury-purple/10"
                            : "border-luxury-black/10 bg-white hover:border-luxury-purple/35 hover:bg-luxury-purple/3"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className={cn(
                            "w-11 h-11 rounded-2xl flex items-center justify-center transition-colors",
                            visitType === type.id ? "bg-luxury-purple text-white" : "bg-luxury-gray text-luxury-purple"
                          )}>
                            <type.icon size={18} />
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mt-1",
                            visitType === type.id ? "border-luxury-purple" : "border-luxury-black/20"
                          )}>
                            {visitType === type.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-luxury-purple" />
                            )}
                          </div>
                        </div>
                        <p className={cn("mt-4 text-base font-black", visitType === type.id ? "text-luxury-purple" : "text-luxury-black")}>
                          {type.label}
                        </p>
                        <p className="text-xs text-luxury-black/45 mt-1 leading-snug">{type.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-luxury-black/40 mb-3">Date & Time</p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="p-5 rounded-[1.35rem] border border-luxury-black/10 bg-white focus-within:border-luxury-purple focus-within:shadow-lg focus-within:shadow-luxury-purple/8 transition-all">
                      <p className="text-[10px] font-bold text-luxury-black/40 mb-1 flex items-center gap-1.5">
                        <Calendar size={11} /> Date
                      </p>
                      <input type="date" className="w-full bg-transparent text-base text-luxury-black focus:outline-none" />
                    </label>
                    <label className="p-5 rounded-[1.35rem] border border-luxury-black/10 bg-white focus-within:border-luxury-purple focus-within:shadow-lg focus-within:shadow-luxury-purple/8 transition-all">
                      <p className="text-[10px] font-bold text-luxury-black/40 mb-1 flex items-center gap-1.5">
                        <Clock size={11} /> Time
                      </p>
                      <input type="time" className="w-full bg-transparent text-base text-luxury-black focus:outline-none" />
                    </label>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-luxury-black/40 mb-3">Your Details</p>
                  <div className="space-y-3">
                    <label className="flex items-center gap-4 p-5 rounded-[1.35rem] border border-luxury-black/10 bg-white focus-within:border-luxury-purple focus-within:shadow-lg focus-within:shadow-luxury-purple/8 transition-all">
                      <User size={16} className="text-luxury-purple shrink-0" />
                      <input type="text" placeholder="Full Name" className="bg-transparent flex-1 text-base text-luxury-black focus:outline-none placeholder:text-luxury-black/25" autoCorrect="on" autoCapitalize="words" />
                    </label>
                    <label className="flex items-center gap-4 p-5 rounded-[1.35rem] border border-luxury-black/10 bg-white focus-within:border-luxury-purple focus-within:shadow-lg focus-within:shadow-luxury-purple/8 transition-all">
                      <Phone size={16} className="text-luxury-purple shrink-0" />
                      <input type="tel" placeholder="Phone Number" className="bg-transparent flex-1 text-base text-luxury-black focus:outline-none placeholder:text-luxury-black/25" inputMode="numeric" autoCorrect="off" autoCapitalize="none" />
                    </label>
                  </div>
                </div>

                {/* Note */}
                <label className="flex items-start gap-4 p-5 rounded-[1.35rem] border border-luxury-black/10 bg-white focus-within:border-luxury-purple focus-within:shadow-lg focus-within:shadow-luxury-purple/8 transition-all">
                  <MessageSquareText size={16} className="text-luxury-purple shrink-0 mt-1" />
                  <textarea
                    placeholder="Any specific requests for the agent? (optional)"
                    className="w-full h-24 bg-transparent text-base text-luxury-black focus:outline-none resize-none placeholder:text-luxury-black/25"
                    autoCorrect="on"
                    autoCapitalize="sentences"
                  />
                </label>
              </div>

              <div className="mt-9 space-y-3">
                <Button
                  variant="premium"
                  className="w-full h-15 rounded-[1.35rem] text-sm font-black tracking-wider shadow-xl shadow-luxury-purple/25"
                  onClick={handleSubmit}
                >
                  Confirm Visit Booking
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-luxury-black/30 uppercase tracking-widest">
                  <ShieldCheck size={11} className="text-luxury-purple" /> Your information is kept private
                </p>
              </div>
              </div>
            </div>
          )}

          <div className="h-1 w-full bg-luxury-purple/10">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 0.9 }}
              className="h-full bg-luxury-purple"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
