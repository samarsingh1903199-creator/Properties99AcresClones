import { Router } from "express";
import {
  getProperties, getMyHighlightedProperties, getProperty,
  createProperty, updateProperty, deleteProperty,
  getPropertyAmenities, upsertPropertyAmenities,
  setPropertyHighlighted,
} from "../controllers/properties.controller.js";
import { generateDescription } from "../controllers/ai.controller.js";
import { getPropertyViews } from "../controllers/propertyViews.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/generate-description", generateDescription);

router.get("/",                    getProperties);
router.get("/highlighted",         getMyHighlightedProperties);
router.get("/:id",                 getProperty);
router.get("/:id/views",           getPropertyViews);
router.get("/:id/amenities",       getPropertyAmenities);
router.post("/",                   createProperty);
router.patch("/:id/highlight",     setPropertyHighlighted);
router.patch("/:id",               updateProperty);
router.patch("/:id/amenities",     upsertPropertyAmenities);
router.delete("/:id",              deleteProperty);

export default router;
