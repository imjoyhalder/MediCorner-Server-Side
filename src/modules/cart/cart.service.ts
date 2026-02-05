import { prisma } from "../../lib/prisma";
import { AddToCartPayload } from "../../types/cart.types";

import { ServiceResponse } from "../../types/order.types";

export interface updateQuantity {
    sellerMedicineId: string,
    quantity: number
}

export const addToCart = async (userId: string, payload: AddToCartPayload): Promise<ServiceResponse> => {
    const { sellerMedicineId, quantity } = payload;

    if (quantity < 1) {
        return {
            success: false,
            statusCode: 400,
            message: "Quantity must be at least 1"
        };
    }

    let cart = await prisma.cart.findUnique(
        {
            where:
                { userId }
        });
    if (!cart) cart = await prisma.cart.create({ data: { userId } });

    const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, sellerMedicineId }
    });

    if (existingItem) {
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity }
        });
    } else {
        await prisma.cartItem.create({
            data: { cartId: cart.id, sellerMedicineId, quantity }
        });
    }

    return { success: true, statusCode: 200, message: "Added to cart" };
};

export const updateQuantity = async (userId: string, payload: updateQuantity): Promise<ServiceResponse> => {
    try {
        if (payload.quantity < 1) {
            return { success: false, statusCode: 400, message: "Quantity must be at least 1" };
        }

        let cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            return { success: false, statusCode: 404, message: "Cart not found" };
        }

        const item = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, sellerMedicineId: payload.sellerMedicineId  },
        });

        if (!item) {
            return { success: false, statusCode: 404, message: "Cart item not found" };
        }

        // Update quantity
        const updatedItem = await prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity: payload.quantity },
            include: {
                sellerMedicine: {
                    include: {
                        medicine: true,
                        seller: true,
                    },
                },
            },
        });

        return { success: true, statusCode: 200, message: "Quantity updated", data: updatedItem };
    } catch (error: any) {
        return { success: false, statusCode: 500, message: error.message || "Failed to update quantity" };
    }
}

export const getCart = async (userId: string): Promise<ServiceResponse> => {
    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items:
            {
                include:
                {
                    sellerMedicine:
                    {
                        include:
                        {
                            medicine: true,
                            seller: true
                        }
                    }
                }
            }
        }
    });

    if (!cart || cart.items.length === 0) return { success: false, statusCode: 404, message: "Cart is empty" };

    return { success: true, statusCode: 200, message: "Cart fetched", data: cart };
};

export const deleteCartItem = async (
    userId: string,
    cartItemId: string
): Promise<ServiceResponse> => {

   
    const cart = await prisma.cart.findUnique({
        where: { userId },
    });

    if (!cart) {
        return {
            success: false,
            statusCode: 404,
            message: "Cart not found",
        };
    }

    const cartItem = await prisma.cartItem.findFirst({
        where: {
            id: cartItemId,
            cartId: cart.id,
        },
    });

    if (!cartItem) {
        return {
            success: false,
            statusCode: 404,
            message: "Cart item not found",
        };
    }

    //  Delete item
    await prisma.cartItem.delete({
        where: { id: cartItemId },
    });

    return {
        success: true,
        statusCode: 200,
        message: "Item removed from cart",
    };
};
