import { useMemo } from "react";
import { generatePropertyTitleSuggestions } from "../../lib/propertyTitleSuggestions";

const lbl = "block text-xs font-black text-[#0c2417]/50 uppercase tracking-wide mb-1.5";

interface PropertyTitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  listingType: string;
  listingCategoryName?: string;
  bedrooms: string | number;
  propertyTypeSlug: string;
  propertyTypeName?: string;
  placeholder?: string;
  required?: boolean;
}

export function PropertyTitleField({
  value,
  onChange,
  listingType,
  listingCategoryName,
  bedrooms,
  propertyTypeSlug,
  propertyTypeName,
  placeholder = "e.g. 2 BHK Flat for Rent",
  required = true,
}: PropertyTitleFieldProps) {
  const suggestions = useMemo(
    () => generatePropertyTitleSuggestions({
      listingType,
      listingCategoryName,
      bedrooms,
      propertyTypeSlug,
      propertyTypeName,
    }),
    [listingType, listingCategoryName, bedrooms, propertyTypeSlug, propertyTypeName],
  );

  return (
    <div>
      <label className={lbl}>Property Title</label>
      <input
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="dp-input"
        style={{ borderRadius: "0.875rem" }}
      />

      {suggestions.length > 0 && (
        <div className="mt-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#0c2417]/35 mb-2">
            Suggested titles
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(suggestion => {
              const active = value.trim().toLowerCase() === suggestion.toLowerCase();
              return (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onChange(suggestion)}
                  className={[
                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                    active
                      ? "bg-[#166534] text-white border-[#166534] shadow-sm shadow-[#166534]/20"
                      : "bg-[#f4f9f6] text-[#0c2417]/70 border-[rgba(22,101,52,0.12)] hover:border-[#166534]/35 hover:text-[#166534] hover:bg-[#dcfce7]/40",
                  ].join(" ")}
                >
                  {suggestion}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
