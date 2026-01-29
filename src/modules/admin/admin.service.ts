
import { UserStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"


const getUsers = async () => {
    return await prisma.user.findMany()
}

const banUser = async (userId: string) => {
    const isExist = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    if (!isExist) {
        return {
            message: "user not found"
        }
    }

    const result = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            status: UserStatus.BAN
        }
    })
    return {
        message: `${isExist.id} number use ban successfully`,
        result
    }
}

const getAdminChartData = async () => {
    // Users vs sellers
    const totalUsers = await prisma.user.count({ where: { role: "CUSTOMER" } });
    const totalSellers = await prisma.user.count({ where: { role: "SELLER" } });

    // Orders grouped by date and revenue
    const orders = await prisma.orderItem.findMany({
        include: { order: true, sellerMedicine: { include: { medicine: true } } },
    });

    const ordersOverTime: Record<string, number> = {};
    const revenueOverTime: Record<string, number> = {};
    const topMedicines: Record<string, number> = {};

    orders.forEach((item) => {
        const date = item.order.createdAt.toISOString().split("T")[0];

        ordersOverTime[date] = (ordersOverTime[date] || 0) + 1;
        revenueOverTime[date] = (revenueOverTime[date] || 0) + item.price * item.quantity;

        const medName = item.sellerMedicine.medicine.name;
        topMedicines[medName] = (topMedicines[medName] || 0) + item.quantity;
    });

    return {
        success: true,
        statusCode: 200,
        message: "Admin chart data fetched",
        data: {
            usersVsSellers: { users: totalUsers, sellers: totalSellers },
            ordersOverTime,
            revenueOverTime,
            topMedicines,
        },
    };
};

export const adminServices = {
    getUsers,
    banUser, 
    getAdminChartData
}