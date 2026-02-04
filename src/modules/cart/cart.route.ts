import { Router } from "express";
import {
    addToCartController,
    deleteCartItemController,
    getCartController,
    updateQuantityController,
} from "./cart.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// Add item to cart
router.post("/add", auth(UserRole.CUSTOMER), addToCartController);
router.get("/", auth(UserRole.CUSTOMER), getCartController);
router.patch("/", auth(UserRole.CUSTOMER), updateQuantityController);
router.delete("/", auth(UserRole.CUSTOMER), deleteCartItemController);

export const CartRouter = router;
