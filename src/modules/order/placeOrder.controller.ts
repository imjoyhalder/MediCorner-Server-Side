import { Request, Response, NextFunction } from 'express';
import { OrderServices, getAllOrdersAdmin, updateSellerBatchStatus } from './placeOrder.service';
import { AppError } from '../../errors/AppError';
import { OrderStatus } from '../../../generated/prisma/enums';
// import { OrderServices } from './order.service';



// ============== CUSTOMER ===============

const placeOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, 'Unauthorized');
        }

        const payload = req.body;

        // if (!payload?.cartId) {
        //     throw new AppError(400, 'Cart ID is required');
        // }

        const result = await OrderServices.placeOrder(userId, payload);
        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};


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




// ========== SELLER ==========
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

//UPDATE ORDER STATUS (Seller)
export const updateBatchStatus = async (req: Request, res: Response) => {
    try {
        const { orderId, status } = req.body;
        const sellerId = req.user?.id; 

        if (!orderId || !status) {
            return res.status(400).json({
                success: false,
                message: "Order ID and Status are required",
            });
        }
        const validStatuses = Object.values(OrderStatus);
        if (!validStatuses.includes(status as OrderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
            });
        }

        if (!sellerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Seller identity missing",
            });
        }

        const result = await updateSellerBatchStatus(orderId, sellerId, status as OrderStatus);

        if (result.count === 0) {
            return res.status(404).json({
                success: false,
                message: "No order items found for this seller in this order",
            });
        }

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: `Successfully updated ${result.count} items to ${status}`,
            data: result,
        });

    } catch (error: any) {
        console.error("Batch Status Update Error:", error);
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message || "Internal server error",
        });
    }
};




// ============= ADMIN ===================
const getAllOrdersForAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getAllOrdersAdmin();

        res.status(result.statusCode).json(result);
    } catch (error) {

        next(error);
    }
};

// const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const result = await OrderServices.getAllOrders();
//         res.status(result.statusCode).json(result);
//     } catch (error) {
//         next(error);
//     }
// };

export const OrderController = {
    placeOrder,
    getMyOrders,
    cancelOrder,
    getSellerOrders,
    updateBatchStatus,
    getAllOrdersForAdmin
};
