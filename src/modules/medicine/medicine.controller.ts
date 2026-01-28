import { Request, Response, NextFunction } from "express";
import { medicineServices } from "./medicine.service";
import { AppError } from "../../errors/AppError";

// CREATE
// const createMedicine = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { name, brandName, categoryId } = req.body;
//         if (!name || !brandName || !categoryId)
//             throw new AppError(400, "name, brandName and categoryId are required");

//         const result = await medicineServices.createMedicine(req.body);
//         res.status(201).json({
//             success: true,
//             message: "Medicine created successfully",
//             data: result,
//         });
//     } catch (error) {
//         next(error);
//     }
// };

const createMedicine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.user!.id;

        const {
            name,
            brandName,
            categoryId,
            price,
            batchNumber,
        } = req.body;

        if (!name || !brandName || !categoryId || !price || !batchNumber) {
            throw new AppError(400, "Required fields are missing");
        }

        const result = await medicineServices.addMedicineWithInventory(
            sellerId,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Medicine added to inventory successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// GET ALL
const getAllMedicines = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await medicineServices.getAllMedicines();
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// GET SINGLE
const getSingleMedicine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await medicineServices.getSingleMedicine(id as string);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// UPDATE

const updateMedicine = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const sellerId = req.user!.id;

        const result = await medicineServices.updateMedicine(
            id! as string,
            sellerId,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Medicine updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Delete
const deleteMedicine = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, "Unauthorized");
        }

        const { id } = req.params;
        const sellerId = req.user.id;

        await medicineServices.deleteMedicine(id as string, sellerId);

        res.status(200).json({
            success: true,
            message: "Medicine deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};


export const medicineController = {
    createMedicine,
    getAllMedicines,
    getSingleMedicine,
    updateMedicine,
    deleteMedicine,
};
