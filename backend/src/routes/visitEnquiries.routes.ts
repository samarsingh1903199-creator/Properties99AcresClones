import { Router } from "express";
import {
  createVisitEnquiry,
  getVisitEnquiries,
  getVisitEnquiry,
  updateVisitEnquiryStatus,
} from "../controllers/visitEnquiries.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/* Public — any visitor can submit a visit enquiry */
router.post("/", createVisitEnquiry);

/* Protected — only the property owner/dealer sees enquiries for their properties */
router.use(authenticate);
router.get("/",      getVisitEnquiries);
router.get("/:id",   getVisitEnquiry);
router.patch("/:id", updateVisitEnquiryStatus);

export default router;
