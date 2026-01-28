import express from "express";
import { medicineCategoryController } from "./medicineCategory.controller";
import auth, { UserRole } from "../../middlewares/auth";


const router = express.Router();

router.post("/", auth(UserRole.ADMIN, UserRole.SELLER), medicineCategoryController.createCategory);
router.get("/", medicineCategoryController.getAllCategories);
router.get("/:id", medicineCategoryController.getSingleCategory);
router.delete("/:id", auth(UserRole.ADMIN, UserRole.SELLER), medicineCategoryController.deleteSingleCategory);

export const medicineCategoryRoutes = router;
