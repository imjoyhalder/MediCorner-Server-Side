import express from "express";
import { medicineController } from "./medicine.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.get('/manufacturers', medicineController.getAllManufacturers)
router.get("/",  medicineController.getAllMedicines);
router.get("/:id", medicineController.getSingleMedicine);

router.post("/", auth(UserRole.SELLER), medicineController.createMedicine);
router.patch("/:id", auth(UserRole.SELLER), medicineController.updateMedicine);
router.delete("/:id",  auth(UserRole.SELLER), medicineController.deleteMedicine);

export const medicineRouter = router;
