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
    const totalUsers = await prisma.user.count({ where: { role: "CUSTOMER" } });
    const totalSellers = await prisma.user.count({ where: { role: "SELLER" } });


    const orderItems = await prisma.orderItem.findMany({
        include: {
            order: true,
            sellerMedicine: { include: { medicine: true } }
        },
    });

    const ordersMap: Record<string, Set<string>> = {}; // Unique Order counting er jonno
    const revenueMap: Record<string, number> = {};
    const topMedicinesMap: Record<string, number> = {};

    let totalRevenue = 0;
    let pendingOrdersCount = 0;

    orderItems.forEach((item) => {
        const date = item.order.createdAt.toISOString().split("T")[0];
        const orderStatus = item.order.status;


        if (orderStatus === "DELIVERED") {
            const itemTotal = item.price * item.quantity;
            revenueMap[date] = (revenueMap[date] || 0) + itemTotal;
            totalRevenue += itemTotal;
        }


        if (orderStatus === "PROCESSING") {
            pendingOrdersCount += 1;
        }


        if (!ordersMap[date]) ordersMap[date] = new Set();
        ordersMap[date].add(item.orderId);

        // ৪. Top Medicines (Based on sales quantity)
        if (orderStatus === "DELIVERED") {
            const medName = item.sellerMedicine.medicine.name;
            topMedicinesMap[medName] = (topMedicinesMap[medName] || 0) + item.quantity;
        }
    });


    const ordersOverTime = Object.entries(ordersMap).map(([date, orderSet]) => ({
        date,
        count: orderSet.size, // Unique orders count
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const revenueOverTime = Object.entries(revenueMap).map(([date, amount]) => ({
        date,
        revenue: amount,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const topMedicines = Object.entries(topMedicinesMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    return {
        success: true,
        statusCode: 200,
        message: "Admin statistics calculated accurately",
        data: {
            usersVsSellers: { users: totalUsers, sellers: totalSellers },
            ordersOverTime,
            revenueOverTime,
            totalRevenue: Number(totalRevenue.toFixed(2)),
            pendingOrders: pendingOrdersCount,
            topMedicines,
        },
    };
};

export const adminServices = {
    getUsers,
    banUser,
    getAdminChartData
}