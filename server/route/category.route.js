import { Router } from "express";
import auth from '../middleware/auth.js';
import { AddCategoryController, getCategoryController, updateCategoryController, deleteCategoryController } from "../controllers/category.controller.js";

const categoryRouter = Router();

// Add new category (protected route)
categoryRouter.post("/add-category", AddCategoryController);

// Get all categories (public route)
categoryRouter.get("/get", getCategoryController);

// Update category (protected route)
categoryRouter.put("/update", updateCategoryController);

// Delete category (protected route)
categoryRouter.delete("/delete", deleteCategoryController);

export default categoryRouter;
