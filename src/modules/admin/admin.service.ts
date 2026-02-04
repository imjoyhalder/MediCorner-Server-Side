import { ServiceResponse } from './../../types/order.types';

import { OrderStatus, UserRole, UserStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"


export const getUsers = async (): Promise<ServiceResponse> => {
    try {

        const users = await prisma.user.findMany({
            where: {
                role: {
                    in: [UserRole.SELLER, UserRole.CUSTOMER],
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return {
            success: true,
            statusCode: 200,
            message: "Users retrieved successfully",
            data: users,
        };
    } catch (error: any) {
        return {
            success: false,
            statusCode: 500,
            message: error.message || "Failed to fetch users",
        };
    }
};

const banUser = async (userId: string) => {
    const isExist = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!isExist) {
        return {
            success: false,
            message: "User not found"
        }
    }

    if (isExist.role === 'ADMIN') {
        return {
            success: false,
            message: "Cannot ban an administrator"
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
        success: true,
        message: `${isExist.name || isExist.id} has been banned successfully`,
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

    let totalRevenue = 0
    let pendingOrders = 0
    orders.forEach((item) => {
        const date = item.order.createdAt.toISOString().split("T")[0];

        if (item.status === OrderStatus.DELIVERED) {
            revenueOverTime[date] = (revenueOverTime[date] || 0) + item.price * item.quantity;
            totalRevenue += item.price * item.quantity
        }
        if (item.status === OrderStatus.PROCESSING) {
            pendingOrders += 1
        }

        ordersOverTime[date] = (ordersOverTime[date] || 0) + 1;

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
            totalRevenue,
            pendingOrders,
            topMedicines,
        },
    };
};

export const adminServices = {
    getUsers,
    banUser,
    getAdminChartData
}