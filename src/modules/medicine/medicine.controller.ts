import { Request, Response, NextFunction } from "express";
import { medicineServices } from "./medicine.service";
import { AppError } from "../../errors/AppError";

const createMedicine = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            name,
            brandName,
            categoryId,
        } = req.body;

        // basic validation
        if (!name || !brandName || !categoryId) {
            throw new AppError(
                400,
                "name, brandName and categoryId are required"
            );
        }

        const result = await medicineServices.createMedicine(req.body);

        res.status(201).json({
            success: true,
            message: "Medicine created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const medicineController = {
    createMedicine,
};
