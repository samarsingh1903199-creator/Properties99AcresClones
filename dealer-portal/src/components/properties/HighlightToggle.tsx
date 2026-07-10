import { Sparkles, Loader2 } from "lucide-react";

interface HighlightToggleProps {
  isHighlighted?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  loading?: boolean;
  size?: "sm" | "md";
  showLabel?: boolean;
  onToggle: () => void;
}

export function HighlightToggle({
  isHighlighted,
  disabled,
  disabledReason,
  loading,
  size = "md",
  showLabel = false,
  onToggle,
}: HighlightToggleProps) {
  const active = !!isHighlighted;
  const title = disabled
    ? disabledReason ?? "Cannot highlight this property"
    : active
      ? "Remove from highlighted listings"
      : "Add to highlighted listings";

  const sizeClass =
    size === "sm"
      ? "p-2 rounded-xl"
      : showLabel
        ? "h-9 px-3 rounded-xl text-xs font-black uppercase tracking-wider"
        : "p-2 rounded-xl";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && !loading) onToggle();
      }}
      disabled={disabled || loading}
      title={title}
      className={`inline-flex items-center justify-center gap-1.5 border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 hover:border-amber-300"
          : "border-transparent text-[#0c2417]/30 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100"
      } ${sizeClass}`}
    >
      {loading ? (
        <Loader2 className={`${size === "sm" ? "w-4 h-4" : "w-3.5 h-3.5"} animate-spin shrink-0`} />
      ) : (
        <Sparkles className={`${size === "sm" ? "w-4 h-4" : "w-3.5 h-3.5"} shrink-0 ${active ? "fill-amber-400/30" : ""}`} />
      )}
      {showLabel && (
        <span>{active ? "Highlighted" : "Highlight"}</span>
      )}
    </button>
  );
}

export function canHighlightProperty(status: string) {
  return status === "active" || status === "pending";
}
