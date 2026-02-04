
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middlewares/auth";
import { ServiceResponse } from "../../types/order.types";

interface UpdateUserProfilePayload {
    name?: string;
    phone?: string;
    image?: string;
}

interface updateUserRole {
    // userId: string,
    email: string
    role: "CUSTOMER" | "SELLER";
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
            select: { name: true, phone: true, image: true, email: true },
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

export const updateUserRoleOnRegister = async (
    payload: updateUserRole
): Promise<ServiceResponse> => {
    try {
        const { email, role } = payload;

        const allowedRoles = ["CUSTOMER", "SELLER"];
        if (!allowedRoles.includes(role)) {
            return {
                success: false,
                statusCode: 400,
                message: "Invalid role. Only CUSTOMER or SELLER allowed",
            };
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: role },
        });

        return {
            success: true,
            statusCode: 200,
            message: "Profile create successfully",
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

export const getSingleCustomerData = async (
    userId: string
): Promise<ServiceResponse> => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }, 
            select: {
                id: true,
                phone: true
            }
        });

        if (!user) {
            return {
                success: false,
                statusCode: 404,
                message: "User not found",
            };
        }

        return {
            success: true,
            statusCode: 200,
            message: "Customer data retrieved successfully",
            data: user,
        };

    } catch (error: any) {
        return {
            success: false,
            statusCode: 500,
            message: error.message || "Failed to retrieve customer data",
        };
    }
};

export const userServices = {
    updateUserProfile,
    updateUserRoleOnRegister
}