
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { PlaceOrderPayload, ServiceResponse } from "../../types/order.types";

type OrderItemData = {
    sellerMedicineId: string;
    price: number;
    quantity: number;
};

interface CreateOrderPayload {
    shippingAddress: string;
    items: {
        sellerMedicineId: string;
        quantity: number;
    }[];
}

const placeOrder = async (userId: string, payload: PlaceOrderPayload): Promise<ServiceResponse> => {
    try {
        const { shippingAddress, items } = payload;

        if (!items.length) return { success: false, statusCode: 400, message: "Order items required" };

        let total = 0;
        const orderItemsData: OrderItemData[] = [];

        for (const item of items) {
            const sellerMedicine = await prisma.sellerMedicine.findUnique({
                where: { id: item.sellerMedicineId },
            });

            if (!sellerMedicine || !sellerMedicine.isAvailable) {
                return { success: false, statusCode: 404, message: `Medicine not available: ${item.sellerMedicineId}` };
            }

            if (sellerMedicine.stockQuantity < item.quantity) {
                return { success: false, statusCode: 400, message: `Insufficient stock for ${sellerMedicine.medicineId}` };
            }

            total += sellerMedicine.price * item.quantity;

            orderItemsData.push({
                sellerMedicineId: sellerMedicine.id,
                price: sellerMedicine.price,
                quantity: item.quantity,
            });
        }

        //  Transaction
        const order = await prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: {
                    userId,
                    total,
                    shippingAddress,
                    paymentMethod: "COD",
                    items: { create: orderItemsData },
                },
                include: { items: true },
            });

            // reduce stock
            for (const item of items) {
                await tx.sellerMedicine.update({
                    where: { id: item.sellerMedicineId },
                    data: { stockQuantity: { decrement: item.quantity } },
                });
            }

            return createdOrder;
        });

        return { success: true, statusCode: 201, message: "Order placed successfully", data: order };
    } catch (err: any) {
        return { success: false, statusCode: 500, message: err.message || "Order placement failed" };
    }
}

// User sees their own orders
const getMyOrders = async (userId: string): Promise<ServiceResponse> => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                items: { include: { sellerMedicine: { include: { medicine: true } } } },
            },
        });
        return { success: true, statusCode: 200, message: "Orders fetched", data: orders };
    } catch (err: any) {
        return { success: false, statusCode: 500, message: err.message || "Failed to fetch orders" };
    }
}

// user can cancel their orders
const cancelOrder = async (userId: string, orderId: string): Promise<ServiceResponse> => {
    try {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) return { success: false, statusCode: 404, message: "Order not found" };
        if (order.userId !== userId) return { success: false, statusCode: 403, message: "Not authorized" };
        if (order.status !== "PROCESSING") return { success: false, statusCode: 400, message: "Cannot cancel this order" };

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" },
        });

        return { success: true, statusCode: 200, message: "Order cancelled", data: updated };
    } catch (err: any) {
        return { success: false, statusCode: 500, message: err.message || "Failed to cancel order" };
    }
}

//  Seller sees their orders
const getSellerOrders = async (sellerId: string): Promise<ServiceResponse> => {
    try {
        const orders = await prisma.order.findMany({
            where: { items: { some: { sellerMedicine: { sellerId } } } },
            orderBy: { createdAt: "desc" },
            include: {
                items: { include: { sellerMedicine: { include: { medicine: true } } } },
                user: true,
            },
        });
        return { success: true, statusCode: 200, message: "Orders fetched for seller", data: orders };
    } catch (err: any) {
        return { success: false, statusCode: 500, message: err.message || "Failed to fetch seller orders" };
    }
}

// Seller updates order status
const updateOrderStatus = async (sellerId: string, orderId: string, status: string): Promise<ServiceResponse> => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { sellerMedicine: true } } },
        });
        if (!order) return { success: false, statusCode: 404, message: "Order not found" };

        const hasSellerItem = order.items.some(item => item.sellerMedicine.sellerId === sellerId);
        if (!hasSellerItem) return { success: false, statusCode: 403, message: "Not authorized to update this order" };

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: { status: status as any },
        });

        return { success: true, statusCode: 200, message: "Order status updated", data: updated };
    } catch (err: any) {
        return { success: false, statusCode: 500, message: err.message || "Failed to update order status" };
    }
}

//  Admin fetch all orders
const getAllOrders = async (): Promise<ServiceResponse> => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                items: { include: { sellerMedicine: { include: { medicine: true, seller: true } } } },
                user: true,
            },
        });
        return { success: true, statusCode: 200, message: "All orders fetched", data: orders };
    } catch (err: any) {
        return { success: false, statusCode: 500, message: err.message || "Failed to fetch all orders" };
    }
}

export const OrderServices = {
    placeOrder,
    getMyOrders,
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    getSellerOrders
}
