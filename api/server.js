// src/app.ts
import express8 from "express";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum UserRole {\n  CUSTOMER\n  SELLER\n  ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  BAN\n}\n\nenum OrderStatus {\n  PROCESSING\n  SHIPPED\n  DELIVERED\n  CANCELLED\n}\n\nmodel User {\n  id            String    @id\n  name          String\n  email         String\n  emailVerified Boolean   @default(false)\n  image         String?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n\n  role   UserRole?   @default(CUSTOMER)\n  phone  String?\n  status UserStatus? @default(ACTIVE)\n\n  // business relations\n  cart        Cart?\n  orders      Order[]\n  reviews     Review[]\n  sellerItems SellerMedicine[]\n  adminLogs   AdminLog[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel MedicineCategory {\n  id   String @id @default(uuid())\n  name String\n  slug String @unique\n\n  medicines Medicine[]\n}\n\nmodel Medicine {\n  id           String  @id @default(uuid())\n  name         String\n  brandName    String\n  genericName  String?\n  manufacturer String?\n  description  String?\n  isOtc        Boolean @default(true)\n  thumbnail    String?\n\n  categoryId String\n  category   MedicineCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n\n  sellers SellerMedicine[]\n  reviews Review[]\n}\n\nmodel SellerMedicine {\n  id            String    @id @default(uuid())\n  price         Int\n  stockQuantity Int       @default(0)\n  expiryDate    DateTime?\n  batchNumber   String\n  isAvailable   Boolean   @default(true)\n\n  sellerId String\n  seller   User   @relation(fields: [sellerId], references: [id])\n\n  medicineId String\n  medicine   Medicine @relation(fields: [medicineId], references: [id], onDelete: Cascade)\n\n  cartItems  CartItem[]\n  orderItems OrderItem[]\n\n  @@unique([sellerId, medicineId])\n}\n\n/// CART\n\nmodel Cart {\n  id     String @id @default(uuid())\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  items CartItem[]\n}\n\nmodel CartItem {\n  id       String @id @default(uuid())\n  quantity Int\n\n  cartId String\n  cart   Cart   @relation(fields: [cartId], references: [id], onDelete: Cascade)\n\n  sellerMedicineId String\n  sellerMedicine   SellerMedicine @relation(fields: [sellerMedicineId], references: [id])\n\n  @@unique([cartId, sellerMedicineId])\n}\n\n/// ORDER\n\nmodel Order {\n  id              String      @id @default(uuid())\n  total           Int\n  status          OrderStatus @default(PROCESSING)\n  shippingAddress String\n  paymentMethod   String      @default("COD")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  userId String\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  items OrderItem[]\n\n  @@map("order")\n}\n\nmodel OrderItem {\n  id       String      @id @default(uuid())\n  price    Int\n  quantity Int\n  status   OrderStatus @default(PROCESSING)\n\n  orderId String\n  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)\n\n  sellerMedicineId String\n  sellerMedicine   SellerMedicine @relation(fields: [sellerMedicineId], references: [id])\n}\n\n/// REVIEW\n\nmodel Review {\n  id      String @id @default(uuid())\n  rating  Int?\n  comment String\n\n  userId String\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  medicineId String\n  medicine   Medicine @relation(fields: [medicineId], references: [id])\n\n  createdAt DateTime @default(now())\n}\n\n/// ADMIN LOG\n\nmodel AdminLog {\n  id       String @id @default(uuid())\n  action   String\n  entity   String\n  entityId String\n\n  adminId String\n  admin   User   @relation(fields: [adminId], references: [id])\n\n  createdAt DateTime @default(now())\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"phone","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"cart","kind":"object","type":"Cart","relationName":"CartToUser"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"sellerItems","kind":"object","type":"SellerMedicine","relationName":"SellerMedicineToUser"},{"name":"adminLogs","kind":"object","type":"AdminLog","relationName":"AdminLogToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"MedicineCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"medicines","kind":"object","type":"Medicine","relationName":"MedicineToMedicineCategory"}],"dbName":null},"Medicine":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"brandName","kind":"scalar","type":"String"},{"name":"genericName","kind":"scalar","type":"String"},{"name":"manufacturer","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"isOtc","kind":"scalar","type":"Boolean"},{"name":"thumbnail","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"MedicineCategory","relationName":"MedicineToMedicineCategory"},{"name":"sellers","kind":"object","type":"SellerMedicine","relationName":"MedicineToSellerMedicine"},{"name":"reviews","kind":"object","type":"Review","relationName":"MedicineToReview"}],"dbName":null},"SellerMedicine":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Int"},{"name":"stockQuantity","kind":"scalar","type":"Int"},{"name":"expiryDate","kind":"scalar","type":"DateTime"},{"name":"batchNumber","kind":"scalar","type":"String"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"sellerId","kind":"scalar","type":"String"},{"name":"seller","kind":"object","type":"User","relationName":"SellerMedicineToUser"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"MedicineToSellerMedicine"},{"name":"cartItems","kind":"object","type":"CartItem","relationName":"CartItemToSellerMedicine"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"OrderItemToSellerMedicine"}],"dbName":null},"Cart":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"CartToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"items","kind":"object","type":"CartItem","relationName":"CartToCartItem"}],"dbName":null},"CartItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"cartId","kind":"scalar","type":"String"},{"name":"cart","kind":"object","type":"Cart","relationName":"CartToCartItem"},{"name":"sellerMedicineId","kind":"scalar","type":"String"},{"name":"sellerMedicine","kind":"object","type":"SellerMedicine","relationName":"CartItemToSellerMedicine"}],"dbName":null},"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"total","kind":"scalar","type":"Int"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"shippingAddress","kind":"scalar","type":"String"},{"name":"paymentMethod","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"OrderToUser"},{"name":"items","kind":"object","type":"OrderItem","relationName":"OrderToOrderItem"}],"dbName":"order"},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Int"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderItem"},{"name":"sellerMedicineId","kind":"scalar","type":"String"},{"name":"sellerMedicine","kind":"object","type":"SellerMedicine","relationName":"OrderItemToSellerMedicine"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"MedicineToReview"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"AdminLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"action","kind":"scalar","type":"String"},{"name":"entity","kind":"scalar","type":"String"},{"name":"entityId","kind":"scalar","type":"String"},{"name":"adminId","kind":"scalar","type":"String"},{"name":"admin","kind":"object","type":"User","relationName":"AdminLogToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var UserRole = {
  CUSTOMER: "CUSTOMER",
  SELLER: "SELLER",
  ADMIN: "ADMIN"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  BAN: "BAN"
};
var OrderStatus = {
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS
  }
});
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins: [process.env.APP_URL],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false
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
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"MediCorner" <medicroner@gmail.com>',
          to: user.email,
          subject: "Please verify email",
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification | MediCorner</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#0ea5e9; padding:24px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:26px;">
                \u{1F48A} MediCorner
              </h1>
              <p style="margin:6px 0 0; color:#e0f2fe; font-size:14px;">
                Your Trusted Online Medicine Corner
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px; color:#1f2937;">
              <h2 style="margin-top:0; font-size:22px;">
                Verify your email address
              </h2>

              <p style="font-size:15px; line-height:1.7;">
                Hi <b>${user.name ?? "there"}</b>,<br /><br />
                Welcome to <b>MediCorner</b> \u{1F44B}  
                Please confirm your email address to activate your account and get full access to our platform.
              </p>

              <!-- Button -->
              <div style="text-align:center; margin:32px 0;">
                <a href="${verificationUrl}"
                  style="background:#0ea5e9; color:#ffffff; text-decoration:none; padding:14px 34px;
                         font-size:16px; border-radius:8px; display:inline-block;">
                  Verify Email
                </a>
              </div>

              <p style="font-size:14px; color:#4b5563; line-height:1.6;">
                If the button doesn\u2019t work, copy and paste the link below into your browser:
              </p>

              <p style="word-break:break-all; font-size:13px; color:#0ea5e9;">
                ${verificationUrl}
              </p>

              <p style="font-size:14px; color:#6b7280; margin-top:28px;">
                If you didn\u2019t create a MediCorner account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding:16px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} MediCorner. All rights reserved.
              </p>
              <p style="margin:4px 0 0; font-size:12px; color:#9ca3af;">
                OTC medicines only \xB7 Safe \xB7 Reliable \xB7 Trusted
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`
        });
        console.log("Message sent:", info.messageId);
      } catch (error) {
        console.log({ error });
        throw error;
      }
    }
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  }
});

// src/app.ts
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

// src/modules/medicine/medicine.route.ts
import express from "express";

// src/modules/medicine/medicine.service.ts
var addMedicineWithInventory = async (sellerId, payload) => {
  const {
    name,
    brandName,
    categoryId,
    price,
    batchNumber
  } = payload;
  if (!name || !brandName || !categoryId || !price || !batchNumber) {
    return {
      success: false,
      statusCode: 400,
      message: "Required fields are missing",
      data: null
    };
  }
  return prisma.$transaction(async (tx) => {
    const category = await tx.medicineCategory.findUnique({
      where: { id: categoryId }
    });
    if (!category) {
      return {
        success: false,
        statusCode: 400,
        message: "Invalid categoryId",
        data: null
      };
    }
    let medicine = await tx.medicine.findFirst({
      where: { name, brandName }
    });
    if (!medicine) {
      medicine = await tx.medicine.create({
        data: {
          name,
          brandName,
          genericName: payload.genericName,
          manufacturer: payload.manufacturer,
          description: payload.description,
          categoryId,
          isOtc: true
        }
      });
    }
    const alreadyAdded = await tx.sellerMedicine.findFirst({
      where: {
        sellerId,
        medicineId: medicine.id
      }
    });
    if (alreadyAdded) {
      return {
        success: false,
        statusCode: 409,
        message: "Medicine already added by this seller",
        data: null
      };
    }
    const inventory = await tx.sellerMedicine.create({
      data: {
        sellerId,
        medicineId: medicine.id,
        price,
        stockQuantity: payload.stockQuantity ?? 0,
        batchNumber,
        expiryDate: payload.expiryDate,
        isAvailable: true
      }
    });
    return {
      success: true,
      statusCode: 201,
      message: "Medicine added successfully",
      data: { medicine, inventory }
    };
  });
};
var getAllMedicines = async (payload) => {
  const {
    search,
    categoryId,
    manufacturer,
    minPrice,
    maxPrice,
    page,
    limit,
    sortBy,
    sortOrder
  } = payload;
  const andConditions = [];
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { brandName: { contains: search, mode: "insensitive" } },
        { genericName: { contains: search, mode: "insensitive" } }
      ]
    });
  }
  if (categoryId && categoryId !== "all") andConditions.push({ categoryId });
  if (manufacturer && manufacturer !== "all") {
    andConditions.push({
      manufacturer: { contains: manufacturer, mode: "insensitive" }
    });
  }
  const min = minPrice ? Number(minPrice) : void 0;
  const max = maxPrice ? Number(maxPrice) : void 0;
  if (min !== void 0 || max !== void 0) {
    andConditions.push({
      sellers: {
        some: {
          price: {
            ...min !== void 0 && { gte: min },
            ...max !== void 0 && { lte: max }
          }
        }
      }
    });
  }
  const validSortFields = ["name", "brandName", "manufacturer", "id"];
  const activeSortBy = validSortFields.includes(sortBy) ? sortBy : "name";
  const activeSortOrder = sortOrder === "desc" ? "desc" : "asc";
  const take = Number(limit) || 12;
  const skip = (Number(page || 1) - 1) * take;
  const data = await prisma.medicine.findMany({
    take,
    skip,
    where: andConditions.length > 0 ? { AND: andConditions } : {},
    orderBy: { [activeSortBy]: activeSortOrder },
    include: {
      category: true,
      reviews: true,
      sellers: {
        select: {
          id: true,
          price: true,
          expiryDate: true,
          stockQuantity: true,
          sellerId: true
        }
      }
    }
  });
  const total = await prisma.medicine.count({
    where: andConditions.length > 0 ? { AND: andConditions } : {}
  });
  return {
    success: true,
    statusCode: 200,
    message: "Medicines fetched successfully",
    data,
    pagination: {
      total,
      page: Number(page) || 1,
      limit: take,
      totalPages: Math.ceil(total / take)
    }
  };
};
var getSingleMedicine = async (id) => {
  if (!id) {
    return {
      success: false,
      statusCode: 400,
      message: "Medicine id is required",
      data: null
    };
  }
  const medicine = await prisma.medicine.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: true,
      sellers: true
    }
  });
  if (!medicine) {
    return {
      success: false,
      statusCode: 404,
      message: "Medicine not found",
      data: null
    };
  }
  return {
    success: true,
    statusCode: 200,
    message: "Medicine fetched successfully",
    data: medicine
  };
};
var updateMedicine = async (medicineId, sellerId, payload) => {
  return await prisma.$transaction(async (tx) => {
    console.log(medicineId);
    const sellerMedicine = await tx.sellerMedicine.findFirst({
      where: { medicineId, sellerId }
    });
    console.log(sellerMedicine);
    if (!sellerMedicine) {
      return {
        success: false,
        statusCode: 404,
        message: "Medicine not found in your inventory",
        data: null
      };
    }
    const updatedInventory = await tx.sellerMedicine.update({
      where: { id: sellerMedicine.id },
      data: {
        price: payload.price ?? sellerMedicine.price,
        stockQuantity: payload.stockQuantity ?? sellerMedicine.stockQuantity,
        batchNumber: payload.batchNumber ?? sellerMedicine.batchNumber,
        isAvailable: payload.isAvailable ?? sellerMedicine.isAvailable
      }
    });
    const updatedMedicine = await tx.medicine.update({
      where: { id: medicineId },
      data: {
        name: payload.name,
        brandName: payload.brandName,
        genericName: payload.genericName,
        manufacturer: payload.manufacturer,
        description: payload.description
      },
      include: {
        category: true,
        sellers: {
          where: { sellerId }
        }
      }
    });
    return {
      success: true,
      statusCode: 200,
      message: "Medicine updated successfully",
      data: updatedMedicine
    };
  });
};
var deleteMedicine = async (medicineId, sellerId) => {
  const sellerMedicine = await prisma.sellerMedicine.findFirst({
    where: { medicineId, sellerId }
  });
  if (!sellerMedicine) {
    return {
      success: false,
      statusCode: 404,
      message: "Medicine not found in your inventory",
      data: null
    };
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({
        where: { sellerMedicineId: sellerMedicine.id }
      });
      await tx.sellerMedicine.delete({
        where: { id: sellerMedicine.id }
      });
    });
    return {
      success: true,
      statusCode: 200,
      message: "Medicine removed from your inventory successfully",
      data: null
    };
  } catch (error) {
    console.error("Delete error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to delete. This medicine might be linked to an order history.",
      data: null
    };
  }
};
var getAllManufacturers = async () => {
  const manufacturers = await prisma.medicine.findMany({
    where: {
      manufacturer: {
        not: null
      }
    },
    select: {
      manufacturer: true
    },
    distinct: ["manufacturer"]
  });
  return manufacturers.map((m) => m.manufacturer).filter(Boolean);
};
var medicineServices = {
  addMedicineWithInventory,
  getAllMedicines,
  getSingleMedicine,
  updateMedicine,
  deleteMedicine,
  getAllManufacturers
};

// src/modules/medicine/medicine.controller.ts
var createMedicine = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const result = await medicineServices.addMedicineWithInventory(
      sellerId,
      req.body
    );
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var getAllMedicines2 = async (req, res, next) => {
  try {
    const result = await medicineServices.getAllMedicines({
      ...req.query,
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 12),
      skip: (Number(req.query.page || 1) - 1) * Number(req.query.limit || 12)
    });
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var getSingleMedicine2 = async (req, res, next) => {
  try {
    const result = await medicineServices.getSingleMedicine(req.params.id);
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var updateMedicine2 = async (req, res, next) => {
  try {
    const result = await medicineServices.updateMedicine(
      req.params.id,
      req.user.id,
      req.body
    );
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var deleteMedicine2 = async (req, res, next) => {
  try {
    const result = await medicineServices.deleteMedicine(
      req.params.id,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var getAllManufacturers2 = async (req, res, next) => {
  try {
    const manufacturers = await medicineServices.getAllManufacturers();
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Manufacturers fetched successfully",
      data: manufacturers
    });
  } catch (error) {
    next(error);
  }
};
var medicineController = {
  createMedicine,
  getAllMedicines: getAllMedicines2,
  getSingleMedicine: getSingleMedicine2,
  updateMedicine: updateMedicine2,
  deleteMedicine: deleteMedicine2,
  getAllManufacturers: getAllManufacturers2
};

// src/middlewares/auth.ts
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!"
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified,
        status: session.user.status
      };
      if (req.user.status === UserStatus.BAN) {
        return res.status(403).json({
          success: false,
          message: "Your account has been banned."
        });
      }
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You don't have permission to access this resource"
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth2;

// src/modules/medicine/medicine.route.ts
var router = express.Router();
router.get("/manufacturers", medicineController.getAllManufacturers);
router.get("/", medicineController.getAllMedicines);
router.get("/:id", medicineController.getSingleMedicine);
router.post("/", auth_default("SELLER" /* SELLER */), medicineController.createMedicine);
router.patch("/:id", auth_default("SELLER" /* SELLER */), medicineController.updateMedicine);
router.delete("/:id", auth_default("SELLER" /* SELLER */), medicineController.deleteMedicine);
var medicineRouter = router;

// src/modules/review/review.route.ts
import express2 from "express";

// src/modules/review/review.service.ts
var createReview = async (payload) => {
  try {
    const { userId, medicineId, rating, comment } = payload;
    const purchased = await prisma.orderItem.findFirst({
      where: {
        order: {
          userId,
          status: "DELIVERED"
        },
        sellerMedicine: {
          medicineId
        }
      }
    });
    if (!purchased) {
      return {
        success: false,
        statusCode: 403,
        message: "You can only review medicines you have purchased and received"
      };
    }
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        medicineId
      }
    });
    if (existingReview) {
      return {
        success: false,
        statusCode: 400,
        message: "You have already reviewed this medicine"
      };
    }
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        medicineId
      }
    });
    return {
      success: true,
      statusCode: 201,
      message: "Review created successfully",
      data: review
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to create review"
    };
  }
};
var reviewService = {
  createReview
};

// src/modules/review/review.controller.ts
var createReview2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    req.body.userId = userId;
    const result = await reviewService.createReview(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var reviewController = {
  createReview: createReview2
};

// src/modules/review/review.route.ts
var router2 = express2.Router();
router2.post("/", auth_default("CUSTOMER" /* CUSTOMER */), reviewController.createReview);
var reviewRouter = router2;

// src/modules/admin/admin.route.ts
import express3 from "express";

// src/modules/admin/admin.service.ts
var getUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.SELLER, UserRole.CUSTOMER]
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return {
      success: true,
      statusCode: 200,
      message: "Users retrieved successfully",
      data: users
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message || "Failed to fetch users"
    };
  }
};
var banUser = async (userId) => {
  const isExist = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!isExist) {
    return {
      success: false,
      message: "User not found"
    };
  }
  if (isExist.role === "ADMIN") {
    return {
      success: false,
      message: "Cannot ban an administrator"
    };
  }
  const result = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      status: UserStatus.BAN
    }
  });
  return {
    success: true,
    message: `${isExist.name || isExist.id} has been banned successfully`,
    result
  };
};
var getAdminChartData = async () => {
  const totalUsers = await prisma.user.count({ where: { role: "CUSTOMER" } });
  const totalSellers = await prisma.user.count({ where: { role: "SELLER" } });
  const orderItems = await prisma.orderItem.findMany({
    include: {
      order: true,
      sellerMedicine: { include: { medicine: true } }
    }
  });
  const ordersMap = {};
  const revenueMap = {};
  const topMedicinesMap = {};
  let totalRevenue = 0;
  let pendingOrdersCount = 0;
  orderItems.forEach((item) => {
    const date = item.order.createdAt.toISOString().split("T")[0];
    const orderStatus = item.order.status;
    if (orderStatus === "DELIVERED") {
      const itemTotal = item.price * item.quantity;
      revenueMap[date] = (revenueMap[date] || 0) + itemTotal;
      totalRevenue += itemTotal;
    }
    if (orderStatus === "PROCESSING") {
      pendingOrdersCount += 1;
    }
    if (!ordersMap[date]) ordersMap[date] = /* @__PURE__ */ new Set();
    ordersMap[date].add(item.orderId);
    if (orderStatus === "DELIVERED") {
      const medName = item.sellerMedicine.medicine.name;
      topMedicinesMap[medName] = (topMedicinesMap[medName] || 0) + item.quantity;
    }
  });
  const ordersOverTime = Object.entries(ordersMap).map(([date, orderSet]) => ({
    date,
    count: orderSet.size
    // Unique orders count
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const revenueOverTime = Object.entries(revenueMap).map(([date, amount]) => ({
    date,
    revenue: amount
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const topMedicines = Object.entries(topMedicinesMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  return {
    success: true,
    statusCode: 200,
    message: "Admin statistics calculated accurately",
    data: {
      usersVsSellers: { users: totalUsers, sellers: totalSellers },
      ordersOverTime,
      revenueOverTime,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      pendingOrders: pendingOrdersCount,
      topMedicines
    }
  };
};
var adminServices = {
  getUsers,
  banUser,
  getAdminChartData
};

// src/modules/admin/admin.controller.ts
var getUsers2 = async (req, res, next) => {
  try {
    const result = await adminServices.getUsers();
    res.status(200).json({ result });
  } catch (error) {
  }
};
var banUser2 = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await adminServices.banUser(userId);
    res.status(200).json({
      result
    });
  } catch (error) {
    next(error);
  }
};
var getAdminChartData2 = async (req, res, next) => {
  try {
    const result = await adminServices.getAdminChartData();
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var userController = {
  getUsers: getUsers2,
  banUser: banUser2,
  getAdminChartData: getAdminChartData2
};

// src/modules/admin/admin.route.ts
var router3 = express3.Router();
router3.get("/users", auth_default("ADMIN" /* ADMIN */), userController.getUsers);
router3.patch("/ban/:userId", auth_default("ADMIN" /* ADMIN */), userController.banUser);
router3.get("/statistics", auth_default("ADMIN" /* ADMIN */), userController.getAdminChartData);
var adminRouter = router3;

// src/modules/medicineCategory/medicineCategory.route.ts
import express4 from "express";

// src/modules/medicineCategory/medicineCategory.service.ts
var createCategory = async (payload) => {
  const { name, slug } = payload;
  if (!name || !slug) {
    return {
      success: false,
      statusCode: 400,
      message: "Name and slug are required",
      data: null
    };
  }
  const existingCategory = await prisma.medicineCategory.findFirst({
    where: {
      OR: [{ name }, { slug }]
    }
  });
  if (existingCategory) {
    return {
      success: false,
      statusCode: 409,
      message: "Category already exists with same name or slug",
      data: null
    };
  }
  const category = await prisma.medicineCategory.create({
    data: { name, slug }
  });
  return {
    success: true,
    statusCode: 201,
    message: "Category created successfully",
    data: category
  };
};
var getAllCategories = async () => {
  const categories = await prisma.medicineCategory.findMany({});
  return {
    success: true,
    statusCode: 200,
    message: "Categories fetched successfully",
    data: categories
  };
};
var getSingleCategory = async (id) => {
  if (!id) {
    return {
      success: false,
      statusCode: 400,
      message: "Category id is required",
      data: null
    };
  }
  const category = await prisma.medicineCategory.findUnique({
    where: { id },
    include: {
      medicines: true
    }
  });
  if (!category) {
    return {
      success: false,
      statusCode: 404,
      message: "Category not found",
      data: null
    };
  }
  return {
    success: true,
    statusCode: 200,
    message: "Category fetched successfully",
    data: category
  };
};
var deleteSingleCategory = async (id) => {
  if (!id) {
    return {
      success: false,
      statusCode: 400,
      message: "Category id is required",
      data: null
    };
  }
  const category = await prisma.medicineCategory.findUnique({
    where: { id }
  });
  if (!category) {
    return {
      success: false,
      statusCode: 404,
      message: "Category not found",
      data: null
    };
  }
  const deletedCategory = await prisma.medicineCategory.delete({
    where: { id }
  });
  return {
    success: true,
    statusCode: 200,
    message: "Category deleted successfully",
    data: deletedCategory
  };
};
var medicineCategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  deleteSingleCategory
};

// src/modules/medicineCategory/medicineCategory.controller.ts
var createCategory2 = async (req, res, next) => {
  try {
    const result = await medicineCategoryService.createCategory(req.body);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var getAllCategories2 = async (req, res, next) => {
  try {
    const result = await medicineCategoryService.getAllCategories();
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var getSingleCategory2 = async (req, res, next) => {
  try {
    const result = await medicineCategoryService.getSingleCategory(
      req.params.id
    );
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var deleteSingleCategory2 = async (req, res, next) => {
  try {
    const result = await medicineCategoryService.deleteSingleCategory(
      req.params.id
    );
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var medicineCategoryController = {
  createCategory: createCategory2,
  getAllCategories: getAllCategories2,
  getSingleCategory: getSingleCategory2,
  deleteSingleCategory: deleteSingleCategory2
};

// src/modules/medicineCategory/medicineCategory.route.ts
var router4 = express4.Router();
router4.post("/", auth_default("ADMIN" /* ADMIN */), medicineCategoryController.createCategory);
router4.get("/", medicineCategoryController.getAllCategories);
router4.get("/:id", medicineCategoryController.getSingleCategory);
router4.delete("/:id", auth_default("ADMIN" /* ADMIN */), medicineCategoryController.deleteSingleCategory);
var medicineCategoryRoutes = router4;

// src/middlewares/notFound.ts
var notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    method: req.method,
    path: req.originalUrl,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
};

// src/modules/order/placeOrder.route.ts
import express5 from "express";

// src/modules/order/placeOrder.service.ts
var placeOrder = async (userId, payload) => {
  try {
    const { shippingAddress } = payload;
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            sellerMedicine: true
          }
        }
      }
    });
    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        statusCode: 400,
        message: "Cart is empty"
      };
    }
    let total = 0;
    for (const item of cart.items) {
      const medicine = item.sellerMedicine;
      if (!medicine.isAvailable) {
        return {
          success: false,
          statusCode: 400,
          message: `Medicine not available`
        };
      }
      if (medicine.stockQuantity < item.quantity) {
        return {
          success: false,
          statusCode: 400,
          message: `Insufficient stock`
        };
      }
      total += medicine.price * item.quantity;
    }
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          total,
          shippingAddress,
          paymentMethod: "COD"
        }
      });
      for (const item of cart.items) {
        const medicine = item.sellerMedicine;
        const remainingStock = medicine.stockQuantity - item.quantity;
        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            sellerMedicineId: medicine.id,
            price: medicine.price,
            quantity: item.quantity,
            status: "PROCESSING"
          }
        });
        await tx.sellerMedicine.update({
          where: { id: medicine.id },
          data: {
            stockQuantity: remainingStock,
            isAvailable: remainingStock > 0
          }
        });
      }
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
      return createdOrder;
    });
    return {
      success: true,
      statusCode: 201,
      message: "Order placed successfully",
      data: order
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message || "Failed to place order"
    };
  }
};
var getMyOrders = async (userId) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            sellerMedicine: {
              include: {
                medicine: true
              }
            }
          }
        }
      }
    });
    const summary = orders.map((order) => ({
      orderId: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      medicines: order.items.map((item) => ({
        name: item.sellerMedicine.medicine.name,
        medicineId: item.sellerMedicine.medicine.id,
        price: item.price,
        quantity: item.quantity,
        itemStatus: item.status,
        sellerId: item.sellerMedicine.sellerId
      }))
    }));
    return {
      success: true,
      statusCode: 200,
      message: "Customer orders fetched successfully",
      data: summary
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to fetch orders"
    };
  }
};
var cancelOrder = async (userId, orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { sellerMedicine: true }
        }
      }
    });
    if (!order) {
      return { success: false, statusCode: 404, message: "Order not found" };
    }
    if (order.userId !== userId) {
      return { success: false, statusCode: 403, message: "You are not authorized to cancel this order" };
    }
    const nonCancellable = ["SHIPPED", "DELIVERED", "CANCELLED"];
    if (nonCancellable.includes(order.status)) {
      return {
        success: false,
        statusCode: 400,
        message: `Order cannot be cancelled. It is already ${order.status.toLowerCase()}.`
      };
    }
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.sellerMedicine.update({
          where: { id: item.sellerMedicineId },
          data: {
            stockQuantity: { increment: item.quantity },
            isAvailable: true
          }
        });
      }
      await tx.orderItem.updateMany({
        where: { orderId },
        data: { status: "CANCELLED" }
      });
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" }
      });
    });
    return {
      success: true,
      statusCode: 200,
      message: "Order has been cancelled and stock has been rolled back."
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      message: err.message || "An error occurred while cancelling the order"
    };
  }
};
var getSellerOrders = async (sellerId) => {
  try {
    const rawOrders = await prisma.order.findMany({
      where: {
        items: { some: { sellerMedicine: { sellerId } } }
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true, image: true } },
        items: {
          where: { sellerMedicine: { sellerId } },
          include: {
            sellerMedicine: { include: { medicine: true } }
          }
        }
      }
    });
    const manipulatedData = rawOrders.map((order) => {
      const sellerSubtotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const allItemStatus = order.items.map((i) => i.status);
      const sellerBatchStatus = allItemStatus.every((s) => s === allItemStatus[0]) ? allItemStatus[0] : "PROCESSING";
      return {
        ...order,
        sellerSubtotal,
        batchStatus: sellerBatchStatus,
        itemCount: order.items.length
      };
    });
    return {
      success: true,
      statusCode: 200,
      message: "Seller-specific orders fetched",
      data: manipulatedData
    };
  } catch (err) {
    return { success: false, statusCode: 500, message: err.message };
  }
};
var updateSellerBatchStatus = async (orderId, sellerId, status) => {
  return await prisma.$transaction(async (tx) => {
    const updateCount = await tx.orderItem.updateMany({
      where: {
        orderId,
        sellerMedicine: { sellerId }
      },
      data: { status }
    });
    const allItems = await tx.orderItem.findMany({
      where: { orderId }
    });
    const isFullyDelivered = allItems.every((item) => item.status === "DELIVERED");
    const isAnyShipped = allItems.some((item) => item.status === "SHIPPED");
    let finalStatus = "PROCESSING";
    if (isFullyDelivered) {
      finalStatus = "DELIVERED";
    } else if (isAnyShipped) {
      finalStatus = "SHIPPED";
    } else {
      finalStatus = "PROCESSING";
    }
    await tx.order.update({
      where: { id: orderId },
      data: { status: finalStatus }
    });
    return updateCount;
  });
};
var getAllOrdersAdmin = async () => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            sellerMedicine: {
              include: {
                medicine: {
                  select: {
                    name: true,
                    brandName: true,
                    thumbnail: true
                  }
                },
                seller: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    const formattedOrders = orders.flatMap(
      (order) => order.items.map((item) => ({
        orderId: order.id,
        orderDate: order.createdAt,
        customerName: order.user.name,
        customerEmail: order.user.email,
        customerPhone: order.user.phone || "N/A",
        // Product Details
        productName: item.sellerMedicine.medicine.name,
        brandName: item.sellerMedicine.medicine.brandName,
        thumbnail: item.sellerMedicine.medicine.thumbnail,
        // Seller Details
        sellerName: item.sellerMedicine.seller.name,
        sellerEmail: item.sellerMedicine.seller.email,
        // Pricing & Quantity
        quantity: item.quantity,
        unitPrice: item.price,
        subTotal: item.price * item.quantity,
        // Order Level Info
        orderTotal: order.total,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        itemStatus: item.status,
        overallStatus: order.status
      }))
    );
    return {
      success: true,
      statusCode: 200,
      message: "All orders retrieved and formatted for admin dashboard",
      data: formattedOrders
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      message: err.message || "An error occurred while fetching orders"
    };
  }
};
var OrderServices = {
  placeOrder,
  getMyOrders,
  cancelOrder,
  getSellerOrders,
  updateSellerBatchStatus
};

// src/errors/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
};

// src/modules/order/placeOrder.controller.ts
var placeOrder2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }
    const payload = req.body;
    const result = await OrderServices.placeOrder(userId, payload);
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var getMyOrders2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }
    const result = await OrderServices.getMyOrders(userId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var cancelOrder2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const orderId = req.params.id;
    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }
    if (!orderId) {
      throw new AppError(400, "Order ID is required");
    }
    const result = await OrderServices.cancelOrder(userId, orderId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var getSellerOrders2 = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      throw new AppError(401, "Unauthorized");
    }
    const result = await OrderServices.getSellerOrders(sellerId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var updateBatchStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const sellerId = req.user?.id;
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Status are required"
      });
    }
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }
    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Seller identity missing"
      });
    }
    const result = await updateSellerBatchStatus(orderId, sellerId, status);
    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "No order items found for this seller in this order"
      });
    }
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Successfully updated ${result.count} items to ${status}`,
      data: result
    });
  } catch (error) {
    console.error("Batch Status Update Error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Internal server error"
    });
  }
};
var getAllOrdersForAdmin = async (req, res, next) => {
  try {
    const result = await getAllOrdersAdmin();
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var OrderController = {
  placeOrder: placeOrder2,
  getMyOrders: getMyOrders2,
  cancelOrder: cancelOrder2,
  getSellerOrders: getSellerOrders2,
  updateBatchStatus,
  getAllOrdersForAdmin
};

// src/modules/order/placeOrder.route.ts
var router5 = express5.Router();
router5.post("/", auth_default("CUSTOMER" /* CUSTOMER */), OrderController.placeOrder);
router5.get("/my-orders", auth_default("CUSTOMER" /* CUSTOMER */), OrderController.getMyOrders);
router5.patch("/my-orders/cancel/:id", auth_default("CUSTOMER" /* CUSTOMER */), OrderController.cancelOrder);
router5.get("/seller", auth_default("SELLER" /* SELLER */), OrderController.getSellerOrders);
router5.patch("/seller/batch-status", auth_default("SELLER" /* SELLER */), OrderController.updateBatchStatus);
router5.get("/all/admin", auth_default("ADMIN" /* ADMIN */), OrderController.getAllOrdersForAdmin);
var orderRouter = router5;

// src/modules/cart/cart.route.ts
import { Router as Router4 } from "express";

// src/modules/cart/cart.service.ts
var addToCart = async (userId, payload) => {
  const { sellerMedicineId, quantity } = payload;
  if (quantity < 1) {
    return {
      success: false,
      statusCode: 400,
      message: "Quantity must be at least 1"
    };
  }
  let cart = await prisma.cart.findUnique(
    {
      where: { userId }
    }
  );
  if (!cart) cart = await prisma.cart.create({ data: { userId } });
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, sellerMedicineId }
  });
  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity }
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, sellerMedicineId, quantity }
    });
  }
  return { success: true, statusCode: 200, message: "Added to cart" };
};
var updateQuantity = async (userId, payload) => {
  try {
    if (payload.quantity < 1) {
      return { success: false, statusCode: 400, message: "Quantity must be at least 1" };
    }
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });
    if (!cart) {
      return { success: false, statusCode: 404, message: "Cart not found" };
    }
    const item = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, sellerMedicineId: payload.sellerMedicineId }
    });
    if (!item) {
      return { success: false, statusCode: 404, message: "Cart item not found" };
    }
    const updatedItem = await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: payload.quantity },
      include: {
        sellerMedicine: {
          include: {
            medicine: true,
            seller: true
          }
        }
      }
    });
    return { success: true, statusCode: 200, message: "Quantity updated", data: updatedItem };
  } catch (error) {
    return { success: false, statusCode: 500, message: error.message || "Failed to update quantity" };
  }
};
var getCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          sellerMedicine: {
            include: {
              medicine: true,
              seller: true
            }
          }
        }
      }
    }
  });
  if (!cart || cart.items.length === 0) return { success: false, statusCode: 404, message: "Cart is empty" };
  return { success: true, statusCode: 200, message: "Cart fetched", data: cart };
};
var deleteCartItem = async (userId, cartItemId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId }
  });
  if (!cart) {
    return {
      success: false,
      statusCode: 404,
      message: "Cart not found"
    };
  }
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cartId: cart.id
    }
  });
  if (!cartItem) {
    return {
      success: false,
      statusCode: 404,
      message: "Cart item not found"
    };
  }
  await prisma.cartItem.delete({
    where: { id: cartItemId }
  });
  return {
    success: true,
    statusCode: 200,
    message: "Item removed from cart"
  };
};

