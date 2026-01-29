import { NextFunction, Request, Response } from "express";
import { adminServices } from "./admin.service";


const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await adminServices.getUsers()
        res.status(200).json({ result })
    } catch (error) {

    }
}

const banUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params
        const result = await adminServices.banUser(userId as string)
        res.status(200).json({
            result
        })
    } catch (error) {
        next(error)
    }
}

const getAdminChartData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await adminServices.getAdminChartData();
        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

export const userController = {
    getUsers,
    banUser, 
    getAdminChartData
}