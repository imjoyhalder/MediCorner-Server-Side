
import { prisma } from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma/client";

const addMedicineWithInventory = async (
    sellerId: string,
    payload: any
) => {
    const {
        name,
        brandName,
        categoryId,
        price,
        batchNumber,
    } = payload;

    if (!name || !brandName || !categoryId || !price || !batchNumber) {
        return {
            success: false,
            statusCode: 400,
            message: "Required fields are missing",
            data: null,
        };
    }

    return prisma.$transaction(async (tx) => {
        const category = await tx.medicineCategory.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            return {
                success: false,
                statusCode: 400,
                message: "Invalid categoryId",
                data: null,
            };
        }

        let medicine = await tx.medicine.findFirst({
            where: { name, brandName },
        });

        if (!medicine) {
            medicine = await tx.medicine.create({
                data: {
                    name,
                    brandName,
                    genericName: payload.genericName,
                    manufacturer: payload.manufacturer,
                    description: payload.description,
                    categoryId,
                    isOtc: true,
                },
            });
        }

        const alreadyAdded = await tx.sellerMedicine.findFirst({
            where: {
                sellerId,
                medicineId: medicine.id,
            },
        });

        if (alreadyAdded) {
            return {
                success: false,
                statusCode: 409,
                message: "Medicine already added by this seller",
                data: null,
            };
        }

        const inventory = await tx.sellerMedicine.create({
            data: {
                sellerId,
                medicineId: medicine.id,
                price,
                stockQuantity: payload.stockQuantity ?? 0,
                batchNumber,
                expiryDate: payload.expiryDate,
                isAvailable: true,
            },
        });

        return {
            success: true,
            statusCode: 201,
            message: "Medicine added successfully",
            data: { medicine, inventory },
        };
    });
};

// this is for all users 
const getAllMedicines = async (payload: any) => {
    const {
        search,
        categoryId,
        manufacturer,
        minPrice,
        maxPrice,
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
    } = payload;

    const andConditions: Prisma.MedicineWhereInput[] = [];

    if (search) {
        andConditions.push({
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { brandName: { contains: search, mode: "insensitive" } },
                { genericName: { contains: search, mode: "insensitive" } },
            ],
        });
    }

    if (categoryId) andConditions.push({ categoryId });

    if (manufacturer) {
        andConditions.push({
            manufacturer: { contains: manufacturer, mode: "insensitive" },
        });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        andConditions.push({
            sellers: {
                some: {
                    price: {
                        gte: minPrice,
                        lte: maxPrice,
                    },
                },
            },
        });
    }

    const data = await prisma.medicine.findMany({
        take: limit,
        skip,
        where: { AND: andConditions },
        orderBy: { [sortBy]: sortOrder },
        include: {
            category: true,
            reviews: true,
            // sellers: true,
        },
    });

    const total = await prisma.medicine.count({
        where: { AND: andConditions },
    });

    return {
        success: true,
        statusCode: 200,
        message: "Medicines fetched successfully",
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};


// seller only can access his posted medicine 
const getAllMedicinesBySeller = async (payload: any) => {
    const {
        search,
        categoryId,
        manufacturer,
        minPrice,
        maxPrice,
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
    } = payload;

    const andConditions: Prisma.MedicineWhereInput[] = [];

    if (search) {
        andConditions.push({
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { brandName: { contains: search, mode: "insensitive" } },
                { genericName: { contains: search, mode: "insensitive" } },
            ],
        });
    }

    if (categoryId) andConditions.push({ categoryId });

    if (manufacturer) {
        andConditions.push({
            manufacturer: { contains: manufacturer, mode: "insensitive" },
        });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        andConditions.push({
            sellers: {
                some: {
                    price: {
                        gte: minPrice,
                        lte: maxPrice,
                    },
                },
            },
        });
    }

    const data = await prisma.medicine.findMany({
        take: limit,
        skip,
        where: { AND: andConditions },
        orderBy: { [sortBy]: sortOrder },
        include: {
            category: true,
            reviews: true,
            sellers: true,
        },
    });

    const total = await prisma.medicine.count({
        where: { AND: andConditions },
    });

    return {
        success: true,
        statusCode: 200,
        message: "Medicines fetched successfully",
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getSingleMedicine = async (id: string) => {
    if (!id) {
        return {
            success: false,
            statusCode: 400,
            message: "Medicine id is required",
            data: null,
        };
    }

    const medicine = await prisma.medicine.findUnique({
        where: { id },
        include: {
            category: true,
            reviews: true,
            sellers: true,
        },
    });

    if (!medicine) {
        return {
            success: false,
            statusCode: 404,
            message: "Medicine not found",
            data: null,
        };
    }

    return {
        success: true,
        statusCode: 200,
        message: "Medicine fetched successfully",
        data: medicine,
    };
};

const updateMedicine = async (
    medicineId: string,
    sellerId: string,
    payload: any
) => {
    const medicine = await prisma.medicine.findUnique({
        where: { id: medicineId },
    });

    if (!medicine) {
        return {
            success: false,
            statusCode: 404,
            message: "Medicine not found",
            data: null,
        };
    }

    const sellerMedicine = await prisma.sellerMedicine.findFirst({
        where: { medicineId, sellerId },
    });

    if (!sellerMedicine) {
        return {
            success: false,
            statusCode: 403,
            message: "You are not allowed to update this medicine",
            data: null,
        };
    }

    await prisma.medicine.update({
        where: { id: medicineId },
        data: {
            name: payload.name,
            brandName: payload.brandName,
            genericName: payload.genericName,
            manufacturer: payload.manufacturer,
            description: payload.description,
        },
    });

    await prisma.sellerMedicine.update({
        where: { id: sellerMedicine.id },
        data: {
            price: payload.price,
            stockQuantity: payload.stockQuantity,
            batchNumber: payload.batchNumber,
        },
    });

    const updated = await prisma.medicine.findUnique({
        where: { id: medicineId },
        include: { sellers: true, category: true },
    });

    return {
        success: true,
        statusCode: 200,
        message: "Medicine updated successfully",
        data: updated,
    };
};

const deleteMedicine = async (medicineId: string, sellerId: string) => {
    const medicine = await prisma.medicine.findUnique({
        where: { id: medicineId },
    });

    if (!medicine) {
        return {
            success: false,
            statusCode: 404,
            message: "Medicine not found",
            data: null,
        };
    }

    const sellerMedicine = await prisma.sellerMedicine.findFirst({
        where: { medicineId, sellerId },
    });

    if (!sellerMedicine) {
        return {
            success: false,
            statusCode: 403,
            message: "You are not allowed to delete this medicine",
            data: null,
        };
    }

    await prisma.medicine.delete({
        where: { id: medicineId },
    });

    return {
        success: true,
        statusCode: 200,
        message: "Medicine deleted successfully",
        data: null,
    };
};

export const medicineServices = {
    addMedicineWithInventory,
    getAllMedicines,
    getSingleMedicine,
    updateMedicine,
    deleteMedicine,
};
