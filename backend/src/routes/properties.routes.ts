import { Router } from "express";
import {
  getProperties, getProperty,
  createProperty, updateProperty, deleteProperty,
  getPropertyAmenities, upsertPropertyAmenities,
} from "../controllers/properties.controller.js";
import { getPropertyViews } from "../controllers/propertyViews.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/",                    getProperties);
router.get("/:id",                 getProperty);
router.get("/:id/views",           getPropertyViews);
router.get("/:id/amenities",       getPropertyAmenities);
router.post("/",                   createProperty);
router.patch("/:id",               updateProperty);
router.patch("/:id/amenities",     upsertPropertyAmenities);
router.delete("/:id",              deleteProperty);

export default router;
