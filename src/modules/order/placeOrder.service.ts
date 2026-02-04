

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
                                medicine: true, // for medicine name
                            },
                        },
                    },
                },
            },
        });

        // Map to summary
        const summary: OrderSummary[] = orders.map((order) => ({
            orderId: order.id,
            status: order.status,
            total: order.total,
            medicines: order.items.map((item) => ({
                name: item.sellerMedicine.medicine.name,
                medicineId: item.sellerMedicine.medicine.id,
                price: item.price,
                quantity: item.quantity,
            })),
        }));

        return {
            success: true,
            statusCode: 200,
            message: "Orders summary fetched",
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
export const getAllOrders = async (): Promise<ServiceResponse> => {
    try {
        // Fetch delivered order items with seller info
        const orderItems = await prisma.orderItem.findMany({
            where: {
                status: OrderStatus.DELIVERED,
            },
            include: {
                sellerMedicine: {
                    include: {
                        seller: true,
                    },
                },
            },
        });

        const summaryMap: Record<string, SellerSummaryItem & { orderIds: Set<string> }> = {};

        for (const item of orderItems) {
            const seller = item.sellerMedicine.seller;
            const sellerId = seller.id;

            if (!summaryMap[sellerId]) {
                summaryMap[sellerId] = {
                    sellerId,
                    sellerName: seller.name,
                    totalOrders: 0,
                    totalProductsSold: 0,
                    totalRevenue: 0,
                    orderIds: new Set(), // unique order count
                };
            }

            summaryMap[sellerId].totalProductsSold += item.quantity;
            summaryMap[sellerId].totalRevenue += item.price * item.quantity;
            summaryMap[sellerId].orderIds.add(item.orderId);
        }

        // Convert Set size → totalOrders
        const summaryArray = Object.values(summaryMap).map(
            ({ orderIds, ...rest }) => ({
                ...rest,
                totalOrders: orderIds.size,
            })
        );

        return {
            success: true,
            statusCode: 200,
            message: "Seller summary fetched successfully",
            data: summaryArray,
        };
    } catch (err: any) {
        return {
            success: false,
            statusCode: 500,
            message: err.message || "Failed to fetch seller summary",
        };
    }
};

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
                itemStatus: item.status, // individual item status
                overallStatus: order.status // overall order status
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
    getAllOrders,
    updateOrderStatus,
    getSellerOrders
}
