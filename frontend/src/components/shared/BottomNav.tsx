import { Home, Search, Heart, User, PlusCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/src/constants/routes";
import { cn } from "@/src/lib/utils";

export const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: ROUTES.HOME },
    { icon: Search, label: "Search", href: ROUTES.SEARCH },
    { icon: PlusCircle, label: "Post", href: ROUTES.DASHBOARD.POST, primary: true },
    { icon: Heart, label: "Saved", href: ROUTES.DASHBOARD.SAVED },
    { icon: User, label: "Profile", href: ROUTES.DASHBOARD.PROFILE },
  ];

  const handleHomeClick = (href: string) => {
    if (href === ROUTES.HOME && location.pathname === ROUTES.HOME) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
        <div className="bg-[var(--bg-main)]/80 backdrop-blur-2xl border-t border-[var(--glass-border)] px-6 py-3 flex items-center justify-between shadow-[0_-8px_20px_rgba(0,0,0,0.1)]">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => handleHomeClick(item.href)}
                    className={cn(
                        "flex flex-col items-center gap-1 transition-all",
                        item.primary ? "relative -top-6" : "",
                        location.pathname === item.href ? "text-luxury-purple" : "text-[var(--text-main)]/40"
                    )}
                >
                    {item.primary ? (
                        <div className="w-14 h-14 premium-gradient rounded-full flex items-center justify-center shadow-lg text-white border-4 border-[var(--bg-main)]">
                            <item.icon size={28} />
                        </div>
                    ) : (
                        <>
                            <item.icon size={22} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </>
                    )}
                </Link>
            ))}
        </div>
    </div>
  );
};
