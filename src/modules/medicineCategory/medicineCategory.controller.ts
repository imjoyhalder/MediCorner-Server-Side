import { Request, Response, NextFunction } from "express";
import { medicineCategoryService } from "./medicineCategory.service";
import { AppError } from "../../errors/AppError";

const createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, slug } = req.body;

        if (!name || !slug) {
            throw new AppError(400, "name and slug are required");
        }

        const result = await medicineCategoryService.createCategory({ name, slug });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: result,
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

        res.status(200).json({
            success: true,
            data: result,
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
        const { id } = req.params;

        if (!id) {
            throw new AppError(400, "Category id is required");
        }

        const result = await medicineCategoryService.getSingleCategory(id as string);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const medicineCategoryController = {
    createCategory,
    getAllCategories,
    getSingleCategory,
};
