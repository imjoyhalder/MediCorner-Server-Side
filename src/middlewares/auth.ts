import { UserStatus } from "../../generated/prisma/enums"
import { auth as betterAuth } from "../lib/auth"
import { NextFunction, Request, Response } from "express"

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string,
                email: string,
                name: string,
                role: string,
                emailVerified: boolean,
                status: UserStatus
            }
        }
    }
}

export enum UserRole {
    CUSTOMER = "CUSTOMER",
    SELLER = "SELLER",
    ADMIN = "ADMIN"
}


export const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = await betterAuth.api.getSession({
                headers: req.headers as any,
            });

            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: "You are not authorized!",
                });
            }

            // if (!session.user.emailVerified) {
            //     return res.status(401).json({
            //         success: false,
            //         message: "Email verification required. Please verify your email!",
            //     });
            // }

            
            // Attach user to request
            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as UserRole,
                emailVerified: session.user.emailVerified,
                status: session.user.status as UserStatus,
            };


            // Always block banned users
            if (req.user.status === UserStatus.BAN) {
                return res.status(403).json({
                    success: false,
                    message: "Your account has been banned.",
                });
            }
            
            // Role-based access
            if (roles.length && !roles.includes(req.user.role as UserRole)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden! You don't have permission to access this resource",
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};


export default auth; 