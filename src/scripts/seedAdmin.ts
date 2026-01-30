import { error } from "node:console";
import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";

const seedAdmin = async () => {
    try {
        console.log("***** Admin seeding start *****");
        const adminData = {
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            role: UserRole.ADMIN,
            password: process.env.ADMIN_PASSWORD,
            emailVerified: true
        }

        // check user exist on bd or not 
        console.log("***** Check admin exist into DB or not ******");
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email as string
            }
        })

        if (existingUser) {
            throw new Error('User already exist in DB')
        }

        const signUpAdmin = await fetch("http://localhost:3000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(adminData)

        })

        if (signUpAdmin.ok) {
            console.log("***** Admin create *****");
            await prisma.user.update({
                where: {
                    email: adminData.email as string
                },
                data: {
                    emailVerified: true
                }
            })
            console.log("***** Admin email verification status update *****");
        }
        console.log('***** Success *****');


    } catch (error) {
        console.log(error);
    }
}
seedAdmin()