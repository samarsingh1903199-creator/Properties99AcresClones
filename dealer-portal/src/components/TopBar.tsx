import { Bell, Search } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export function TopBar() {
  const { user } = useAuthStore();

  return (
    <header className="h-14 bg-white border-b border-[rgba(91,33,182,0.06)] flex items-center px-6 gap-4 shrink-0"
      style={{ boxShadow: "0 2px 12px -4px rgba(91,33,182,0.06)" }}>

      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          placeholder="Search properties…"
          className="dp-input pl-9"
          style={{ paddingTop: "0.4rem", paddingBottom: "0.4rem", borderRadius: "0.75rem" }}
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Bell */}
        <button className="relative p-2 rounded-xl text-[#111111]/30 hover:text-[#5b21b6] hover:bg-[#5b21b6]/5 border border-transparent hover:border-[rgba(91,33,182,0.1)] transition-all duration-200">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#5b21b6]" />
        </button>

        <div className="w-px h-5 bg-gray-100" />

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#5b21b6] flex items-center justify-center shadow-md"
            style={{ boxShadow: "0 2px 8px -2px rgba(91,33,182,0.4)" }}>
            <span className="text-xs font-black text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-semibold text-[#111111] hidden md:block">
            {user?.name?.split(" ")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
