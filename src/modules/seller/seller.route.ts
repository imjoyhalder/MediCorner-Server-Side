import express, { Router } from "express"
import auth, { UserRole } from "../../middlewares/auth"
import { sellerController } from "./seller.controller"

const router = express.Router()

router.get('/medicine',auth(UserRole.SELLER), sellerController.getSellerMedicines)
router.get('/stats',auth(UserRole.SELLER), sellerController.getSellerStats)

export const sellerRouter: Router = router 

