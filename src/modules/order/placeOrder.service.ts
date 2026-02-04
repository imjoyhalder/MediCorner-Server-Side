

import { OrderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { PlaceOrderPayload, ServiceResponse } from "../../types/order.types";

interface MedicineSummary {
    name: string;
    price: number;
    quantity: number;
    medicineId: string;
}

interface OrderSummary {
    orderId: string;
    status: string;
    total: number;
    medicines: MedicineSummary[];
}

interface SellerSummaryItem {
    sellerId: string;
    sellerName: string;
    totalOrders: number;
    totalProductsSold: number;
    totalRevenue: number;
}

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
export const getMyOrders = async (userId: string): Promise<ServiceResponse> => {
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
                            },
                        },
                    },
                },
            },
        });

        const summary = orders.map((order) => ({
            orderId: order.id,
            status: order.status,
            total: order.total,
            createdAt: order.createdAt,
            medicines: order.items.map((item) => ({
                name: item.sellerMedicine.medicine.name,
                medicineId: item.sellerMedicine.medicine.id,
                price: item.price,
                quantity: item.quantity,
                itemStatus: item.status,
                sellerId: item.sellerMedicine.sellerId
            })),
        }));

        return {
            success: true,
            statusCode: 200,
            message: "Customer orders fetched successfully",
            data: summary,
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
export const cancelOrder = async (
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

        if (!order) {
            return { success: false, statusCode: 404, message: "Order not found" };
        }

        if (order.userId !== userId) {
            return { success: false, statusCode: 403, message: "You are not authorized to cancel this order" };
        }

        const nonCancellable = ["SHIPPED", "DELIVERED", "CANCELLED"];
        if (nonCancellable.includes(order.status)) {
            return {
                success: false,
                statusCode: 400,
                message: `Order cannot be cancelled. It is already ${order.status.toLowerCase()}.`,
            };
        }

        await prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                await tx.sellerMedicine.update({
                    where: { id: item.sellerMedicineId },
                    data: {
                        stockQuantity: { increment: item.quantity },
                        isAvailable: true, 
                    },
                });
            }

            await tx.orderItem.updateMany({
                where: { orderId: orderId },
                data: { status: "CANCELLED" },
            });

            await tx.order.update({
                where: { id: orderId },
                data: { status: "CANCELLED" },
            });
        });

        return {
            success: true,
            statusCode: 200,
            message: "Order has been cancelled and stock has been rolled back.",
        };
    } catch (err: any) {
        return {
            success: false,
            statusCode: 500,
            message: err.message || "An error occurred while cancelling the order",
        };
    }
};

//================= SELLER ===============
export const getSellerOrders = async (sellerId: string): Promise<ServiceResponse> => {
    try {
        const rawOrders = await prisma.order.findMany({
            where: {
                items: { some: { sellerMedicine: { sellerId } } },
            },
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true, email: true, phone: true, image: true } },
                items: {

                    where: { sellerMedicine: { sellerId } },
                    include: {
                        sellerMedicine: { include: { medicine: true } },
                    },
                },
            },
        });

        const manipulatedData = rawOrders.map((order) => {

            const sellerSubtotal = order.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            const allItemStatus = order.items.map(i => i.status);

            const sellerBatchStatus = allItemStatus.every(s => s === allItemStatus[0])
                ? allItemStatus[0]
                : "PROCESSING";

            return {
                ...order,
                sellerSubtotal,
                batchStatus: sellerBatchStatus,
                itemCount: order.items.length
            };
        });

        return {
            success: true,
            statusCode: 200,
            message: "Seller-specific orders fetched",
            data: manipulatedData,
        };
    } catch (err: any) {
        return { success: false, statusCode: 500, message: err.message };
    }
};

export const updateSellerBatchStatus = async (
    orderId: string,
    sellerId: string,
    status: OrderStatus
) => {
    return await prisma.$transaction(async (tx) => {

        const updateCount = await tx.orderItem.updateMany({
            where: {
                orderId,
                sellerMedicine: { sellerId }
            },
            data: { status }
        });


        const allItems = await tx.orderItem.findMany({
            where: { orderId }
        });

        const isFullyDelivered = allItems.every(item => item.status === "DELIVERED");
        const isAnyShipped = allItems.some(item => item.status === "SHIPPED");


        let finalStatus: OrderStatus = "PROCESSING";
        if (isFullyDelivered) {
            finalStatus = "DELIVERED";
        } else if (isAnyShipped) {
            finalStatus = "SHIPPED";
        } else {
            finalStatus = "PROCESSING";
        }

        await tx.order.update({
            where: { id: orderId },
            data: { status: finalStatus }
        });

        return updateCount;
    });
};

// ================== ADMIN ====================
export const getAllOrdersAdmin = async (): Promise<ServiceResponse> => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                items: {
                    include: {
                        sellerMedicine: {
                            include: {
                                medicine: {
                                    select: {
                                        name: true,
                                        brandName: true,
                                        thumbnail: true
                                    }
                                },
                                seller: {
                                    select: {
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const formattedOrders = orders.flatMap((order) =>
            order.items.map((item) => ({
                orderId: order.id,
                orderDate: order.createdAt,
                customerName: order.user.name,
                customerEmail: order.user.email,
                customerPhone: order.user.phone || "N/A",

                // Product Details
                productName: item.sellerMedicine.medicine.name,
                brandName: item.sellerMedicine.medicine.brandName,
                thumbnail: item.sellerMedicine.medicine.thumbnail,

                // Seller Details
                sellerName: item.sellerMedicine.seller.name,
                sellerEmail: item.sellerMedicine.seller.email,

                // Pricing & Quantity
                quantity: item.quantity,
                unitPrice: item.price,
                subTotal: item.price * item.quantity,

                // Order Level Info
                orderTotal: order.total,
                shippingAddress: order.shippingAddress,
                paymentMethod: order.paymentMethod,
                itemStatus: item.status,
                overallStatus: order.status
            }))
        );

        return {
            success: true,
            statusCode: 200,
            message: "All orders retrieved and formatted for admin dashboard",
            data: formattedOrders,
        };
    } catch (err: any) {
        return {
            success: false,
            statusCode: 500,
            message: err.message || "An error occurred while fetching orders",
        };
    }
};


export const OrderServices = {
    placeOrder,
    getMyOrders,
    cancelOrder,
    getSellerOrders,
    updateSellerBatchStatus,
}
