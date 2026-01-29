import { Request, Response, NextFunction } from "express";
import { sellerService } from "./seller.service";



const getSellerMedicinesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const sellerId = req.user?.id; // from auth middleware
        if (!sellerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const payload = req.query; // filter, search, pagination from query
        const result = await sellerService.getSellerMedicines(sellerId, payload);

        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

export const sellerController = {
    getSellerMedicinesController
}