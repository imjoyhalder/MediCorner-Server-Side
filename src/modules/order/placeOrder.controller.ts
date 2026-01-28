import { NextFunction, Request, Response } from "express";
import { AppError } from "../../errors/AppError";
import { OrderServices } from "./placeOrder.service";

const placeOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, "Unauthorized");
        }

        const result = await OrderServices.placeOrder(
            req.user.id,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Order placed successfully (Cash on Delivery)",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const orderController = {
    placeOrder
}