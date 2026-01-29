import express, { Router } from "express"
import { reviewController } from "./review.controller"
import auth, { UserRole } from "../../middlewares/auth"

const router = express.Router()

router.post('/',auth(UserRole.CUSTOMER), reviewController.createReview)

export const reviewRouter: Router = router 

