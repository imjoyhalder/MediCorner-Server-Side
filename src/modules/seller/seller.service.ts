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
        medicineId: item.medicine.id,
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

// const getSellerStats = async (sellerId: string) => {
//     // Total medicines posted
//     const totalMedicines = await prisma.sellerMedicine.count({ where: { sellerId } });

//     //  Orders for seller's medicines
//     const orderItems = await prisma.orderItem.findMany({
//         where: { sellerMedicine: { sellerId } },
//         include: { sellerMedicine: true },
//     });

//     const totalOrders = orderItems.length;

//     //  Revenue (sum of price * quantity)
//     const totalRevenue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

//     //  Reviews for seller's medicines
//     const medicines = await prisma.sellerMedicine.findMany({
//         where: { sellerId },
//         include: { medicine: { include: { reviews: true } } },
//     });

//     const totalReviews = medicines.reduce((sum, sm) => sum + sm.medicine.reviews.length, 0);

//     const allRatings = medicines.flatMap((sm) => sm.medicine.reviews.map((r) => r.rating));
//     const averageRating = allRatings.length > 0 ? allRatings.reduce((a, b) => a! + b!, 0)! / allRatings.length : 0;

//     return {
//         success: true,
//         statusCode: 200,
//         message: "Seller statistics fetched successfully",
//         data: {
//             totalMedicines,
//             totalOrders,
//             totalRevenue,
//             totalReviews,
//             averageRating: Number(averageRating.toFixed(2)),
//         },
//     };
// };

const getSellerStats = async (sellerId: string) => {

    const totalMedicines = await prisma.sellerMedicine.count({ where: { sellerId } });

    const orderItems = await prisma.orderItem.findMany({
        where: { 
            sellerMedicine: { sellerId } 
        },
        include: { 
            order: true 
        },
    });

    const deliveredItems = orderItems.filter(item => item.order.status === "DELIVERED");
    

    const totalRevenue = deliveredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const totalOrders = orderItems.length; 

    const medicines = await prisma.sellerMedicine.findMany({
        where: { sellerId },
        include: { medicine: { include: { reviews: true } } },
    });

    const totalReviews = medicines.reduce((sum, sm) => sum + sm.medicine.reviews.length, 0);

    const allRatings = medicines.flatMap((sm) => sm.medicine.reviews.map((r) => r.rating));
    const averageRating = allRatings.length > 0 ? allRatings.reduce((a, b) => a! + b!, 0)! / allRatings.length : 0;

    return {
        success: true,
        statusCode: 200,
        message: "Seller statistics fetched successfully",
        data: {
            totalMedicines,
            totalOrders,
            totalRevenue, // Ekhon Admin er sathe match korbe
            totalReviews,
            averageRating: Number(averageRating.toFixed(2)),
        },
    };
};

const getSellerChartData = async (sellerId: string) => {
    const orders = await prisma.orderItem.findMany({
        where: { sellerMedicine: { sellerId } },
        include: {
            order: true,
            sellerMedicine: { include: { medicine: true } }
        },
    });

    const ordersMap: Record<string, number> = {};
    const revenueMap: Record<string, number> = {};

    orders.forEach((item) => {
        const date = item.order.createdAt.toISOString().split("T")[0];
        ordersMap[date] = (ordersMap[date] || 0) + 1;

        if (item.order.status === "DELIVERED") {
            const medName = item.sellerMedicine.medicine.name;
            revenueMap[medName] = (revenueMap[medName] || 0) + (item.price * item.quantity);
        }
    });


    const ordersOverTime = Object.entries(ordersMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const revenuePerMedicine = Object.entries(revenueMap).map(([name, value]) => ({
        name,
        value,
    }));

    const medicines = await prisma.sellerMedicine.findMany({
        where: { sellerId },
        include: { medicine: true },
    });

    const stockPerMedicine = medicines.map((sm) => ({
        name: sm.medicine.name,
        stock: sm.stockQuantity,
    }));

    return {
        success: true,
        statusCode: 200,
        message: "Seller chart data fetched",
        data: {
            ordersOverTime,
            revenuePerMedicine,
            stockPerMedicine,
        },
    };
};

export const sellerService = {
    getSellerMedicines,
    getSellerStats,
    getSellerChartData
}