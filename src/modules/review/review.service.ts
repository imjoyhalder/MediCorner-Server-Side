import { prisma } from './../../lib/prisma';


const createReview = async (payload: {
    rating?: number
    comment: string
    userId: string
    medicineId: string
}) => {
    const result = await prisma.review.create({
        data: {
            rating: payload.rating,
            comment: payload.comment,
            userId: payload.userId,
            medicineId: payload.medicineId,
        },
    })

    
    return result
}


export const reviewService = {
    createReview
}