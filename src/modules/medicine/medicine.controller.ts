import { Request, Response, NextFunction } from "express";
import { medicineServices } from "./medicine.service";
import { AppError } from "../../errors/AppError";


const createMedicine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.user!.id;
        const result = await medicineServices.addMedicineWithInventory(
            sellerId,
            req.body
        );

        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

const getAllMedicines = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await medicineServices.getAllMedicines({
            ...req.query,
            page: Number(req.query.page || 1),
            limit: Number(req.query.limit || 12),
            skip:
                (Number(req.query.page || 1) - 1) *
                Number(req.query.limit || 12),
        });

        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

const getSingleMedicine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await medicineServices.getSingleMedicine(req.params.id as string);
        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

const updateMedicine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await medicineServices.updateMedicine(
            req.params.id as string,
            req.user!.id,
            req.body
        );
        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

const deleteMedicine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await medicineServices.deleteMedicine(
            req.params.id as string,
            req.user!.id
        );
        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

const getAllManufacturers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const manufacturers = await medicineServices.getAllManufacturers()

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Manufacturers fetched successfully",
            data: manufacturers
        })
    } catch (error) {
        next(error)
    }
}


export const medicineController = {
    createMedicine,
    getAllMedicines,
    getSingleMedicine,
    updateMedicine,
    deleteMedicine,
    getAllManufacturers
};
