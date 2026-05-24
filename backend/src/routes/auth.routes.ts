import { Router } from "express";
import { login, register, getMe, updateMe } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/login",    login);
router.post("/register", register);
router.get("/me",        authenticate, getMe);
router.patch("/me",      authenticate, updateMe);

export default router;
