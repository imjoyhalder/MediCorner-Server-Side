import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";


interface CreateMedicinePayload {
    name: string;
    brandName: string;
    genericName?: string;
    manufacturer?: string;
    description?: string;
    isOtc?: boolean;
    thumbnail?: string;
    categoryId: string;
}

const createMedicine = async (payload: CreateMedicinePayload) => {
    // category exists check
    const category = await prisma.medicineCategory.findUnique({
        where: { id: payload.categoryId },
    });

    if (!category) {
        throw new AppError(400, "Invalid categoryId");
    }

    const medicine = await prisma.medicine.create({
        data: {
            name: payload.name,
            brandName: payload.brandName,
            genericName: payload.genericName,
            manufacturer: payload.manufacturer,
            description: payload.description,
            thumbnail: payload.thumbnail,
            isOtc: payload.isOtc ?? true,
            categoryId: payload.categoryId,
        },
    });

    return medicine;
};

export const medicineServices = {
    createMedicine,
};
