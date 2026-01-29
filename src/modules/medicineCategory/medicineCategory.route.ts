import express from "express";
import { medicineCategoryController } from "./medicineCategory.controller";
import auth, { UserRole } from "../../middlewares/auth";


const router = express.Router();

router.post("/", auth(UserRole.ADMIN), medicineCategoryController.createCategory);
router.get("/",auth(UserRole.ADMIN, UserRole.SELLER, UserRole.CUSTOMER),  medicineCategoryController.getAllCategories);
router.get("/:id", medicineCategoryController.getSingleCategory);
router.delete("/:id",auth(UserRole.ADMIN, UserRole.SELLER, UserRole.CUSTOMER), auth(UserRole.ADMIN), medicineCategoryController.deleteSingleCategory);

export const medicineCategoryRoutes = router;