// src/modules/cart/cart.controller.ts
var addToCartController = async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = req.body;
    const result = await addToCart(userId, payload);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add to cart"
    });
  }
};
var getCartController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getCart(userId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch cart"
    });
  }
};
var updateQuantityController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await updateQuantity(userId, req.body);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update quantity!"
    });
  }
};
var deleteCartItemController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.body;
    const result = await deleteCartItem(userId, cartItemId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove cart item"
    });
  }
};

// src/modules/cart/cart.route.ts
var router6 = Router4();
router6.post("/add", auth_default("CUSTOMER" /* CUSTOMER */), addToCartController);
router6.get("/", auth_default("CUSTOMER" /* CUSTOMER */), getCartController);
router6.patch("/", auth_default("CUSTOMER" /* CUSTOMER */), updateQuantityController);
router6.delete("/", auth_default("CUSTOMER" /* CUSTOMER */), deleteCartItemController);
var CartRouter = router6;

// src/modules/seller/seller.route.ts
import express6 from "express";

// src/modules/seller/seller.service.ts
var getSellerMedicines = async (sellerId, payload) => {
  const {
    search,
    categoryId,
    manufacturer,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    skip = (page - 1) * limit,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = payload;
  const andConditions = [
    { sellerId }
  ];
  if (categoryId) andConditions.push({ medicine: { categoryId } });
  if (manufacturer)
    andConditions.push({ medicine: { manufacturer: { contains: manufacturer, mode: "insensitive" } } });
  if (search)
    andConditions.push({
      medicine: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { brandName: { contains: search, mode: "insensitive" } },
          { genericName: { contains: search, mode: "insensitive" } }
        ]
      }
    });
  if (minPrice !== void 0 || maxPrice !== void 0)
    andConditions.push({
      price: {
        gte: minPrice ?? void 0,
        lte: maxPrice ?? void 0
      }
    });
  const dataRaw = await prisma.sellerMedicine.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    orderBy: { price: sortOrder },
    include: {
      medicine: { include: { category: true, reviews: true } }
    }
  });
  const data = dataRaw.map((item) => ({
    sellerMedicineId: item.id,
    medicineName: item.medicine.name,
    medicineId: item.medicine.id,
    brandName: item.medicine.brandName,
    genericName: item.medicine.genericName ?? void 0,
    categoryName: item.medicine.category?.name ?? void 0,
    price: item.price,
    stockQuantity: item.stockQuantity,
    expiryDate: item.expiryDate ?? void 0,
    batchNumber: item.batchNumber,
    isAvailable: item.isAvailable,
    totalReviews: item.medicine.reviews.length,
    averageRating: item.medicine.reviews.length > 0 ? item.medicine.reviews.reduce((sum, r) => sum + r.rating, 0) / item.medicine.reviews.length : 0
  }));
  const total = await prisma.sellerMedicine.count({ where: { AND: andConditions } });
  return {
    success: true,
    statusCode: 200,
    message: "Medicines fetched successfully",
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getSellerStats = async (sellerId) => {
  const totalMedicines = await prisma.sellerMedicine.count({ where: { sellerId } });
  const orderItems = await prisma.orderItem.findMany({
    where: {
      sellerMedicine: { sellerId }
    },
    include: {
      order: true
    }
  });
  const deliveredItems = orderItems.filter((item) => item.order.status === "DELIVERED");
  const totalRevenue = deliveredItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalOrders = orderItems.length;
  const medicines = await prisma.sellerMedicine.findMany({
    where: { sellerId },
    include: { medicine: { include: { reviews: true } } }
  });
  const totalReviews = medicines.reduce((sum, sm) => sum + sm.medicine.reviews.length, 0);
  const allRatings = medicines.flatMap((sm) => sm.medicine.reviews.map((r) => r.rating));
  const averageRating = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;
  return {
    success: true,
    statusCode: 200,
    message: "Seller statistics fetched successfully",
    data: {
      totalMedicines,
      totalOrders,
      totalRevenue,
      // Ekhon Admin er sathe match korbe
      totalReviews,
      averageRating: Number(averageRating.toFixed(2))
    }
  };
};
var getSellerChartData = async (sellerId) => {
  const orders = await prisma.orderItem.findMany({
    where: { sellerMedicine: { sellerId } },
    include: {
      order: true,
      sellerMedicine: { include: { medicine: true } }
    }
  });
  const ordersMap = {};
  const revenueMap = {};
  orders.forEach((item) => {
    const date = item.order.createdAt.toISOString().split("T")[0];
    ordersMap[date] = (ordersMap[date] || 0) + 1;
    if (item.order.status === "DELIVERED") {
      const medName = item.sellerMedicine.medicine.name;
      revenueMap[medName] = (revenueMap[medName] || 0) + item.price * item.quantity;
    }
  });
  const ordersOverTime = Object.entries(ordersMap).map(([date, count]) => ({ date, count })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const revenuePerMedicine = Object.entries(revenueMap).map(([name, value]) => ({
    name,
    value
  }));
  const medicines = await prisma.sellerMedicine.findMany({
    where: { sellerId },
    include: { medicine: true }
  });
  const stockPerMedicine = medicines.map((sm) => ({
    name: sm.medicine.name,
    stock: sm.stockQuantity
  }));
  return {
    success: true,
    statusCode: 200,
    message: "Seller chart data fetched",
    data: {
      ordersOverTime,
      revenuePerMedicine,
      stockPerMedicine
    }
  };
};
var sellerService = {
  getSellerMedicines,
  getSellerStats,
  getSellerChartData
};

// src/modules/seller/seller.controller.ts
var getSellerMedicines2 = async (req, res, next) => {
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
var getSellerStats2 = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const result = await sellerService.getSellerStats(sellerId);
    res.status(result.statusCode).json(result);
  } catch (err) {
    next(err);
  }
};
var getSellerChartData2 = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const result = await sellerService.getSellerChartData(sellerId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var sellerController = {
  getSellerMedicines: getSellerMedicines2,
  getSellerStats: getSellerStats2,
  getSellerChartData: getSellerChartData2
};

// src/modules/seller/seller.route.ts
var router7 = express6.Router();
router7.get("/medicine", auth_default("SELLER" /* SELLER */), sellerController.getSellerMedicines);
router7.get("/stats", auth_default("SELLER" /* SELLER */), sellerController.getSellerStats);
router7.get("/statistics", auth_default("SELLER" /* SELLER */), sellerController.getSellerChartData);
var sellerRouter = router7;

// src/modules/user/user.route.ts
import express7 from "express";

// src/modules/user/user.service.ts
var updateUserProfile = async (userId, payload) => {
  try {
    const { name, phone, image } = payload;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, phone, image },
      select: { name: true, phone: true, image: true, email: true }
    });
    return {
      success: true,
      statusCode: 200,
      message: "Profile updated successfully",
      data: updatedUser
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message || "Failed to update profile"
    };
  }
};
var updateUserRoleOnRegister = async (payload) => {
  try {
    const { email, role } = payload;
    const allowedRoles = ["CUSTOMER", "SELLER"];
    if (!allowedRoles.includes(role)) {
      return {
        success: false,
        statusCode: 400,
        message: "Invalid role. Only CUSTOMER or SELLER allowed"
      };
    }
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role }
    });
    return {
      success: true,
      statusCode: 200,
      message: "Profile create successfully",
      data: updatedUser
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message || "Failed to update profile"
    };
  }
};
var getSingleCustomerData = async (userId) => {
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
        message: "User not found"
      };
    }
    return {
      success: true,
      statusCode: 200,
      message: "Customer data retrieved successfully",
      data: user
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message || "Failed to retrieve customer data"
    };
  }
};
var userServices = {
  updateUserProfile,
  updateUserRoleOnRegister
};

