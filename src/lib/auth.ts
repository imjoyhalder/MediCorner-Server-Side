
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path
// import { PrismaClient } from "@/generated/prisma/client";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                default: "CUSTOMER",
                required: false
            },
            status: {
                type: "string",
                default: "ACTIVE",
                required: false
            },
            phone: {
                type: "string",
                required: false
            }

        }
    }
});


// import "dotenv/config";
// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "../../generated/prisma/client";

// const connectionString = process.env.DATABASE_URL!;

// const adapter = new PrismaPg({ connectionString });
// const authPrisma = new PrismaClient({ adapter });

// export const auth = betterAuth({
//     database: prismaAdapter(authPrisma, {
//         provider: "postgresql",
//     }),

//     emailAndPassword: {
//         enabled: true,
//     },

//     user: {
//         additionalFields: {
//             role: {
//                 type: "string",
//                 default: "CUSTOMER",
//             },
//             status: {
//                 type: "string",
//                 default: "ACTIVE",
//             },
//             phone: {
//                 type: "string",
//             },
//         },
//     },
// });
