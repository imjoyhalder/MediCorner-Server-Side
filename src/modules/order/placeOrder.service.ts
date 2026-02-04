

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


//================= SELLER ===============
export const getSellerOrders = async (sellerId: string): Promise<ServiceResponse> => {
    try {
        const rawOrders = await prisma.order.findMany({
            where: {
                // Shudhu oi order gulo nibe jekhane ei seller-er ontoto ekta item ache
                items: { some: { sellerMedicine: { sellerId } } },
            },
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true, email: true, phone: true, image: true } },
                items: {
                    // Critical: Filter items so the seller ONLY sees their own products
                    where: { sellerMedicine: { sellerId } },
                    include: {
                        sellerMedicine: { include: { medicine: true } },
                    },
                },
            },
        });

        const manipulatedData = rawOrders.map((order) => {
            // Calculate seller-specific subtotal
            const sellerSubtotal = order.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            // Determine Batch Status for THIS Seller only
            // Jehetu upore 'items' filter kora, ekhane shudhu ei seller-er item-i ache
            const allItemStatus = order.items.map(i => i.status);

            // Jodi seller-er shob item 'DELIVERED' hoy, seller tar dashboard-e 'DELIVERED' dekhbe
            const sellerBatchStatus = allItemStatus.every(s => s === allItemStatus[0])
                ? allItemStatus[0]
                : "PROCESSING"; // Default jodi status different hoy (e.g. 1ta Shipped, 1ta Pending)

            return {
                ...order,
                sellerSubtotal,
                batchStatus: sellerBatchStatus, // Seller-er nijer item-er grouped status
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
        // 1. First, update items belonging ONLY to this seller
        const updateCount = await tx.orderItem.updateMany({
            where: {
                orderId,
                sellerMedicine: { sellerId }
            },
            data: { status }
        });

        // 2. Check if ALL items in this order (from all sellers) are now delivered
        const allItems = await tx.orderItem.findMany({
            where: { orderId }
        });

        const isFullyDelivered = allItems.every(item => item.status === "DELIVERED");
        const isAnyShipped = allItems.some(item => item.status === "SHIPPED");

        // 3. Update the main Order status for the Customer
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
    getSellerOrders,
    updateSellerBatchStatus,
}
