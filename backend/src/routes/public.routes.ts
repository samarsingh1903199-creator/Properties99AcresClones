import { Router } from "express";
import { getPublicProperties, getPublicProperty } from "../controllers/public.controller.js";
import { recordView }           from "../controllers/propertyViews.controller.js";

const router = Router();

router.get("/properties",           getPublicProperties);
router.get("/properties/:id",       getPublicProperty);
router.post("/properties/:id/view", recordView);

export default router;
