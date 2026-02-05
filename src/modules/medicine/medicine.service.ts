
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


const getAllMedicines = async (payload: any) => {
    const {
        search,
        categoryId,
        manufacturer,
        minPrice,
        maxPrice,
        page,
        limit,
        sortBy,
        sortOrder,
    } = payload;

    const andConditions: any[] = [];

    // Search Logic
    if (search) {
        andConditions.push({
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { brandName: { contains: search, mode: "insensitive" } },
                { genericName: { contains: search, mode: "insensitive" } },
            ],
        });
    }

    if (categoryId && categoryId !== 'all') andConditions.push({ categoryId });

    if (manufacturer && manufacturer !== 'all') {
        andConditions.push({
            manufacturer: { contains: manufacturer, mode: "insensitive" },
        });
    }

    // Price Filter Logic
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;

    if (min !== undefined || max !== undefined) {
        andConditions.push({
            sellers: {
                some: {
                    price: {
                        ...(min !== undefined && { gte: min }),
                        ...(max !== undefined && { lte: max }),
                    },
                },
            },
        });
    }

    const validSortFields = ["name", "brandName", "manufacturer", "id"];
    const activeSortBy = validSortFields.includes(sortBy) ? sortBy : "name";
    const activeSortOrder = sortOrder === "desc" ? "desc" : "asc";

    const take = Number(limit) || 12;
    const skip = (Number(page || 1) - 1) * take;

    const data = await prisma.medicine.findMany({
        take,
        skip,
        where: andConditions.length > 0 ? { AND: andConditions } : {},
        orderBy: { [activeSortBy]: activeSortOrder },
        include: {
            category: true,
            reviews: true,
            sellers: {
                select: {
                    id: true,
                    price: true,
                    expiryDate: true,
                    stockQuantity: true,
                    sellerId: true,
                }
            }
        },
    });

    const total = await prisma.medicine.count({
        where: andConditions.length > 0 ? { AND: andConditions } : {},
    });

    return {
        success: true,
        statusCode: 200,
        message: "Medicines fetched successfully",
        data,
        pagination: {
            total,
            page: Number(page) || 1,
            limit: take,
            totalPages: Math.ceil(total / take),
        },
    };
};

// seller only can access his posted medicine 
// const getAllMedicinesBySeller = async (payload: any) => {
//     const {
//         search,
//         categoryId,
//         manufacturer,
//         minPrice,
//         maxPrice,
//         page,
//         limit,
//         skip,
//         sortBy,
//         sortOrder,
//     } = payload;

//     const andConditions: Prisma.MedicineWhereInput[] = [];

//     if (search) {
//         andConditions.push({
//             OR: [
//                 { name: { contains: search, mode: "insensitive" } },
//                 { brandName: { contains: search, mode: "insensitive" } },
//                 { genericName: { contains: search, mode: "insensitive" } },
//             ],
//         });
//     }

//     if (categoryId) andConditions.push({ categoryId });

//     if (manufacturer) {
//         andConditions.push({
//             manufacturer: { contains: manufacturer, mode: "insensitive" },
//         });
//     }

//     if (minPrice !== undefined || maxPrice !== undefined) {
//         andConditions.push({
//             sellers: {
//                 some: {
//                     price: {
//                         gte: minPrice,
//                         lte: maxPrice,
//                     },
//                 },
//             },
//         });
//     }

//     const data = await prisma.medicine.findMany({
//         take: limit,
//         skip,
//         where: { AND: andConditions },
//         orderBy: { [sortBy]: sortOrder },
//         include: {
//             category: true,
//             reviews: true,
//             sellers: true,
//         },
//     });

//     const total = await prisma.medicine.count({
//         where: { AND: andConditions },
//     });

//     return {
//         success: true,
//         statusCode: 200,
//         message: "Medicines fetched successfully",
//         data,
//         pagination: {
//             total,
//             page,
//             limit,
//             totalPages: Math.ceil(total / limit),
//         },
//     };
// };

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
    return await prisma.$transaction(async (tx) => {
        console.log(medicineId);
        const sellerMedicine = await tx.sellerMedicine.findFirst({
            where: { medicineId, sellerId }
        });


        console.log(sellerMedicine);

        if (!sellerMedicine) {
            return {
                success: false,
                statusCode: 404,
                message: "Medicine not found in your inventory",
                data: null,
            };
        }

        const updatedInventory = await tx.sellerMedicine.update({
            where: { id: sellerMedicine.id },
            data: {
                price: payload.price ?? sellerMedicine.price,
                stockQuantity: payload.stockQuantity ?? sellerMedicine.stockQuantity,
                batchNumber: payload.batchNumber ?? sellerMedicine.batchNumber,
                isAvailable: payload.isAvailable ?? sellerMedicine.isAvailable,
            },
        });

        const updatedMedicine = await tx.medicine.update({
            where: { id: medicineId },
            data: {
                name: payload.name,
                brandName: payload.brandName,
                genericName: payload.genericName,
                manufacturer: payload.manufacturer,
                description: payload.description,
            },
            include: {
                category: true,
                sellers: {
                    where: { sellerId }
                }
            }
        });

        return {
            success: true,
            statusCode: 200,
            message: "Medicine updated successfully",
            data: updatedMedicine,
        };
    });
};

const deleteMedicine = async (medicineId: string, sellerId: string) => {
    const sellerMedicine = await prisma.sellerMedicine.findFirst({
        where: { medicineId, sellerId },
    });

    if (!sellerMedicine) {
        return {
            success: false,
            statusCode: 404,
            message: "Medicine not found in your inventory",
            data: null,
        };
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.cartItem.deleteMany({
                where: { sellerMedicineId: sellerMedicine.id }
            });

            await tx.sellerMedicine.delete({
                where: { id: sellerMedicine.id },
            });
        });

        return {
            success: true,
            statusCode: 200,
            message: "Medicine removed from your inventory successfully",
            data: null,
        };
    } catch (error) {
        console.error("Delete error:", error);
        return {
            success: false,
            statusCode: 500,
            message: "Failed to delete. This medicine might be linked to an order history.",
            data: null,
        };
    }
};


const getAllManufacturers = async (): Promise<string[]> => {
    const manufacturers = await prisma.medicine.findMany({
        where: {
            manufacturer: {
                not: null
            }
        },
        select: {
            manufacturer: true
        },
        distinct: ["manufacturer"]
    })

    return manufacturers
        .map(m => m.manufacturer!)
        .filter(Boolean)
}


export const medicineServices = {
    addMedicineWithInventory,
    getAllMedicines,
    getSingleMedicine,
    updateMedicine,
    deleteMedicine,
    getAllManufacturers
};
