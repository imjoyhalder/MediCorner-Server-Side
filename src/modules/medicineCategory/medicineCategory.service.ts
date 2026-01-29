import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";

interface CreateCategoryPayload {
    name: string;
    slug: string;
}

const createCategory = async (payload: CreateCategoryPayload) => {
    const { name, slug } = payload;

    //  validation
    if (!name || !slug) {
        return {
            success: false,
            statusCode: 400,
            message: "Name and slug are required",
            data: null,
        };
    }

    //  duplicate check
    const existingCategory = await prisma.medicineCategory.findFirst({
        where: {
            OR: [{ name }, { slug }],
        },
    });

    if (existingCategory) {
        return {
            success: false,
            statusCode: 409,
            message: "Category already exists with same name or slug",
            data: null,
        };
    }

    //  create
    const category = await prisma.medicineCategory.create({
        data: { name, slug },
    });

    return {
        success: true,
        statusCode: 201,
        message: "Category created successfully",
        data: category,
    };
};

const getAllCategories = async () => {
    const categories = await prisma.medicineCategory.findMany({});

    return {
        success: true,
        statusCode: 200,
        message: "Categories fetched successfully",
        data: categories,
    };
};


const getSingleCategory = async (id: string) => {
    if (!id) {
        return {
            success: false,
            statusCode: 400,
            message: "Category id is required",
            data: null,
        };
    }

    const category = await prisma.medicineCategory.findUnique({
        where: { id },
        include: {
            medicines: true,
        },
    });

    if (!category) {
        return {
            success: false,
            statusCode: 404,
            message: "Category not found",
            data: null,
        };
    }

    return {
        success: true,
        statusCode: 200,
        message: "Category fetched successfully",
        data: category,
    };
};


const deleteSingleCategory = async (id: string) => {
    if (!id) {
        return {
            success: false,
            statusCode: 400,
            message: "Category id is required",
            data: null,
        };
    }

    const category = await prisma.medicineCategory.findUnique({
        where: { id },
    });

    if (!category) {
        return {
            success: false,
            statusCode: 404,
            message: "Category not found",
            data: null,
        };
    }

    const deletedCategory = await prisma.medicineCategory.delete({
        where: { id },
    });

    return {
        success: true,
        statusCode: 200,
        message: "Category deleted successfully",
        data: deletedCategory,
    };
};

export const medicineCategoryService = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    deleteSingleCategory
};