// src/modules/user/user.controller.ts
var updateUserProfile2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const result = await userServices.updateUserProfile(userId, req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var updateUserRole = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const allowedRoles = ["CUSTOMER", "SELLER"];
    if (!email || !role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or role. Only CUSTOMER or SELLER allowed"
      });
    }
    const result = await updateUserRoleOnRegister({ email, role });
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var getSingleCustomerDataController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const result = await getSingleCustomerData(userId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var userController2 = {
  updateUserProfile: updateUserProfile2,
  updateUserRole,
  getSingleCustomerDataController
};

// src/modules/user/user.route.ts
var router8 = express7.Router();
router8.get("/single-user", auth_default("CUSTOMER" /* CUSTOMER */), userController2.getSingleCustomerDataController);
router8.patch("/update-profile", auth_default("CUSTOMER" /* CUSTOMER */), userController2.updateUserProfile);
router8.put("/role", auth_default("CUSTOMER" /* CUSTOMER */), userController2.updateUserRole);
var userRouter = router8;

// src/app.ts
var app = express8();
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://medicorner-client.vercel.app",
    "https://medicorner-client-11v3g6lqp-joy-halders-projects.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express8.json());
app.use("/medicine", medicineRouter);
app.use("/review", reviewRouter);
app.use("/categories", medicineCategoryRoutes);
app.use("/order", orderRouter);
app.use("/cart", CartRouter);
app.use("/admin", adminRouter);
app.use("/seller", sellerRouter);
app.use("/user", userRouter);
app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "MediCorner Server is running",
    path: req.path
  });
});
app.use(notFound);
var app_default = app;

// src/server.ts
var port = process.env.PORT || 5e3;
var main = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully");
    app_default.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.log("An error occurred: ", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};
main();
