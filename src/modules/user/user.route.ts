import express, { Router } from "express"
import auth, { UserRole } from "../../middlewares/auth"
import { userController } from "./user.controller"


const router = express.Router()

router.get('/single-user', auth(UserRole.CUSTOMER), userController.getSingleCustomerDataController)
router.patch('/update-profile', auth(UserRole.CUSTOMER), userController.updateUserProfile)
router.put('/role', auth(UserRole.CUSTOMER), userController.updateUserRole)

export const userRouter: Router = router

