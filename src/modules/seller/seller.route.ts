import express, { Router } from "express"
import auth, { UserRole } from "../../middlewares/auth"
import { sellerController } from "./seller.controller"

const router = express.Router()

router.get('/medicine',auth(UserRole.SELLER), sellerController.getSellerMedicines)
router.get('/stats',auth(UserRole.SELLER), sellerController.getSellerStats)
router.get('/statistics',auth(UserRole.SELLER), sellerController.getSellerChartData)

export const sellerRouter: Router = router 

