import express, { Router } from "express"
import auth, { UserRole } from "../../middlewares/auth"
import { userController } from "./user.controller"


const router = express.Router()

router.put('/profile',auth(UserRole.CUSTOMER),userController.updateUserProfile)

export const userRouter: Router = router 

