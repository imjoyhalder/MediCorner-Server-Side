import { ServiceResponse } from '../../types/order.types';
import { prisma } from './../../lib/prisma';


const createReview = async (payload: {
    rating?: number;
    comment: string;
    userId: string;
    medicineId: string;
}): Promise<ServiceResponse> => {
    try {
        const { userId, medicineId, rating, comment } = payload;

        //  Check if user has purchased this medicine and order is DELIVERED
        const purchased = await prisma.orderItem.findFirst({
            where: {
                order: {
                    userId,
                    status: "DELIVERED",
                },
                sellerMedicine: {
                    medicineId,
                },
            },
        });

        if (!purchased) {
            return {
                success: false,
                statusCode: 403,
                message: "You can only review medicines you have purchased and received",
            };
        }

        //  Optional: prevent duplicate review for same medicine
        const existingReview = await prisma.review.findFirst({
            where: {
                userId,
                medicineId,
            },
        });

        if (existingReview) {
            return {
                success: false,
                statusCode: 400,
                message: "You have already reviewed this medicine",
            };
        }

        //  Create review
        const review = await prisma.review.create({
            data: {
                rating,
                comment,
                userId,
                medicineId,
            },
        });

        return {
            success: true,
            statusCode: 201,
            message: "Review created successfully",
            data: review,
        };
    } catch (err: any) {
        return {
            success: false,
            statusCode: 500,
            message: err.message || "Failed to create review",
        };
    }
};

export const reviewService = {
    createReview,
};

