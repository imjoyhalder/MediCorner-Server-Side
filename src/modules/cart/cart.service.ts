import { prisma } from "../../lib/prisma";
import { AddToCartPayload } from "../../types/cart.types";

import { ServiceResponse } from "../../types/order.types";

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

    //  User cart check
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

    //  Item belongs to this cart কিনা verify
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
