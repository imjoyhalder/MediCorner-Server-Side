
import { prisma } from "../../lib/prisma";
import { ServiceResponse } from "../../types/order.types";

interface UpdateUserProfilePayload {
    name?: string;
    phone?: string;
    image?: string;
}

const updateUserProfile = async (
    userId: string,
    payload: UpdateUserProfilePayload
): Promise<ServiceResponse> => {
    try {
        const { name, phone, image } = payload;

        // Update only allowed fields
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, phone, image },
            select: {  name: true, phone: true, image: true, email: true },
        });

        return {
            success: true,
            statusCode: 200,
            message: "Profile updated successfully",
            data: updatedUser,
        };
    } catch (error: any) {
        return {
            success: false,
            statusCode: 500,
            message: error.message || "Failed to update profile",
        };
    }
};

export const userServices = {
    updateUserProfile
}