import { Router } from "express";
import { getLikedIds, toggleLike, getLikedProperties } from "../controllers/liked.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);
router.get("/",            getLikedIds);
router.get("/properties",  getLikedProperties);
router.post("/:propertyId", toggleLike);

export default router;
