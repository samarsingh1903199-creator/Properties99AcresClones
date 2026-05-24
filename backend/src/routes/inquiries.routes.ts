import { Router } from "express";
import {
  getInquiries, getInquiry,
  createInquiry, updateInquiryStatus,
} from "../controllers/inquiries.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/* Public — anyone can submit an inquiry for a property */
router.post("/", createInquiry);

/* Protected — only the property owner/dealer sees their inquiries */
router.use(authenticate);
router.get("/",         getInquiries);
router.get("/:id",      getInquiry);
router.patch("/:id",    updateInquiryStatus);

export default router;
