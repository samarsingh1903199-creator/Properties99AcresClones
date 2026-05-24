import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Bell, User, LogOut, UserCircle2 } from "lucide-react";
import { ROUTES } from "@/src/constants/routes";
import { useWishlistStore } from "@/src/store/useWishlistStore";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useHomeCategoryStore } from "@/src/store/useHomeCategoryStore";
import type { HomeCategoryId } from "@/src/components/home/CategoryTabs";

const NAV_ITEMS: { label: string; category: HomeCategoryId | null; scrollTo?: string }[] = [
  { label: "For Rent",        category: "rent" },
  { label: "For Sale",        category: "sale" },
  { label: "Loan Calculator", category: null, scrollTo: "loan-calculator" },
];

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4";

const HEADING_TEXT = "Shaping tomorrow\nwith vision and action.";

/* ─────────────────────────────────────────────────────────────
   FadeIn — wraps children with a configurable opacity fade-in

   
───────────────────────────────────────────────────────────── */
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

const FadeIn = ({ children, delay = 0, duration = 1000, className = "" }: FadeInProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{ opacity: visible ? 1 : 0, transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   AnimatedHeading — character-by-character entrance animation
───────────────────────────────────────────────────────────── */
interface AnimatedHeadingProps {
  text: string;
  initialDelay?: number;
  charDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

const AnimatedHeading = ({
  text,
  initialDelay = 200,
  charDelay = 30,
  className = "",
  style,
}: AnimatedHeadingProps) => {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), initialDelay);
    return () => clearTimeout(t);
  }, [initialDelay]);

  const lines = text.split("\n");

  return (
    <h1 className={className} style={style} aria-label={text.replace(/\n/g, " ")}>
      {lines.map((line, lineIdx) => {
        const lineStart = lines
          .slice(0, lineIdx)
          .reduce((acc, l) => acc + l.length, 0);

        return (
          <span key={lineIdx} className="block">
            {line.split("").map((char, charIdx) => {
              const globalIdx = lineStart + charIdx;
              const delay = globalIdx * charDelay;
              const isSpace = char === " ";

              return (
                <span
                  key={charIdx}
                  className="inline-block"
                  style={{
                    opacity: started ? 1 : 0,
                    transform: started ? "translateX(0)" : "translateX(-18px)",
                    transition: `opacity 500ms ease ${delay}ms, transform 500ms ease ${delay}ms`,
                    whiteSpace: isSpace ? "pre" : undefined,
                  }}
                >
                  {isSpace ? " " : char}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
};

/* ─────────────────────────────────────────────────────────────
   Hero
───────────────────────────────────────────────────────────── */
const scrollToSection = (
  category: HomeCategoryId | null,
  setPendingCategory: (c: HomeCategoryId | null) => void,
  scrollTo?: string
) => {
  if (category) setPendingCategory(category);
  const targetId = scrollTo ?? "properties-listing";
  const el = document.getElementById(targetId);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { savedPropertyIds } = useWishlistStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { setPendingCategory } = useHomeCategoryStore();
  const navigate = useNavigate();
  const savedCount = savedPropertyIds.length;
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.play().catch(() => { /* autoplay policy — silently ignore */ });
    }
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-black">

      {/* ── Video — raw, no overlay whatsoever ── */}
      <video
        ref={videoRef}
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* ── Fixed Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 liquid-glass px-6 md:px-12 lg:px-16 py-3 flex items-center justify-between">
        <span className="text-2xl font-semibold tracking-tight text-white select-none">
          VEX
        </span>

        <div className="hidden md:flex items-center gap-1 overflow-x-auto hide-scrollbar">
          {NAV_ITEMS.map(({ label, category, scrollTo }) => (
            <button
              key={label}
              onClick={() => scrollToSection(category, setPendingCategory, scrollTo)}
              className={`whitespace-nowrap text-sm hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                label === "Loan Calculator"
                  ? "text-purple-300 border border-purple-400/30 hover:border-purple-400/60"
                  : "text-white/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {/* Liked Properties */}
          <Link to={ROUTES.DASHBOARD.SAVED} className="relative p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10">
            <Heart className={`w-5 h-5 ${savedCount > 0 ? "text-red-400 fill-current" : ""}`} />
            {savedCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-black/20">
                {savedCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <button className="relative p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full" />
          </button>

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Profile */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 group focus:outline-none"
              >
                <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/20 group-hover:border-white/50 transition-all relative">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-black/20" />
                </div>
              </button>

              {profileOpen && (
                <>
                  {/* backdrop to close on outside click */}
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-48 rounded-xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-white text-sm font-bold truncate">{user.name}</p>
                      <p className="text-white/40 text-[10px] truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { setProfileOpen(false); navigate(ROUTES.DASHBOARD.PROFILE); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
                    >
                      <UserCircle2 size={15} /> Profile
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); logout(); navigate(ROUTES.AUTH.LOGIN); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium transition-colors"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to={ROUTES.AUTH.LOGIN}>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* ── All visible content above video ── */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 md:px-12 lg:px-16">

        {/* ── Hero body — pushes content to viewport bottom ── */}
        <div className="flex-1 flex flex-col justify-end pb-12 lg:pb-16">
          <div className="lg:grid lg:grid-cols-2 lg:items-end gap-8">

            {/* Left column — heading + sub + buttons */}
            <div>
              <AnimatedHeading
                text={HEADING_TEXT}
                initialDelay={200}
                charDelay={30}
                className="text-white font-normal mb-4 text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
                style={{ letterSpacing: "-0.04em" }}
              />

              <FadeIn delay={800} duration={1000}>
                <p className="text-base md:text-lg text-gray-300 mb-5">
                  We back visionaries and craft ventures that define what comes next.
                </p>
              </FadeIn>

              <FadeIn delay={1200} duration={1000}>
                <div className="flex flex-wrap gap-4">
                  <Link to={ROUTES.PROPERTIES}>
                    <button className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
                      Start a Chat
                    </button>
                  </Link>
                  <Link to={ROUTES.PROPERTIES}>
                    <button className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-all duration-200">
                      Explore Now
                    </button>
                  </Link>
                </div>
              </FadeIn>
            </div>

            {/* Right column — glass tag, bottom-right on lg */}
            <FadeIn
              delay={1400}
              duration={1000}
              className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0"
            >
              <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                <p className="text-lg md:text-xl lg:text-2xl font-light text-white">
                  Investing. Building. Advisory.
                </p>
              </div>
            </FadeIn>

          </div>
        </div>
      </div>
    </section>
  );
};
