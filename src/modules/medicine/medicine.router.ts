import express, { Router } from "express";
import { medicineController } from "./medicine.controller";

const router: Router = express.Router();

router.post("/", medicineController.createMedicine);

export const medicineRouter = router;
