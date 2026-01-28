import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";

interface CreateCategoryPayload {
    name: string;
    slug: string;
}

const createCategory = async (payload: CreateCategoryPayload) => {
    // basic safety check
    if (!payload.name || !payload.slug) {
        throw new AppError(400, "name and slug are required");
    }

    const category = await prisma.medicineCategory.create({
        data: {
            name: payload.name,
            slug: payload.slug,
        },
    });

    return category;
};

const getAllCategories = async () => {
    const categories = await prisma.medicineCategory.findMany({});

    return categories;
};

const getSingleCategory = async (id: string) => {
    const category = await prisma.medicineCategory.findUnique({
        where: { id },
        include: {
            medicines: true, // চাইলে remove করতে পারো
        },
    });

    if (!category) {
        throw new AppError(404, "Category not found");
    }

    return category;
};

export const medicineCategoryService = {
    createCategory,
    getAllCategories,
    getSingleCategory,
};
