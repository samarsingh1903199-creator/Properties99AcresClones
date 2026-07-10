import { Bell, Search } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export function TopBar() {
  const { user } = useAuthStore();

  return (
    <header
      className="h-14 bg-canvas border-b border-hairline flex items-center px-6 gap-4 shrink-0"
      style={{ boxShadow: "0 2px 12px -4px rgba(12,36,23,0.06)" }}
    >
      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
        <input
          placeholder="Search properties…"
          className="dp-input pl-9"
          style={{ paddingTop: "0.4rem", paddingBottom: "0.4rem", borderRadius: "0.75rem" }}
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button
          type="button"
          className="relative p-2 rounded-xl text-mute hover:text-accent hover:bg-accent-soft border border-transparent hover:border-accent/15 transition-all duration-200"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
        </button>

        <div className="w-px h-5 bg-hairline" />

        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #14532d, #166534)",
              boxShadow: "0 2px 8px -2px rgba(22,101,52,0.35)",
            }}
          >
            <span className="text-xs font-bold text-white font-sans">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-semibold text-ink hidden md:block font-sans">
            {user?.name?.split(" ")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
