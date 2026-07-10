import { Router } from "express";
import { getPublicProperties, getPublicProperty, getPublicDealers, getPublicDealer, getHighlightedProperties } from "../controllers/public.controller.js";
import { recordView }           from "../controllers/propertyViews.controller.js";

const router = Router();

router.get("/dealers",              getPublicDealers);
router.get("/dealers/:id",          getPublicDealer);
router.get("/properties/highlighted", getHighlightedProperties);
router.get("/properties",           getPublicProperties);
router.get("/properties/:id",       getPublicProperty);
router.post("/properties/:id/view", recordView);

export default router;
