import { NextFunction, Request, Response } from "express";
import { reviewService } from "./review.service";

const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const userId = req?.user

        req.body.userId = userId

        const result = await reviewService.createReview(req.body)
        res.status(200).json({result})
    }
    catch (error) {
        next(error)
    }
}


export const reviewController = {
    createReview
}