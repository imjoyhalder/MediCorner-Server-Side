import express, { Router } from "express"

import auth, { UserRole } from "../../middlewares/auth";
import { orderController } from "./placeOrder.controller";


const router = express.Router()

// User
router.post('/', auth(UserRole.CUSTOMER), orderController.placeOrder);
router.get('/me', auth(UserRole.CUSTOMER), orderController.getMyOrders);
router.patch('/cancel/:id', auth(UserRole.CUSTOMER), orderController.cancelOrder);

// Seller
router.get('/seller', auth(UserRole.SELLER), orderController.getSellerOrders);
router.patch('/seller/:id/status', auth(UserRole.SELLER), orderController.updateOrderStatus);

// Admin
router.get('/all', auth(UserRole.ADMIN), orderController.getAllOrders);


export const orderRouter: Router = router

