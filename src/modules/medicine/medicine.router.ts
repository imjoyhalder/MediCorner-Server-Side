import express from "express";
import { medicineController } from "./medicine.controller";

const router = express.Router();

router.post("/", medicineController.createMedicine);
router.get("/", medicineController.getAllMedicines);
router.get("/:id", medicineController.getSingleMedicine);
router.put("/:id", medicineController.updateMedicine);
router.delete("/:id", medicineController.deleteMedicine);

export const medicineRoutes = router;
