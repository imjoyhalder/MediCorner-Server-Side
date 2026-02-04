
import { Request, Response, NextFunction } from "express";
import { getSingleCustomerData, updateUserRoleOnRegister, userServices } from "./user.service";


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

export const updateUserRole = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, role } = req.body;

        const allowedRoles = ["CUSTOMER", "SELLER"];
        if (!email || !role || !allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid userId or role. Only CUSTOMER or SELLER allowed",
            });
        }

        const result = await updateUserRoleOnRegister({ email, role });
        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};


export const getSingleCustomerDataController = async (req: Request,
    res: Response,
    next: NextFunction) => {
    try {
        const userId = req.user?.id;


        const result = await getSingleCustomerData(userId as string)
        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
}

export const userController = {
    updateUserProfile,
    updateUserRole,
    getSingleCustomerDataController
}