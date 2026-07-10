import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2, LayoutDashboard, Home, MessageSquare,
  BarChart3, User, LogOut, ShieldCheck, Tag, Sparkles,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { ROUTES } from "../constants/routes";
import { isSidebarNavActive } from "../lib/navMatch";

const NAV = [
  { to: ROUTES.DASHBOARD,  icon: LayoutDashboard, label: "Dashboard"     },
  { to: ROUTES.PROPERTIES, icon: Home,             label: "My Properties" },
  { to: ROUTES.HIGHLIGHTED_PROPERTIES, icon: Sparkles, label: "Highlighted" },
  { to: ROUTES.CATEGORIES, icon: Tag,              label: "Categories"    },
  { to: ROUTES.INQUIRIES,  icon: MessageSquare,    label: "Inquiries"     },
  { to: ROUTES.ANALYTICS,  icon: BarChart3,        label: "Analytics"     },
  { to: ROUTES.PROFILE,    icon: User,             label: "Profile"       },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <aside className="dp-sidebar w-[240px] shrink-0 flex flex-col shadow-xl">

      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #14532d, #15803d)",
            boxShadow: "0 4px 14px -4px rgba(22,101,52,0.6)",
          }}
        >
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm text-white tracking-tight leading-none font-sans">
            Aetheria
          </p>
          <p className="text-[10px] text-white/45 mt-0.5 font-medium font-sans">Dealer Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = isSidebarNavActive(location.pathname, to);
          return (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 font-sans ${
              active
                ? "bg-accent text-on-primary shadow-lg"
                : "text-white/55 hover:text-white hover:bg-white/8"
            }`}
            style={active ? { boxShadow: "0 4px 14px -4px rgba(22,101,52,0.5)" } : {}}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 pt-3 border-t border-white/10">
        {user?.verified && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 mb-3 rounded-xl bg-emerald-500/15 border border-emerald-400/25">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-emerald-300 capitalize font-sans">
              Verified {user.role}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #166534, #15803d)" }}
          >
            <span className="text-xs font-bold text-white font-sans">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate font-sans">{user?.name}</p>
            <p className="text-[10px] text-white/40 capitalize truncate font-sans">{user?.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { logout(); navigate(ROUTES.LOGIN); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-white/45 font-medium hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 font-sans"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
