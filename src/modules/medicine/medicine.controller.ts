import { NextFunction, Request, Response } from "express";
import { medicineServices } from "./medicine.service";


const createMedicine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body
        console.log(data);
        const result = await medicineServices.createMedicine(data)
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

export const medicineController = {
    createMedicine
}