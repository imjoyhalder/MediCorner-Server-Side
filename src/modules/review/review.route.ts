import express, { Router } from "express"
import { reviewController } from "./review.controller"

const router = express.Router()

router.post('/', reviewController.createReview)

export const reviewRouter: Router = router 

