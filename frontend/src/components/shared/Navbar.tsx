import { Search, User, Heart, Menu, X, Landmark, Bell } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/Button";
import { ROUTES } from "@/src/constants/routes";
import { cn } from "@/src/lib/utils";
import { isMainNavActive } from "@/src/lib/navMatch";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useWishlistStore } from "@/src/store/useWishlistStore";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { savedPropertyIds, clearWishlist } = useWishlistStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearWishlist();
    navigate(ROUTES.HOME);
  };
  const location = useLocation();

  const savedCount = savedPropertyIds.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (location.pathname === "/") return null;

  const navLinks = [
    { label: "Marketplace", href: ROUTES.HOME },
    { label: "New Projects", href: ROUTES.PROPERTIES },
    { label: "Dealers", href: ROUTES.AGENTS },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "nav-bar shadow-elevated-2" : "bg-canvas/80 backdrop-blur-md border-b border-transparent"
      )}
    >
      <div className="max-w-[1400px] mx-auto h-16 px-6 md:px-12 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 logo-gradient rounded-md flex items-center justify-center shadow-sm">
            <Landmark className="text-on-primary w-4 h-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-ink hidden sm:block">
            Aetheria
          </span>
        </Link>

        <div className="hidden lg:flex items-center flex-1 max-w-md relative group mx-4">
          <Search className="absolute left-3.5 w-4 h-4 text-mute group-focus-within:text-ink transition-colors" />
          <input
            type="text"
            placeholder="Search properties, areas, cities…"
            className="form-input pl-10 w-full bg-canvas-soft border-hairline"
          />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-1 mr-2">
            {navLinks.map((link) => {
              const active = isMainNavActive(location.pathname, link.href);
              return (
              <Link
                key={link.href}
                to={link.href}
                onClick={(e) => {
                  if (link.href === ROUTES.HOME && location.pathname === ROUTES.HOME) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-sm px-3 py-1.5 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                  active
                    ? "text-accent bg-accent-soft font-medium"
                    : "text-body hover:text-accent hover:bg-accent-soft/50",
                )}
              >
                {link.label}
              </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="text-body relative" asChild>
              <Link to={ROUTES.DASHBOARD.SAVED}>
                <Heart className={cn("w-5 h-5", savedCount > 0 && "text-error fill-current")} />
                {savedCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-ink text-on-primary text-[9px] font-medium rounded-full flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="text-body relative">
              <Bell className="w-5 h-5" />
            </Button>

            <div className="h-5 w-px bg-hairline hidden sm:block mx-1" />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link to={ROUTES.DASHBOARD.PROFILE} className="flex items-center gap-2.5 group">
                  <div className="hidden sm:block text-right leading-tight">
                    <p className="text-caption-mono text-mute">Profile</p>
                    <p className="text-sm font-medium text-ink group-hover:text-link transition-colors">
                      {user.name.split(" ")[0]}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-md border border-hairline overflow-hidden shrink-0">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-mute hover:text-error hidden sm:inline-flex"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to={ROUTES.AUTH.LOGIN}>
                  <Button variant="outline" size="nav">Log in</Button>
                </Link>
                <Link to={ROUTES.AUTH.SIGNUP} className="hidden sm:block">
                  <Button variant="default" size="nav">Sign up</Button>
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden text-ink p-2 rounded-md hover:bg-canvas-soft-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute top-full left-0 right-0 bg-canvas border-b border-hairline p-6 md:hidden shadow-elevated-5"
          >
            <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-canvas-soft border border-hairline">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt="Avatar"
                    className="w-12 h-12 rounded-md border border-hairline"
                  />
                  <div>
                    <p className="font-medium text-ink">{user.name}</p>
                    <p className="text-caption-mono text-mute">Member</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-canvas-soft border border-hairline">
                  <div className="w-12 h-12 rounded-md bg-canvas border border-hairline flex items-center justify-center text-mute">
                    <User size={22} />
                  </div>
                  <div>
                    <p className="font-medium text-ink">Guest</p>
                    <p className="text-caption-mono text-mute">Sign in to save properties</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {navLinks.map((link) => {
                  const active = isMainNavActive(location.pathname, link.href);
                  return (
                  <Link
                    key={link.href}
                    to={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block text-base font-medium py-2 transition-colors",
                      active ? "text-accent font-semibold" : "text-ink hover:text-link",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                  );
                })}
              </div>

              <div className="border-t border-hairline pt-4 grid grid-cols-2 gap-3">
                {isAuthenticated ? (
                  <>
                    <Button variant="outline" className="w-full" asChild onClick={() => setIsMobileMenuOpen(false)}>
                      <Link to={ROUTES.DASHBOARD.PROFILE}>Profile</Link>
                    </Button>
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild onClick={() => setIsMobileMenuOpen(false)}>
                      <Link to={ROUTES.AUTH.LOGIN}>Log in</Link>
                    </Button>
                    <Button variant="default" className="w-full" asChild onClick={() => setIsMobileMenuOpen(false)}>
                      <Link to={ROUTES.AUTH.SIGNUP}>Sign up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
