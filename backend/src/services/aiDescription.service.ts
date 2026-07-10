import Groq from "groq-sdk";
import type {
  DescriptionLength,
  DescriptionStyle,
  GenerateDescriptionInput,
  GenerateDescriptionResult,
} from "../types/aiDescription.js";

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const STYLE_INSTRUCTIONS: Record<DescriptionStyle, string> = {
  professional: "Write in a professional, trustworthy real estate tone.",
  luxury:       "Write in an upscale, luxury real estate tone highlighting premium appeal.",
  family:       "Write in a warm, family-friendly tone suitable for residential buyers or tenants.",
  investment:   "Write with an investment-focused tone emphasizing value and potential returns.",
  student:      "Write in a practical tone suitable for students or young professionals.",
  commercial:   "Write in a business-oriented tone suitable for commercial property listings.",
  premium:      "Write in a polished premium tone that feels exclusive but still factual.",
};

const LENGTH_TARGETS: Record<DescriptionLength, { words: string; maxTokens: number }> = {
  short:  { words: "50-80",   maxTokens: 200 },
  medium: { words: "120-180", maxTokens: 400 },
  long:   { words: "220-280", maxTokens: 600 },
};

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured on the server");
  }
  return new Groq({ apiKey });
}

function formatListingType(raw: string): string {
  const v = raw.toLowerCase();
  if (v === "sale" || v === "buy") return "Sale";
  if (v === "lease") return "Lease";
  if (v === "rent") return "Rent";
  return raw.trim();
}

function formatPrice(listingType: string, price: number | string | undefined): string {
  if (price === undefined || price === null || price === "") return "Not specified";
  const num = typeof price === "number" ? price : Number(String(price).replace(/[^\d.]/g, ""));
  if (Number.isNaN(num)) return String(price);

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);

  const lt = listingType.toLowerCase();
  if (lt === "rent") return `${formatted}/month`;
  if (lt === "lease") return `${formatted} (lease)`;
  return formatted;
}

function formatArea(area: number | string | undefined): string {
  if (area === undefined || area === null || area === "") return "Not specified";
  if (typeof area === "number") return `${area.toLocaleString("en-IN")} sq.ft.`;
  const s = String(area).trim();
  return /sq\.?\s*ft/i.test(s) ? s : `${s} sq.ft.`;
}

function formatFurnishing(raw: string | undefined): string {
  if (!raw?.trim()) return "Not specified";
  return raw
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

function buildPrompt(input: GenerateDescriptionInput): string {
  const style = input.style ?? "professional";
  const length = input.length ?? "medium";
  const listingLabel = formatListingType(input.listingType);
  const amenities = (input.amenities ?? []).filter(Boolean);

  const propertyDetails = [
    `Listing Type: ${listingLabel}`,
    input.propertyType ? `Property Type: ${input.propertyType}` : null,
    `Title: ${input.title.trim()}`,
    input.location?.trim() ? `Location: ${input.location.trim()}` : null,
    `City: ${input.city.trim()}`,
    input.bedrooms != null ? `Bedrooms: ${input.bedrooms}` : null,
    input.bathrooms != null ? `Bathrooms: ${input.bathrooms}` : null,
    `Area: ${formatArea(input.area)}`,
    `Furnishing: ${formatFurnishing(input.furnishing)}`,
    input.parking != null && input.parking > 0 ? `Parking: ${input.parking}` : null,
    `Price: ${formatPrice(input.listingType, input.price)}`,
    amenities.length ? `Amenities:\n${amenities.map(a => `- ${a}`).join("\n")}` : null,
  ].filter(Boolean).join("\n");

  const regenerateNote = input.regenerate
    ? "\nProvide a fresh alternative wording. Do not repeat phrasing from a typical template."
    : "";

  return `${STYLE_INSTRUCTIONS[style]}

Write an attractive property listing description using ONLY the facts below.

Rules:
- Target ${LENGTH_TARGETS[length].words} words
- Mention the listing type naturally
- Mention the property title, bedrooms, bathrooms, and area when provided
- Mention furnishing, parking, amenities, and price when provided
- Mention general lifestyle benefits without inventing specific nearby landmarks or distances
- End with a clear call to action
- Do not invent facts not listed below
- Do not use emojis
- Return only the description text, no headings or bullet points
${regenerateNote}

Property Details:
${propertyDetails}`;
}

export async function generatePropertyDescription(
  input: GenerateDescriptionInput,
): Promise<GenerateDescriptionResult> {
  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;
  const length = input.length ?? "medium";
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are an expert real estate copywriter for the Indian property market. You write accurate, engaging listing descriptions.",
      },
      {
        role: "user",
        content: buildPrompt(input),
      },
    ],
    temperature: input.regenerate ? 0.85 : 0.65,
    max_tokens: LENGTH_TARGETS[length].maxTokens,
  });

  const description = completion.choices[0]?.message?.content?.trim();
  if (!description) {
    throw new Error("AI returned an empty description");
  }

  const wordCount = description.split(/\s+/).filter(Boolean).length;

  return { description, model, wordCount };
}
