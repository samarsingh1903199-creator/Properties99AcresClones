import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Bell, LogOut, UserCircle2, Building2, Menu, X,
  Sparkles, ChevronRight, Phone,
} from "lucide-react";
import { ROUTES } from "@/src/constants/routes";
import { useWishlistStore } from "@/src/store/useWishlistStore";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useHomeCategoryStore } from "@/src/store/useHomeCategoryStore";
import type { HomeCategoryId } from "@/src/components/home/CategoryTabs";
import { cn } from "@/src/lib/utils";

type NavItem = {
  label: string;
  category?: HomeCategoryId;
  scrollTo?: string;
  href?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Rent", category: "rent" },
  { label: "Buy", category: "sale" },
  { label: "Projects", href: "/projects" },
  { label: "Dealers", href: ROUTES.AGENTS },
  { label: "How it works", scrollTo: "how-it-works" },
  { label: "Home loans", scrollTo: "loan-calculator" },
];

const scrollToSection = (
  item: NavItem,
  setPendingCategory: (c: HomeCategoryId | null) => void,
  navigate: (path: string) => void,
) => {
  if (item.href) {
    navigate(item.href);
    return;
  }
  if (item.category) setPendingCategory(item.category);
  document.getElementById(item.scrollTo ?? "properties-listing")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const HomeHeader = () => {
  const navigate = useNavigate();
  const { savedPropertyIds } = useWishlistStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { setPendingCategory } = useHomeCategoryStore();
  const savedCount = savedPropertyIds.length;
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNav = (item: NavItem) => {
    setMobileOpen(false);
    scrollToSection(item, setPendingCategory, navigate);
  };

  return (
    <header className="home-header sticky top-0 z-50">
      {/* Announcement strip */}
      <div className="home-header-announcement">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-center gap-2 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>2,000+ verified listings across 50+ cities — updated daily</span>
          <button
            type="button"
            onClick={() => handleNav({ label: "Rent", category: "rent" })}
            className="hidden sm:inline-flex items-center gap-0.5 ml-2 underline-offset-2 hover:underline"
          >
            Browse now <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className={cn(
          "home-header-nav transition-all duration-300",
          scrolled && "home-header-nav-scrolled",
        )}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-[4.25rem] flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="home-header-logo shrink-0 group">
            <span className="home-header-logo-mark">
              <Building2 className="w-4 h-4" />
            </span>
            <span className="hidden sm:block">
              <span className="block text-base font-semibold text-accent-deep leading-tight font-sans">Aetheria</span>
              <span className="block text-[10px] text-mute font-medium tracking-wide font-sans">Premium property search</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center max-w-2xl mx-auto">
            {NAV_ITEMS.map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNav(item)}
                className="home-header-link font-sans"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <a
              href="tel:+919876543210"
              className="hidden xl:inline-flex items-center gap-1.5 text-xs font-medium text-body hover:text-accent px-3 py-2 rounded-full hover:bg-accent-soft/60 transition-colors font-sans"
            >
              <Phone className="w-3.5 h-3.5" />
              Support
            </a>

            <Link
              to={ROUTES.DASHBOARD.SAVED}
              className="relative p-2.5 text-body hover:text-accent rounded-xl hover:bg-accent-soft/50 transition-colors"
              aria-label="Saved properties"
            >
              <Heart className={cn("w-5 h-5", savedCount > 0 && "text-error fill-current")} />
              {savedCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-accent text-on-primary text-[9px] font-bold rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="relative p-2.5 text-body hover:text-accent rounded-xl hover:bg-accent-soft/50 transition-colors hidden sm:flex"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-hairline mx-0.5 hidden sm:block" />

            {isAuthenticated && user ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setProfileOpen(o => !o)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-accent-soft/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-accent/20">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-ink max-w-[5rem] truncate hidden md:block font-sans">
                    {user.name.split(" ")[0]}
                  </span>
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-12 z-50 w-52 rounded-xl bg-canvas border border-hairline shadow-elevated-5 overflow-hidden">
                      <div className="px-4 py-3 border-b border-hairline bg-accent-soft/30">
                        <p className="text-sm font-semibold text-accent-deep truncate font-sans">{user.name}</p>
                        <p className="text-caption-mono text-mute truncate">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setProfileOpen(false); navigate(ROUTES.DASHBOARD.PROFILE); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-body hover:text-accent hover:bg-accent-soft/40 text-sm transition-colors font-sans"
                      >
                        <UserCircle2 size={15} /> Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => { setProfileOpen(false); logout(); navigate(ROUTES.AUTH.LOGIN); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-canvas-soft text-sm transition-colors font-sans"
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to={ROUTES.AUTH.LOGIN}>
                  <button type="button" className="btn-nav-outline">Log in</button>
                </Link>
                <Link to={ROUTES.AUTH.SIGNUP}>
                  <button type="button" className="btn-nav-cta shadow-sm">Sign up</button>
                </Link>
              </div>
            )}

            <button
              type="button"
              className="lg:hidden p-2.5 rounded-xl text-ink hover:bg-accent-soft/50 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-canvas shadow-elevated-5 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
                <span className="text-base font-semibold text-accent-deep font-sans">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl hover:bg-canvas-soft transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNav(item)}
                    className="w-full text-left px-4 py-3.5 rounded-xl text-base font-medium text-ink hover:bg-accent-soft/60 hover:text-accent-deep transition-colors font-sans"
                  >
                    {item.label}
                  </button>
                ))}
                <Link
                  to={ROUTES.PROPERTIES}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-left px-4 py-3.5 rounded-xl text-base font-medium text-accent hover:bg-accent-soft/60 transition-colors font-sans"
                >
                  All properties
                </Link>
              </div>

              <div className="p-4 border-t border-hairline space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => { setMobileOpen(false); navigate(ROUTES.DASHBOARD.PROFILE); }}
                      className="w-full btn-secondary"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMobileOpen(false); logout(); navigate(ROUTES.AUTH.LOGIN); }}
                      className="w-full py-3 rounded-full border border-hairline text-sm font-medium text-error"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to={ROUTES.AUTH.LOGIN} onClick={() => setMobileOpen(false)} className="block">
                      <button type="button" className="w-full btn-secondary">Log in</button>
                    </Link>
                    <Link to={ROUTES.AUTH.SIGNUP} onClick={() => setMobileOpen(false)} className="block">
                      <button type="button" className="w-full btn-primary">Sign up free</button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};
