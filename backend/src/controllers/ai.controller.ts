import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { generatePropertyDescription } from "../services/aiDescription.service.js";
import type {
  DescriptionLength,
  DescriptionStyle,
  GenerateDescriptionInput,
} from "../types/aiDescription.js";

const VALID_STYLES: DescriptionStyle[] = [
  "professional", "luxury", "family", "investment", "student", "commercial", "premium",
];

const VALID_LENGTHS: DescriptionLength[] = ["short", "medium", "long"];

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeInput(body: Record<string, unknown>): GenerateDescriptionInput | { error: string } {
  const title = String(body.title ?? "").trim();
  const city = String(body.city ?? "").trim();
  const listingType = String(body.listingType ?? "").trim();

  if (!title) return { error: "title is required" };
  if (!city) return { error: "city is required" };
  if (!listingType) return { error: "listingType is required" };

  const style = body.style as DescriptionStyle | undefined;
  if (style && !VALID_STYLES.includes(style)) {
    return { error: `style must be one of: ${VALID_STYLES.join(", ")}` };
  }

  const length = body.length as DescriptionLength | undefined;
  if (length && !VALID_LENGTHS.includes(length)) {
    return { error: `length must be one of: ${VALID_LENGTHS.join(", ")}` };
  }

  const amenities = Array.isArray(body.amenities)
    ? body.amenities.map(a => String(a).trim()).filter(Boolean)
    : undefined;

  return {
    listingType,
    propertyType: body.propertyType ? String(body.propertyType).trim() : undefined,
    title,
    city,
    location: body.location ? String(body.location).trim() : undefined,
    bedrooms: parseOptionalNumber(body.bedrooms),
    bathrooms: parseOptionalNumber(body.bathrooms),
    area: body.area !== undefined && body.area !== null && body.area !== ""
      ? (typeof body.area === "number" ? body.area : String(body.area).trim())
      : undefined,
    furnishing: body.furnishing ? String(body.furnishing).trim() : undefined,
    parking: parseOptionalNumber(body.parking),
    price: body.price !== undefined && body.price !== null && body.price !== ""
      ? (typeof body.price === "number" ? body.price : String(body.price).trim())
      : undefined,
    amenities,
    style,
    length,
    regenerate: body.regenerate === true,
  };
}

export const generateDescription = asyncHandler(async (req: Request, res: Response) => {
  const parsed = normalizeInput(req.body ?? {});
  if ("error" in parsed) {
    res.status(400).json({ success: false, message: parsed.error });
    return;
  }

  try {
    const result = await generatePropertyDescription(parsed);
    res.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate description";
    if (message.includes("GROQ_API_KEY")) {
      res.status(503).json({ success: false, message: "AI service is not configured. Set GROQ_API_KEY in backend/.env" });
      return;
    }
    throw err;
  }
});
