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
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum UserRole {\n  CUSTOMER\n  SELLER\n  ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  BAN\n}\n\nenum OrderStatus {\n  PROCESSING\n  // CONFIRMED\n  SHIPPED\n  DELIVERED\n  CANCELLED\n}\n\nmodel User {\n  id            String    @id\n  name          String\n  email         String\n  emailVerified Boolean   @default(false)\n  image         String?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n\n  role   UserRole?   @default(CUSTOMER)\n  phone  String?\n  status UserStatus? @default(ACTIVE)\n\n  // business relations\n  cart        Cart?\n  orders      Order[]\n  reviews     Review[]\n  sellerItems SellerMedicine[]\n  adminLogs   AdminLog[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel MedicineCategory {\n  id   String @id @default(uuid())\n  name String\n  slug String @unique\n\n  medicines Medicine[]\n}\n\nmodel Medicine {\n  id           String  @id @default(uuid())\n  name         String\n  brandName    String\n  genericName  String?\n  manufacturer String?\n  description  String?\n  isOtc        Boolean @default(true)\n  thumbnail    String?\n\n  categoryId String\n  category   MedicineCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n\n  sellers SellerMedicine[]\n  reviews Review[]\n}\n\nmodel SellerMedicine {\n  id            String    @id @default(uuid())\n  price         Int\n  stockQuantity Int       @default(0)\n  expiryDate    DateTime?\n  batchNumber   String\n  isAvailable   Boolean   @default(true)\n\n  sellerId String\n  seller   User   @relation(fields: [sellerId], references: [id])\n\n  medicineId String\n  medicine   Medicine @relation(fields: [medicineId], references: [id], onDelete: Cascade)\n\n  cartItems  CartItem[]\n  orderItems OrderItem[]\n\n  @@unique([sellerId, medicineId])\n}\n\n/// CART\n\nmodel Cart {\n  id     String @id @default(uuid())\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  items CartItem[]\n}\n\nmodel CartItem {\n  id       String @id @default(uuid())\n  quantity Int\n\n  cartId String\n  cart   Cart   @relation(fields: [cartId], references: [id], onDelete: Cascade)\n\n  sellerMedicineId String\n  sellerMedicine   SellerMedicine @relation(fields: [sellerMedicineId], references: [id])\n\n  @@unique([cartId, sellerMedicineId])\n}\n\n/// ORDER\n\nmodel Order {\n  id              String      @id @default(uuid())\n  total           Int\n  status          OrderStatus @default(PROCESSING)\n  shippingAddress String\n  paymentMethod   String      @default("COD")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  userId String\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  items OrderItem[]\n\n  @@map("order")\n}\n\nmodel OrderItem {\n  id       String      @id @default(uuid())\n  price    Int\n  quantity Int\n  status   OrderStatus @default(PROCESSING)\n\n  orderId String\n  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)\n\n  sellerMedicineId String\n  sellerMedicine   SellerMedicine @relation(fields: [sellerMedicineId], references: [id])\n}\n\n/// REVIEW\n\nmodel Review {\n  id      String @id @default(uuid())\n  rating  Int?\n  comment String\n\n  userId String\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  medicineId String\n  medicine   Medicine @relation(fields: [medicineId], references: [id])\n\n  createdAt DateTime @default(now())\n}\n\n/// ADMIN LOG\n\nmodel AdminLog {\n  id       String @id @default(uuid())\n  action   String\n  entity   String\n  entityId String\n\n  adminId String\n  admin   User   @relation(fields: [adminId], references: [id])\n\n  createdAt DateTime @default(now())\n}\n',
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
var UserStatus = {
  ACTIVE: "ACTIVE",
  BAN: "BAN"
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
          from: '"Prisma Blog" <prismablog@ph.com>',
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
    skip,
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
  if (categoryId) andConditions.push({ categoryId });
  if (manufacturer) {
    andConditions.push({
      manufacturer: { contains: manufacturer, mode: "insensitive" }
    });
  }
  if (minPrice !== void 0 || maxPrice !== void 0) {
    andConditions.push({
      sellers: {
        some: {
          price: {
            gte: minPrice,
            lte: maxPrice
          }
        }
      }
    });
  }
  const data = await prisma.medicine.findMany({
    take: limit,
    skip,
    where: { AND: andConditions },
    orderBy: { [sortBy]: sortOrder },
    include: {
      category: true,
      reviews: true
      // sellers: true,
    }
  });
  const total = await prisma.medicine.count({
    where: { AND: andConditions }
  });
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
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId }
  });
  if (!medicine) {
    return {
      success: false,
      statusCode: 404,
      message: "Medicine not found",
      data: null
    };
  }
  const sellerMedicine = await prisma.sellerMedicine.findFirst({
    where: { medicineId, sellerId }
  });
  if (!sellerMedicine) {
    return {
      success: false,
      statusCode: 403,
      message: "You are not allowed to update this medicine",
      data: null
    };
  }
  await prisma.medicine.update({
    where: { id: medicineId },
    data: {
      name: payload.name,
      brandName: payload.brandName,
      genericName: payload.genericName,
      manufacturer: payload.manufacturer,
      description: payload.description
    }
  });
  await prisma.sellerMedicine.update({
    where: { id: sellerMedicine.id },
    data: {
      price: payload.price,
      stockQuantity: payload.stockQuantity,
      batchNumber: payload.batchNumber
    }
  });
  const updated = await prisma.medicine.findUnique({
    where: { id: medicineId },
    include: { sellers: true, category: true }
  });
  return {
    success: true,
    statusCode: 200,
    message: "Medicine updated successfully",
    data: updated
  };
};
var deleteMedicine = async (medicineId, sellerId) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId }
  });
  if (!medicine) {
    return {
      success: false,
      statusCode: 404,
      message: "Medicine not found",
      data: null
    };
  }
  const sellerMedicine = await prisma.sellerMedicine.findFirst({
    where: { medicineId, sellerId }
  });
  if (!sellerMedicine) {
    return {
      success: false,
      statusCode: 403,
      message: "You are not allowed to delete this medicine",
      data: null
    };
  }
  await prisma.medicine.delete({
    where: { id: medicineId }
  });
  return {
    success: true,
    statusCode: 200,
    message: "Medicine deleted successfully",
    data: null
  };
};
var medicineServices = {
  addMedicineWithInventory,
  getAllMedicines,
  getSingleMedicine,
  updateMedicine,
  deleteMedicine
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
      limit: Number(req.query.limit || 10),
      skip: (Number(req.query.page || 1) - 1) * Number(req.query.limit || 10)
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
var medicineController = {
  createMedicine,
  getAllMedicines: getAllMedicines2,
  getSingleMedicine: getSingleMedicine2,
  updateMedicine: updateMedicine2,
  deleteMedicine: deleteMedicine2
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
      if (!session.user.emailVerified) {
        return res.status(401).json({
          success: false,
          message: "Email verification required. Please verify your email!"
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
  return await prisma.user.findMany();
};
var banUser = async (userId) => {
  const isExist = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  if (!isExist) {
    return {
      message: "user not found"
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
    message: `${isExist.id} number use ban successfully`,
    result
  };
};
var getAdminChartData = async () => {
  const totalUsers = await prisma.user.count({ where: { role: "CUSTOMER" } });
  const totalSellers = await prisma.user.count({ where: { role: "SELLER" } });
  const orders = await prisma.orderItem.findMany({
    include: { order: true, sellerMedicine: { include: { medicine: true } } }
  });
  const ordersOverTime = {};
  const revenueOverTime = {};
  const topMedicines = {};
  orders.forEach((item) => {
    const date = item.order.createdAt.toISOString().split("T")[0];
    ordersOverTime[date] = (ordersOverTime[date] || 0) + 1;
    revenueOverTime[date] = (revenueOverTime[date] || 0) + item.price * item.quantity;
    const medName = item.sellerMedicine.medicine.name;
    topMedicines[medName] = (topMedicines[medName] || 0) + item.quantity;
  });
  return {
    success: true,
    statusCode: 200,
    message: "Admin chart data fetched",
    data: {
      usersVsSellers: { users: totalUsers, sellers: totalSellers },
      ordersOverTime,
      revenueOverTime,
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
router3.get("/", auth_default("ADMIN" /* ADMIN */), userController.getUsers);
router3.patch("/:userId", auth_default("ADMIN" /* ADMIN */), userController.banUser);
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
router4.get("/", auth_default("ADMIN" /* ADMIN */, "SELLER" /* SELLER */, "CUSTOMER" /* CUSTOMER */), medicineCategoryController.getAllCategories);
router4.get("/:id", medicineCategoryController.getSingleCategory);
router4.delete("/:id", auth_default("ADMIN" /* ADMIN */, "SELLER" /* SELLER */, "CUSTOMER" /* CUSTOMER */), auth_default("ADMIN" /* ADMIN */), medicineCategoryController.deleteSingleCategory);
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
                // for medicine name
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
      medicines: order.items.map((item) => ({
        name: item.sellerMedicine.medicine.name,
        medicineId: item.sellerMedicine.medicine.id,
        price: item.price,
        quantity: item.quantity
      }))
    }));
    return {
      success: true,
      statusCode: 200,
      message: "Orders summary fetched",
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
    if (!order)
      return { success: false, statusCode: 404, message: "Order not found" };
    if (order.userId !== userId)
      return { success: false, statusCode: 403, message: "Not authorized" };
    if (order.status !== "PROCESSING")
      return {
        success: false,
        statusCode: 400,
        message: "Order cannot be cancelled now"
      };
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
      message: "Order cancelled successfully"
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to cancel order"
    };
  }
};
var getSellerOrders = async (sellerId) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: { sellerMedicine: { sellerId } }
        }
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        items: {
          where: {
            sellerMedicine: { sellerId }
          },
          include: {
            sellerMedicine: {
              include: { medicine: true }
            }
          }
        }
      }
    });
    return {
      success: true,
      statusCode: 200,
      message: "Seller orders fetched",
      data: orders
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to fetch seller orders"
    };
  }
};
var updateOrderStatus = async (sellerId, orderId, status) => {
  try {
    const updatedItems = await prisma.orderItem.updateMany({
      where: {
        orderId,
        sellerMedicine: { sellerId },
        status: { not: "CANCELLED" }
      },
      data: { status }
    });
    if (updatedItems.count === 0) {
      return {
        success: false,
        statusCode: 403,
        message: "No items to update"
      };
    }
    const allItems = await prisma.orderItem.findMany({
      where: { orderId }
    });
    let newOrderStatus = "PROCESSING";
    if (allItems.every((i) => i.status === "DELIVERED")) {
      newOrderStatus = "DELIVERED";
    } else if (allItems.some((i) => i.status === "SHIPPED")) {
      newOrderStatus = "SHIPPED";
    }
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newOrderStatus }
    });
    return {
      success: true,
      statusCode: 200,
      message: "Order status updated"
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to update status"
    };
  }
};
var getAllOrders = async () => {
  try {
    const orderItems = await prisma.orderItem.findMany({
      include: {
        sellerMedicine: {
          include: {
            seller: true
          }
        }
      }
    });
    const summaryMap = {};
    for (const item of orderItems) {
      const sellerId = item.sellerMedicine.seller.id;
      const sellerName = item.sellerMedicine.seller.name;
      if (!summaryMap[sellerId]) {
        summaryMap[sellerId] = {
          sellerId,
          sellerName,
          totalOrders: 0,
          totalProductsSold: 0,
          totalRevenue: 0
        };
      }
      summaryMap[sellerId].totalOrders += 1;
      summaryMap[sellerId].totalProductsSold += item.quantity;
      summaryMap[sellerId].totalRevenue += item.price * item.quantity;
    }
    const summaryArray = Object.values(summaryMap);
    return {
      success: true,
      statusCode: 200,
      message: "Seller summary fetched",
      data: summaryArray
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to fetch seller summary"
    };
  }
};
var OrderServices = {
  placeOrder,
  getMyOrders,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getSellerOrders
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
    if (!payload?.cartId) {
      throw new AppError(400, "Cart ID is required");
    }
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
var updateOrderStatus2 = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    const orderId = req.params.id;
    const { status } = req.body;
    if (!sellerId) {
      throw new AppError(401, "Unauthorized");
    }
    if (!orderId) {
      throw new AppError(400, "Order ID is required");
    }
    if (!status) {
      throw new AppError(400, "Order status is required");
    }
    const result = await OrderServices.updateOrderStatus(
      sellerId,
      orderId,
      status
    );
    res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};
