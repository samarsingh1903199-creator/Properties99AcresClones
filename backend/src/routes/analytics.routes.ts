import { Router } from "express";
import { getAnalytics }        from "../controllers/analytics.controller.js";
import { getAllPropertyViews }  from "../controllers/propertyViews.controller.js";
import { authenticate }        from "../middleware/auth.js";

const router = Router();

router.get("/",      authenticate, getAnalytics);
router.get("/views", authenticate, getAllPropertyViews);

export default router;
