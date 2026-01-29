
import { Request, Response, NextFunction } from "express";
import { userServices } from "./user.service";


const updateUserProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const result = await userServices.updateUserProfile(userId, req.body);
        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

export const userController = {
    updateUserProfile
}