var getAllOrders2 = async (req, res, next) => {
  try {
    const result = await OrderServices.getAllOrders();
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
  updateOrderStatus: updateOrderStatus2,
  getAllOrders: getAllOrders2
};

// src/modules/order/placeOrder.route.ts
var router5 = express5.Router();
router5.post("/", auth_default("CUSTOMER" /* CUSTOMER */), OrderController.placeOrder);
router5.get("/me", auth_default("CUSTOMER" /* CUSTOMER */), OrderController.getMyOrders);
router5.patch("/cancel/:id", auth_default("CUSTOMER" /* CUSTOMER */), OrderController.cancelOrder);
router5.get("/seller", auth_default("SELLER" /* SELLER */), OrderController.getSellerOrders);
router5.patch("/seller/:id/status", auth_default("SELLER" /* SELLER */), OrderController.updateOrderStatus);
router5.get("/all", auth_default("ADMIN" /* ADMIN */), OrderController.getAllOrders);
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
var deleteCartItemController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;
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
router6.delete("/:cartItemId", auth_default("CUSTOMER" /* CUSTOMER */), deleteCartItemController);
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
    where: { sellerMedicine: { sellerId } },
    include: { sellerMedicine: true }
  });
  const totalOrders = orderItems.length;
  const totalRevenue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
      totalReviews,
      averageRating: Number(averageRating.toFixed(2))
    }
  };
};
var getSellerChartData = async (sellerId) => {
  const orders = await prisma.orderItem.findMany({
    where: { sellerMedicine: { sellerId } },
    include: { order: true, sellerMedicine: { include: { medicine: true } } }
  });
  const ordersOverTime = {};
  const revenuePerMedicine = {};
  orders.forEach((item) => {
    const date = item.order.createdAt.toISOString().split("T")[0];
    ordersOverTime[date] = (ordersOverTime[date] || 0) + 1;
    const medName = item.sellerMedicine.medicine.name;
    revenuePerMedicine[medName] = (revenuePerMedicine[medName] || 0) + item.price * item.quantity;
  });
  const medicines = await prisma.sellerMedicine.findMany({
    where: { sellerId },
    include: { medicine: true }
  });
  const stockPerMedicine = {};
  medicines.forEach((sm) => {
    stockPerMedicine[sm.medicine.name] = sm.stockQuantity;
  });
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
var userServices = {
  updateUserProfile
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
var userController2 = {
  updateUserProfile: updateUserProfile2
};

// src/modules/user/user.route.ts
var router8 = express7.Router();
router8.put("/profile", auth_default("CUSTOMER" /* CUSTOMER */), userController2.updateUserProfile);
var userRouter = router8;

// src/app.ts
var app = express8();
app.use(cors({
  origin: [
    process.env.APP_URL || "http://localhost:5000"
  ],
  credentials: true
}));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express8.json());
app.use("/api/v1/medicine", medicineRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/categories", medicineCategoryRoutes);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/cart", CartRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/seller", sellerRouter);
app.use("/api/v1/user", userRouter);
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
