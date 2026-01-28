
import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";


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
    payload: CreateOrderPayload
) => {
    const { shippingAddress, items } = payload;

    if (!items.length) {
        throw new AppError(400, "Order items required");
    }

    let total = 0;

    //  Validate & calculate
    const orderItemsData: OrderItemData[] = [];

    for (const item of items) {
        const sellerMedicine = await prisma.sellerMedicine.findUnique({
            where: { id: item.sellerMedicineId },
        });

        if (!sellerMedicine || !sellerMedicine.isAvailable) {
            throw new AppError(404, "Medicine not available");
        }

        if (sellerMedicine.stockQuantity < item.quantity) {
            throw new AppError(400, "Insufficient stock");
        }

        total += sellerMedicine.price * item.quantity;

        orderItemsData.push({
            sellerMedicineId: sellerMedicine.id,
            price: sellerMedicine.price,
            quantity: item.quantity,
        });
    }

    //  Transaction (VERY IMPORTANT)
    const order = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
            data: {
                userId,
                total,
                shippingAddress,
                items: {
                    create: orderItemsData,
                },
            },
            include: {
                items: true,
            },
        });

        // reduce stock
        for (const item of items) {
            await tx.sellerMedicine.update({
                where: { id: item.sellerMedicineId },
                data: {
                    stockQuantity: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        return createdOrder;
    });

    return order;
};

export const OrderServices = {
    placeOrder
}
