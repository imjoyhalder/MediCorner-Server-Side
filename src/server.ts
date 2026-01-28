import { Request, Response } from "express";
import app from "./app";
import { prisma } from "./lib/prisma";

const port = process.env.PORT || 5000
const main = async () => {
    try {

        await prisma.$connect();
        console.log('Connected to the database successfully');

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        })

    } catch (error) {
        console.log('An error occurred: ', error);
        await prisma.$disconnect();
        process.exit(1)
    }
}

main()