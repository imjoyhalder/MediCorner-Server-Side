import { Request, Response, NextFunction } from 'express';
import { OrderServices } from './placeOrder.service';
import { AppError } from '../../errors/AppError';
// import { OrderServices } from './order.service';

/**
 * PLACE ORDER (User)
 */
const placeOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, 'Unauthorized');
        }

        const payload = req.body;

        if (!payload?.cartId) {
            throw new AppError(400, 'Cart ID is required');
        }

        const result = await OrderServices.placeOrder(userId, payload);
        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * GET MY ORDERS (User)
 */
const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, 'Unauthorized');
        }

        const result = await OrderServices.getMyOrders(userId);
        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * CANCEL ORDER (User)
 */
const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const orderId = req.params.id;

        if (!userId) {
            throw new AppError(401, 'Unauthorized');
        }

        if (!orderId) {
            throw new AppError(400, 'Order ID is required');
        }

        const result = await OrderServices.cancelOrder(userId, orderId as string);
        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * GET SELLER ORDERS (Seller)
 */
const getSellerOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.user?.id;
        if (!sellerId) {
            throw new AppError(401, 'Unauthorized');
        }

        const result = await OrderServices.getSellerOrders(sellerId);
        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * UPDATE ORDER STATUS (Seller)
 */
const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.user?.id;
        const orderId = req.params.id;
        const { status } = req.body;

        if (!sellerId) {
            throw new AppError(401, 'Unauthorized');
        }

        if (!orderId) {
            throw new AppError(400, 'Order ID is required');
        }

        if (!status) {
            throw new AppError(400, 'Order status is required');
        }

        const result = await OrderServices.updateOrderStatus(
            sellerId,
            orderId as string,
            status
        );

        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * GET ALL ORDERS (Admin)
 */
const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await OrderServices.getAllOrders();
        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

export const OrderController = {
    placeOrder,
    getMyOrders,
    cancelOrder,
    getSellerOrders,
    updateOrderStatus,
    getAllOrders,
};
