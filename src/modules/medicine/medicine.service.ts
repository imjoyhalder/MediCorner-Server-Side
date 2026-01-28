import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";

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

interface UpdateMedicinePayload {
    name?: string;
    brandName?: string;
    genericName?: string;
    manufacturer?: string;
    description?: string;
    isOtc?: boolean;
    thumbnail?: string;
    categoryId?: string;
}

const createMedicine = async (payload: CreateMedicinePayload) => {
    // check category exists
    const category = await prisma.medicineCategory.findUnique({
        where: { id: payload.categoryId },
    });
    if (!category) throw new AppError(400, "Invalid categoryId");

    return prisma.medicine.create({
        data: {
            ...payload,
            isOtc: payload.isOtc ?? true,
        },
    });
};

const getAllMedicines = async () => {
    return prisma.medicine.findMany({
        include: {
            category: true,
            reviews: true,
            sellers: true,
        },
        orderBy: { name: "asc" },
    });
};

const getSingleMedicine = async (id: string) => {
    const medicine = await prisma.medicine.findUnique({
        where: { id },
        include: {
            category: true,
            reviews: true,
            sellers: true,
        },
    });

    if (!medicine) throw new AppError(404, "Medicine not found");
    return medicine;
};

const updateMedicine = async (id: string, payload: UpdateMedicinePayload) => {
    const medicine = await prisma.medicine.findUnique({ where: { id } });
    if (!medicine) throw new AppError(404, "Medicine not found");

    // if categoryId is updated, check it
    if (payload.categoryId) {
        const category = await prisma.medicineCategory.findUnique({
            where: { id: payload.categoryId },
        });
        if (!category) throw new AppError(400, "Invalid categoryId");
    }

    return prisma.medicine.update({
        where: { id },
        data: payload,
    });
};

const deleteMedicine = async (id: string) => {
    const medicine = await prisma.medicine.findUnique({ where: { id } });
    if (!medicine) throw new AppError(404, "Medicine not found");

    return prisma.medicine.delete({ where: { id } });
};

export const medicineServices = {
    createMedicine,
    getAllMedicines,
    getSingleMedicine,
    updateMedicine,
    deleteMedicine,
};
