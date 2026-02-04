import { Request, Response, NextFunction } from "express";
import { sellerService } from "./seller.service";


const getSellerMedicines = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const sellerId = req.user?.id; 
        if (!sellerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const payload = req.query; 
        const result = await sellerService.getSellerMedicines(sellerId, payload);

        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

const getSellerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.user?.id;
        if (!sellerId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const result = await sellerService.getSellerStats(sellerId);
        res.status(result.statusCode).json(result);
    } catch (err) {
        next(err);
    }
};

const getSellerChartData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.user?.id;
        if (!sellerId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const result = await sellerService.getSellerChartData(sellerId);
        res.status(result.statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

export const sellerController = {
    getSellerMedicines,
    getSellerStats, 
    getSellerChartData
}