import { Request, Response, NextFunction } from "express";
import { medicineCategoryService } from "./medicineCategory.service";
import { AppError } from "../../errors/AppError";


const createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await medicineCategoryService.createCategory(req.body);

        res.status(result.statusCode).json({
            success: result.success,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        next(error);
    }
};

const getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await medicineCategoryService.getAllCategories();

        res.status(result.statusCode).json({
            success: result.success,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        next(error);
    }
};

const getSingleCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await medicineCategoryService.getSingleCategory(
            req.params.id as string
        );

        res.status(result.statusCode).json({
            success: result.success,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        next(error);
    }
};

const deleteSingleCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await medicineCategoryService.deleteSingleCategory(
            req.params.id as string
        );

        res.status(result.statusCode).json({
            success: result.success,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        next(error);
    }
};

export const medicineCategoryController = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    deleteSingleCategory
};
