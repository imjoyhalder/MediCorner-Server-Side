import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";


export interface SellerMedicineSummary {
    sellerMedicineId: string;
    medicineName: string;
    brandName: string;
    genericName?: string;
    categoryName?: string;
    price: number;
    stockQuantity: number;
    expiryDate?: Date;
    batchNumber: string;
    isAvailable: boolean;
    totalReviews: number;
    averageRating: number;
}

const getSellerMedicines = async (sellerId: string, payload: any) => {
    const {
        search,
        categoryId,
        manufacturer,
        minPrice,
        maxPrice,
        page = 1,
        limit = 10,
        skip = (page - 1) * limit,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = payload;

    const andConditions: Prisma.SellerMedicineWhereInput[] = [
        { sellerId },
    ];

    if (categoryId) andConditions.push({ medicine: { categoryId } });
    if (manufacturer)
        andConditions.push({ medicine: { manufacturer: { contains: manufacturer, mode: "insensitive" } } });
    if (search)
        andConditions.push({
            medicine: {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { brandName: { contains: search, mode: "insensitive" } },
                    { genericName: { contains: search, mode: "insensitive" } },
                ],
            },
        });
    if (minPrice !== undefined || maxPrice !== undefined)
        andConditions.push({
            price: {
                gte: minPrice ?? undefined,
                lte: maxPrice ?? undefined,
            },
        });

    const dataRaw = await prisma.sellerMedicine.findMany({
        where: { AND: andConditions },
        take: limit,
        skip,
        orderBy: { price: sortOrder },
        include: {
            medicine: { include: { category: true, reviews: true } },
        },
    });

    const data: SellerMedicineSummary[] = dataRaw.map((item) => ({
        sellerMedicineId: item.id,
        medicineName: item.medicine.name,
        brandName: item.medicine.brandName,
        genericName: item.medicine.genericName ?? undefined,
        categoryName: item.medicine.category?.name ?? undefined,
        price: item.price,
        stockQuantity: item.stockQuantity,
        expiryDate: item.expiryDate ?? undefined,
        batchNumber: item.batchNumber,
        isAvailable: item.isAvailable,
        totalReviews: item.medicine.reviews.length,
        averageRating:
            item.medicine.reviews.length > 0
                ? item.medicine.reviews.reduce((sum, r) => sum + r.rating!, 0) / item.medicine.reviews.length
                : 0,
    }));

    const total = await prisma.sellerMedicine.count({ where: { AND: andConditions } });

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

export const sellerService = {
    getSellerMedicines
}