import { NavLink, useNavigate } from "react-router-dom";
import {
  Building2, LayoutDashboard, Home, MessageSquare,
  BarChart3, User, LogOut, ShieldCheck, Tag,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { ROUTES } from "../constants/routes";

const NAV = [
  { to: ROUTES.DASHBOARD,  icon: LayoutDashboard, label: "Dashboard"     },
  { to: ROUTES.PROPERTIES, icon: Home,             label: "My Properties" },
  { to: ROUTES.CATEGORIES, icon: Tag,              label: "Categories"    },
  { to: ROUTES.INQUIRIES,  icon: MessageSquare,    label: "Inquiries"     },
  { to: ROUTES.ANALYTICS,  icon: BarChart3,        label: "Analytics"     },
  { to: ROUTES.PROFILE,    icon: User,             label: "Profile"       },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-[240px] shrink-0 flex flex-col bg-white border-r border-[rgba(91,33,182,0.06)]"
      style={{ boxShadow: "2px 0 20px -8px rgba(91,33,182,0.08)" }}>

      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[rgba(91,33,182,0.06)]">
        <div className="w-9 h-9 rounded-xl bg-[#5b21b6] flex items-center justify-center shadow-lg"
          style={{ boxShadow: "0 4px 14px -4px rgba(91,33,182,0.4)" }}>
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-black text-sm text-[#111111] tracking-tight leading-none"
            style={{ fontFamily: "Outfit, sans-serif" }}>VEX</p>
          <p className="text-[10px] text-[#111111]/40 mt-0.5 font-medium">Dealer Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-[#5b21b6] text-white shadow-lg"
                  : "text-[#111111]/50 hover:text-[#111111] hover:bg-[#f8f9fa]"
              }`
            }
            style={({ isActive }) =>
              isActive ? { boxShadow: "0 4px 14px -4px rgba(91,33,182,0.4)" } : {}
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span style={{ fontFamily: "Inter, sans-serif" }}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 pt-3 border-t border-[rgba(91,33,182,0.06)]">
        {user?.verified && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 mb-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-emerald-700 capitalize">
              Verified {user.role}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-[#5b21b6] flex items-center justify-center shrink-0 shadow-md">
            <span className="text-xs font-black text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#111111] truncate">{user?.name}</p>
            <p className="text-[10px] text-[#111111]/40 capitalize truncate font-medium">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate(ROUTES.LOGIN); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-[#111111]/40 font-semibold hover:text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
