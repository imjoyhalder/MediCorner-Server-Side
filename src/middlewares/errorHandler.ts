import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

const errorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = "Internal Server Error";

    // Prisma Validation Error
    if (error instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = "Invalid data provided";
    }

    // Prisma Known Errors
    else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                statusCode = 409;
                message = "Duplicate value. This record already exists.";
                break;

            case "P2003":
                statusCode = 400;
                message = "Invalid reference (foreign key constraint failed)";
                break;

            case "P2025":
                statusCode = 404;
                message = "Record not found";
                break;
        }
    }

    // Prisma Unknown Error
    else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = 500;
        message = "Unknown database error occurred";
    }

    // Prisma Rust Panic
    else if (error instanceof Prisma.PrismaClientRustPanicError) {
        statusCode = 500;
        message = "Database engine crashed";
    }

    // Prisma Init Error
    else if (error instanceof Prisma.PrismaClientInitializationError) {
        if (error.errorCode === "P1000") {
            statusCode = 401;
            message = "Database authentication failed";
        }

        if (error.errorCode === "P1001") {
            statusCode = 503;
            message = "Database server unreachable";
        }
    }

    res.status(statusCode).json({
        success: false,
        message,
        error:
            process.env.NODE_ENV === "development"
                ? error.message
                : undefined,
    });
};

export default errorHandler;
