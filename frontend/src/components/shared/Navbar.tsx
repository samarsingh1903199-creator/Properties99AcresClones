import { Search, User, Heart, Menu, X, Landmark, Bell } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/Button";
import { ROUTES } from "@/src/constants/routes";
import { cn } from "@/src/lib/utils";
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

  // Home page has its own built-in navbar inside the hero section
  if (location.pathname === "/") return null;

  const navLinks = [
    { label: "Marketplace", href: ROUTES.HOME },
    { label: "New Projects", href: ROUTES.PROPERTIES },
    { label: "Specialists", href: ROUTES.AGENTS },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-3 px-6 md:px-12",
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-luxury-purple/5 shadow-premium"
          : "bg-transparent"
      )}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 bg-luxury-purple rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <Landmark className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-display font-black tracking-tighter text-luxury-black hidden sm:block">
            AETHERIA
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex items-center flex-1 max-w-md relative group">
          <Search className="absolute left-4 w-4 h-4 text-luxury-black/30 group-focus-within:text-luxury-purple transition-colors" />
          <input
            type="text"
            placeholder="Search luxury estates..."
            className="w-full bg-luxury-gray border border-transparent rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:bg-white focus:border-luxury-purple/30 transition-all placeholder:text-luxury-black/20 font-medium"
            autoCorrect="on"
            autoCapitalize="sentences"
          />
        </div>

        {/* Desktop Links & Actions */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex items-center gap-8 mr-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => {
                  if (link.href === ROUTES.HOME && location.pathname === ROUTES.HOME) {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest hover:text-luxury-purple transition-colors",
                  location.pathname === link.href ? "text-luxury-purple" : "text-luxury-black/40"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
             {/* Saved */}
             <Button variant="ghost" size="icon" className="text-luxury-black/40 relative hover:text-luxury-purple" asChild>
              <Link to={ROUTES.DASHBOARD.SAVED}>
                <Heart className={cn("w-5 h-5", savedCount > 0 && "text-red-500 fill-current")} />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {savedCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Notifications */}
            <div className="relative">
                <Button variant="ghost" size="icon" className="text-luxury-black/40 hover:text-luxury-purple">
                    <Bell className="w-5 h-5" />
                </Button>
                <span className="absolute top-2 right-3 w-2 h-2 bg-luxury-purple rounded-full border-2 border-white" />
            </div>

            <div className="h-6 w-[1px] bg-luxury-purple/10 hidden sm:block mx-1" />

            {/* User Profile */}
            {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  <Link to={ROUTES.DASHBOARD.PROFILE} className="flex items-center gap-3 group">
                      <div className="hidden sm:block text-right leading-none">
                          <p className="text-[10px] font-black uppercase tracking-widest text-luxury-black/20 mb-1 leading-none">Profile</p>
                          <p className="text-sm font-bold text-luxury-black group-hover:text-luxury-purple transition-colors">{user.name.split(' ')[0]}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-luxury-purple/5 border border-luxury-purple/10 flex items-center justify-center p-0.5 overflow-hidden group-hover:border-luxury-purple/30 transition-all relative shrink-0">
                          <img 
                              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                              alt="Avatar" 
                              className="w-full h-full rounded-lg object-cover"
                          />
                          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                      </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-[9px] font-black uppercase tracking-wider text-luxury-black/30 hover:text-red-500 hidden sm:block"
                  >
                    Logout
                  </Button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                  <Link to={ROUTES.AUTH.LOGIN}>
                      <Button variant="premium" size="sm" className="rounded-xl px-4 sm:px-6 h-10 text-[10px] font-black tracking-widest">
                          SIGN IN
                      </Button>
                  </Link>
                  <Link to={ROUTES.AUTH.SIGNUP} className="hidden sm:block">
                    <Button variant="outline" size="sm" className="rounded-xl px-5 h-10 text-[10px] font-black tracking-widest border-luxury-purple/10">
                        JOIN
                    </Button>
                  </Link>
                </div>
            )}
          </div>

          <button
            className="md:hidden text-luxury-black p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white backdrop-blur-2xl border-b border-luxury-purple/5 p-8 md:hidden shadow-2xl rounded-b-[2rem]"
          >
            <div className="flex flex-col gap-6">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-luxury-gray border border-luxury-purple/5">
                  <img 
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                      alt="Avatar" 
                      className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm"
                  />
                  <div>
                      <p className="font-bold text-luxury-black">{user.name}</p>
                      <p className="text-[10px] text-luxury-black/40 uppercase tracking-widest font-black">Elite Member</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-luxury-gray border border-luxury-purple/5 opacity-60">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-luxury-purple/5 flex items-center justify-center text-luxury-black/20">
                    <User size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-luxury-black">Guest Identity</p>
                    <p className="text-[10px] text-luxury-black/40 uppercase tracking-widest font-black">Not Synchronized</p>
                  </div>
                </div>
              )}
              <div className="space-y-4 pt-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block text-lg font-bold text-luxury-black hover:text-luxury-purple transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <hr className="border-luxury-purple/5" />
              <div className="grid grid-cols-2 gap-4">
                  {isAuthenticated ? (
                    <>
                      <Button variant="outline" className="w-full text-[10px] uppercase tracking-widest font-black" asChild onClick={() => setIsMobileMenuOpen(false)}>
                        <Link to={ROUTES.DASHBOARD.PROFILE}>Profile</Link>
                      </Button>
                      <Button
                        variant="premium"
                        className="w-full text-[10px] uppercase tracking-widest font-black"
                        onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                      >
                        LOGOUT
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full text-[10px] uppercase tracking-widest font-black" asChild onClick={() => setIsMobileMenuOpen(false)}>
                        <Link to={ROUTES.AUTH.LOGIN}>Login</Link>
                      </Button>
                      <Button variant="premium" className="w-full text-[10px] uppercase tracking-widest font-black" asChild onClick={() => setIsMobileMenuOpen(false)}>
                        <Link to={ROUTES.AUTH.SIGNUP}>Join</Link>
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
