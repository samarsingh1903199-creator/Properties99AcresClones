import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { propertiesApi } from "../../services/api";
import type { GenerateDescriptionInput } from "../../lib/generateDescription";

const lbl = "block text-xs font-black text-[#0c2417]/50 uppercase tracking-wide mb-1.5";

interface AiDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  token: string | null;
  getPayload: () => GenerateDescriptionInput;
  onError?: (message: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export function AiDescriptionField({
  value,
  onChange,
  token,
  getPayload,
  onError,
  placeholder = "Describe the property, nearby facilities, highlights…",
  rows = 4,
  disabled = false,
}: AiDescriptionFieldProps) {
  const [generating, setGenerating] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);

  const handleGenerate = async () => {
    if (!token) {
      onError?.("Not authenticated.");
      return;
    }

    const payload = getPayload();
    if (!payload.title?.trim()) {
      onError?.("Enter a property title before generating a description.");
      return;
    }
    if (!payload.city?.trim()) {
      onError?.("Enter a city before generating a description.");
      return;
    }

    setGenerating(true);
    setSuccessFlash(false);
    try {
      const res = await propertiesApi.generateDescription(token, payload);
      onChange(res.data.description);
      setSuccessFlash(true);
      setTimeout(() => setSuccessFlash(false), 2500);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Failed to generate description");
    } finally {
      setGenerating(false);
    }
  };

  const tooltip = generating
    ? "Generating…"
    : successFlash
      ? "Description ready"
      : value.trim()
        ? "Regenerate with AI"
        : "Generate with AI";

  return (
    <div>
      <label className={lbl}>Description</label>
      <textarea
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || generating}
        className="dp-input resize-none disabled:opacity-70 w-full"
        style={{ borderRadius: "0.875rem" }}
      />

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={disabled || generating || !token}
          title={tooltip}
          aria-label={tooltip}
          className="ai-generate-btn ai-generate-btn-sm group relative disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="ai-generate-ring ai-generate-ring-sm" aria-hidden />
          <span className="ai-generate-glow ai-generate-glow-sm" aria-hidden />
          <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#166534] to-[#14532d] text-white shadow-md shadow-[#166534]/20 transition-transform group-hover:scale-105 group-active:scale-95">
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : successFlash ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 ai-sparkle-icon" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
