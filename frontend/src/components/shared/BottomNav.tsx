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
      <div className="bg-canvas/95 backdrop-blur-md border-t border-hairline px-6 py-2.5 flex items-center justify-between shadow-elevated-4">
        {navItems.map((item) => {
          const active = location.pathname === item.href;
          return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => handleHomeClick(item.href)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 transition-colors min-w-[52px] outline-none",
              item.primary ? "relative -top-4" : "",
              active ? "text-accent" : "text-mute",
            )}
          >
            {item.primary ? (
              <div className="w-12 h-12 logo-gradient rounded-full flex items-center justify-center text-on-primary border-4 border-canvas-warm shadow-elevated-3">
                <item.icon size={22} />
              </div>
            ) : (
              <>
                <item.icon size={20} strokeWidth={active ? 2.25 : 1.75} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </Link>
          );
        })}
      </div>
    </div>
  );
};
