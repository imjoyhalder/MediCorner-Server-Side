import express, { Router } from "express"

import auth, { UserRole } from "../../middlewares/auth";
import { OrderController } from "./placeOrder.controller";

const router = express.Router()

// User
router.post('/', auth(UserRole.CUSTOMER), OrderController.placeOrder);
router.get('/me', auth(UserRole.CUSTOMER), OrderController.getMyOrders);
router.patch('/cancel/:id', auth(UserRole.CUSTOMER), OrderController.cancelOrder);

// Seller
router.get('/seller', auth(UserRole.SELLER), OrderController.getSellerOrders);
router.patch('/seller/:id/status', auth(UserRole.SELLER), OrderController.updateOrderStatus);

// Admin
router.get('/all', auth(UserRole.ADMIN), OrderController.getAllOrders);

export const orderRouter: Router = router

