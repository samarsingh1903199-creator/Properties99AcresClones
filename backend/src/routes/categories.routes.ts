import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller.js";

const router = Router();

router.get("/",        listCategories);
router.post("/",       authenticate, createCategory);
router.patch("/:id",   authenticate, updateCategory);
router.delete("/:id",  authenticate, deleteCategory);

export default router;
