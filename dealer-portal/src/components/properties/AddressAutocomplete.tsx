/// <reference types="vite/client" />
import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MapPin, Loader2, AlertCircle } from "lucide-react";

export interface ParsedAddress {
  country:    string;
  state:      string;
  city:       string;
  locality:   string;
  street:     string;
  postalCode: string;
  lat:        number;
  lng:        number;
}

interface Props {
  onSelect: (addr: ParsedAddress) => void;
}

/* ── Extract a named component from address_components ── */
function getComponent(
  components: google.maps.GeocoderAddressComponent[],
  types: string[],
  nameType: "long_name" | "short_name" = "long_name"
): string {
  const c = components.find(comp => types.some(t => comp.types.includes(t)));
  return c ? c[nameType] : "";
}

/* ── Parse a Google Place result into our address shape ── */
function parsePlaceResult(place: google.maps.places.PlaceResult): ParsedAddress {
  const comps = place.address_components ?? [];

  const streetNumber = getComponent(comps, ["street_number"]);
  const route        = getComponent(comps, ["route"]);
  const street       = [streetNumber, route].filter(Boolean).join(" ");

  const locality =
    getComponent(comps, ["sublocality_level_1", "sublocality", "neighborhood"]) ||
    getComponent(comps, ["sublocality_level_2"]);

  const city =
    getComponent(comps, ["locality"]) ||
    getComponent(comps, ["administrative_area_level_2", "administrative_area_level_3"]);

  const state       = getComponent(comps, ["administrative_area_level_1"]);
  const country     = getComponent(comps, ["country"]);
  const postalCode  = getComponent(comps, ["postal_code"]);

  const lat = place.geometry?.location?.lat() ?? 0;
  const lng = place.geometry?.location?.lng() ?? 0;

  return { street, locality, city, state, country, postalCode, lat, lng };
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

/* Singleton — load the Places library only once across all renders */
let placesPromise: Promise<void> | null = null;
function loadPlaces(): Promise<void> {
  if (!placesPromise) {
    setOptions({ key: API_KEY!, v: "weekly" });
    placesPromise = importLibrary("places").then(() => undefined);
  }
  return placesPromise;
}

export function AddressAutocomplete({ onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef    = useRef<google.maps.places.Autocomplete | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "no-key" | "error">(
    API_KEY ? "loading" : "no-key"
  );

  useEffect(() => {
    if (!API_KEY) { setStatus("no-key"); return; }

    loadPlaces()
      .then(() => {
        if (!inputRef.current) return;
        acRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ["geocode", "establishment"],
          fields: ["address_components", "formatted_address", "geometry", "name"],
        });
        acRef.current.addListener("place_changed", () => {
          const place = acRef.current!.getPlace();
          if (!place.address_components) return;
          const parsed = parsePlaceResult(place);
          if (inputRef.current) {
            inputRef.current.value = place.formatted_address ?? place.name ?? "";
          }
          onSelect(parsed);
        });
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "no-key") {
    return (
      <div className="flex items-start gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
        <span>
          Address autocomplete is disabled —{" "}
          <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> is not set.
          Fill in the address fields manually below.
        </span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-start gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
        Failed to load Google Maps. Fill in the address fields manually below.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
        {status === "loading"
          ? <Loader2 className="w-4 h-4 text-[#166534]/50 animate-spin" />
          : <MapPin   className="w-4 h-4 text-[#166534]/60" />
        }
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder={status === "loading" ? "Loading autocomplete…" : "Search for a location or address…"}
        disabled={status === "loading"}
        className="dp-input pl-10 disabled:opacity-60"
        style={{ borderRadius: "0.875rem" }}
        /* prevent form submission on Enter while the Google dropdown is open */
        onKeyDown={e => { if (e.key === "Enter") e.preventDefault(); }}
      />
    </div>
  );
}
