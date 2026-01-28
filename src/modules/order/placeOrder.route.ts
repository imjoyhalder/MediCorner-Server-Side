import express, { Router } from "express"
import { orderController } from "./placeOrder.controller"
import auth, { UserRole } from "../../middlewares/auth";


const router = express.Router()

router.post('/', auth(UserRole.ADMIN, UserRole.SELLER, UserRole.CUSTOMER), orderController.placeOrder)

export const orderRouter: Router = router

