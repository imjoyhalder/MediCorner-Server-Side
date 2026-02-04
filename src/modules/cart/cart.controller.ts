import { Request, Response } from "express";
import * as CartService from "./cart.service";

export const addToCartController = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const payload = req.body;

        const result = await CartService.addToCart(userId, payload);

        return res.status(result.statusCode).json(result);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to add to cart",
        });
    }
};

export const getCartController = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;

        const result = await CartService.getCart(userId);

        return res.status(result.statusCode).json(result);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch cart",
        });
    }
};

export const updateQuantityController = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const result = await CartService.updateQuantity(userId, req.body);

        return res.status(result.statusCode).json(result);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update quantity!",
        });
    }
}

export const deleteCartItemController = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { cartItemId } = req.body;

        const result = await CartService.deleteCartItem(userId, cartItemId as string);

        return res.status(result.statusCode).json(result);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to remove cart item",
        });
    }
};
