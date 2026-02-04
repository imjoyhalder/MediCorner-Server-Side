import express, { Router } from "express"

import auth, { UserRole } from "../../middlewares/auth";
import { OrderController } from "./placeOrder.controller";

const router = express.Router()

// User
router.post('/', auth(UserRole.CUSTOMER), OrderController.placeOrder);
router.get('/my-orders', auth(UserRole.CUSTOMER), OrderController.getMyOrders);
router.patch('/my-orders/cancel/:id', auth(UserRole.CUSTOMER), OrderController.cancelOrder);

// Seller
router.get('/seller', auth(UserRole.SELLER), OrderController.getSellerOrders);
router.patch('/seller/batch-status', auth(UserRole.SELLER), OrderController.updateBatchStatus);

// Admin
router.get('/all/admin', auth(UserRole.ADMIN), OrderController.getAllOrdersForAdmin);

export const orderRouter: Router = router

