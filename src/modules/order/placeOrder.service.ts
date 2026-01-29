

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

const placeOrder = async (
    userId: string,
    payload: { shippingAddress: string }
): Promise<ServiceResponse> => {
    try {
        const { shippingAddress } = payload;

        //  Get user cart with items
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        sellerMedicine: true,
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            return {
                success: false,
                statusCode: 400,
                message: "Cart is empty",
            };
        }

        let total = 0;

        //  Validate stock & availability
        for (const item of cart.items) {
            const medicine = item.sellerMedicine;

            if (!medicine.isAvailable) {
                return {
                    success: false,
                    statusCode: 400,
                    message: `Medicine not available`,
                };
            }

            if (medicine.stockQuantity < item.quantity) {
                return {
                    success: false,
                    statusCode: 400,
                    message: `Insufficient stock`,
                };
            }

            total += medicine.price * item.quantity;
        }

        // Transaction starts
        const order = await prisma.$transaction(async (tx) => {
            // Create Order
            const createdOrder = await tx.order.create({
                data: {
                    userId,
                    total,
                    shippingAddress,
                    paymentMethod: "COD",
                },
            });

            // Create OrderItems + update stock
            for (const item of cart.items) {
                const medicine = item.sellerMedicine;
                const remainingStock = medicine.stockQuantity - item.quantity;

                await tx.orderItem.create({
                    data: {
                        orderId: createdOrder.id,
                        sellerMedicineId: medicine.id,
                        price: medicine.price,
                        quantity: item.quantity,
                        status: "PROCESSING",
                    },
                });

                await tx.sellerMedicine.update({
                    where: { id: medicine.id },
                    data: {
                        stockQuantity: remainingStock,
                        isAvailable: remainingStock > 0,
                    },
                });
            }

            // Clear cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            return createdOrder;
        });

        return {
            success: true,
            statusCode: 201,
            message: "Order placed successfully",
            data: order,
        };
    } catch (error: any) {
        return {
            success: false,
            statusCode: 500,
            message: error.message || "Failed to place order",
        };
    }
};

// User sees their own orders
const getMyOrders = async (userId: string): Promise<ServiceResponse> => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                items: {
                    include: {
                        sellerMedicine: {
                            include: {
                                medicine: true,
                                seller: true,
                            },
                        },
                    },
                },
            },
        });

        return {
            success: true,
            statusCode: 200,
            message: "Orders fetched",
            data: orders,
        };
    } catch (err: any) {
        return {
            success: false,
            statusCode: 500,
            message: err.message || "Failed to fetch orders",
        };
    }
};

// user can cancel their orders
const cancelOrder = async (
    userId: string,
    orderId: string
): Promise<ServiceResponse> => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: { sellerMedicine: true },
                },
            },
        });

        if (!order)
            return { success: false, statusCode: 404, message: "Order not found" };

        if (order.userId !== userId)
            return { success: false, statusCode: 403, message: "Not authorized" };

        if (order.status !== "PROCESSING")
            return {
                success: false,
                statusCode: 400,
                message: "Order cannot be cancelled now",
            };

        await prisma.$transaction(async (tx) => {
            // rollback stock
            for (const item of order.items) {
                await tx.sellerMedicine.update({
                    where: { id: item.sellerMedicineId },
                    data: {
                        stockQuantity: { increment: item.quantity },
                        isAvailable: true,
                    },
                });
            }

            // update order items
            await tx.orderItem.updateMany({
                where: { orderId },
                data: { status: "CANCELLED" },
            });

            // update order
            await tx.order.update({
                where: { id: orderId },
                data: { status: "CANCELLED" },
            });
        });

        return {
            success: true,
            statusCode: 200,
            message: "Order cancelled successfully",
        };
    } catch (err: any) {
        return {
            success: false,
            statusCode: 500,
            message: err.message || "Failed to cancel order",
        };
    }
};


//  Seller sees their orders
const getSellerOrders = async (
    sellerId: string
): Promise<ServiceResponse> => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                items: {
                    some: { sellerMedicine: { sellerId } },
                },
            },
            orderBy: { createdAt: "desc" },
            include: {
                user: true,
                items: {
                    where: {
                        sellerMedicine: { sellerId },
                    },
                    include: {
                        sellerMedicine: {
                            include: { medicine: true },
                        },
                    },
                },
            },
        });

        return {
            success: true,
            statusCode: 200,
            message: "Seller orders fetched",
            data: orders,
        };
    } catch (err: any) {
        return {
            success: false,
            statusCode: 500,
            message: err.message || "Failed to fetch seller orders",
        };
    }
};


// Seller updates order status
const updateOrderStatus = async (
    sellerId: string,
    orderId: string,
    status: "SHIPPED" | "DELIVERED"
): Promise<ServiceResponse> => {
    try {
        // update seller's order items only
        const updatedItems = await prisma.orderItem.updateMany({
            where: {
                orderId,
                sellerMedicine: { sellerId },
                status: { not: "CANCELLED" },
            },
            data: { status },
        });

        if (updatedItems.count === 0) {
            return {
                success: false,
                statusCode: 403,
                message: "No items to update",
            };
        }

        // recalculate order status
        const allItems = await prisma.orderItem.findMany({
            where: { orderId },
        });

        let newOrderStatus: any = "PROCESSING";

        if (allItems.every(i => i.status === "DELIVERED")) {
            newOrderStatus = "DELIVERED";
        } else if (allItems.some(i => i.status === "SHIPPED")) {
            newOrderStatus = "SHIPPED";
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { status: newOrderStatus },
        });

        return {
            success: true,
            statusCode: 200,
            message: "Order status updated",
        };
    } catch (err: any) {
        return {
            success: false,
            statusCode: 500,
            message: err.message || "Failed to update status",
        };
    }
};

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
