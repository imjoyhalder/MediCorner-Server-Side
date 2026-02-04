import { NextFunction, Request, Response } from "express";
import { reviewService } from "./review.service";

const createReview = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;  
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }


        req.body.userId = userId;

        const result = await reviewService.createReview(req.body);

        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

export const reviewController = {
    createReview
}