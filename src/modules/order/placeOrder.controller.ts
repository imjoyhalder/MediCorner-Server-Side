// src/modules/order/order.controller.ts
import { Request, Response, NextFunction } from 'express';
import { OrderServices } from './placeOrder.service';

const placeOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id!;
        const payload = req.body;

        const result = await OrderServices.placeOrder(userId, payload);
        res.status(result.statusCode).json(result);
    } catch (error: any) {
        next(error);
    }
};

const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id!;
        const result = await OrderServices.getMyOrders(userId);
        res.status(result.statusCode).json(result);
    } catch (error: any) {
        next(error);
    }
};

const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id!;
        const orderId = req.params.id;
        const result = await OrderServices.cancelOrder(userId, orderId as string);
        res.status(result.statusCode).json(result);
    } catch (error: any) {
        next(error);
    }
};

const getSellerOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.user?.id!;
        const result = await OrderServices.getSellerOrders(sellerId);
        res.status(result.statusCode).json(result);
    } catch (error: any) {
        next(error);
    }
};

const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.user?.id!;
        const orderId = req.params.id;
        const status = req.body.status;
        const result = await OrderServices.updateOrderStatus(sellerId, orderId as string, status);
        res.status(result.statusCode).json(result);
    } catch (error: any) {
        next(error);
    }
};

const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await OrderServices.getAllOrders();
        res.status(result.statusCode).json(result);
    } catch (error: any) {
        next(error);
    }
};

export const orderController = {
    getAllOrders, 
    updateOrderStatus, 
    getSellerOrders, 
    cancelOrder, 
    getMyOrders, 
    placeOrder
}
