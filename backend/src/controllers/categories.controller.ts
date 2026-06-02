import { Request, Response } from "express";
import { CategoryModel } from "../models/Category.model.js";

/* GET /api/categories — public */
export async function listCategories(req: Request, res: Response) {
  try {
    const filter: Record<string, unknown> = { isActive: true };
    if (req.query.type === "listing" || req.query.type === "property") {
      filter.categoryType = req.query.type;
    }

    const categories = await CategoryModel.find(filter).sort({ order: 1, name: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
}

/* POST /api/categories — auth */
export async function createCategory(req: Request, res: Response) {
  try {
    const { name, slug, categoryType, icon, order, isActive } = req.body;

    if (!name || !slug || !categoryType) {
      return res.status(400).json({ success: false, message: "name, slug and categoryType are required" });
    }
    if (!["listing", "property"].includes(categoryType)) {
      return res.status(400).json({ success: false, message: "categoryType must be 'listing' or 'property'" });
    }

    const existing = await CategoryModel.findOne({ slug: slug.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: "A category with this slug already exists" });
    }

    const category = await CategoryModel.create({ name, slug, categoryType, icon, order, isActive });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
}

/* PATCH /api/categories/:id — auth */
export async function updateCategory(req: Request, res: Response) {
  try {
    const { name, slug, categoryType, icon, order, isActive } = req.body;

    if (categoryType && !["listing", "property"].includes(categoryType)) {
      return res.status(400).json({ success: false, message: "categoryType must be 'listing' or 'property'" });
    }

    if (slug) {
      const conflict = await CategoryModel.findOne({ slug: slug.toLowerCase().trim(), _id: { $ne: req.params.id } });
      if (conflict) {
        return res.status(409).json({ success: false, message: "Another category already uses this slug" });
      }
    }

    const category = await CategoryModel.findByIdAndUpdate(
      req.params.id,
      { name, slug, categoryType, icon, order, isActive },
      { new: true, runValidators: true }
    );

    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update category" });
  }
}

/* DELETE /api/categories/:id — auth */
export async function deleteCategory(req: Request, res: Response) {
  try {
    const category = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
}
