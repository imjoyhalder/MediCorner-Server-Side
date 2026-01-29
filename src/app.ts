import express, { Application, Request, Response } from "express"
import { auth } from "./lib/auth";
import cors from "cors"

import { toNodeHandler } from "better-auth/node";
import { medicineRouter } from "./modules/medicine/medicine.route";
import { reviewRouter } from "./modules/review/review.route";
import { adminRouter } from "./modules/admin/admin.route";
import errorHandler from "./middlewares/errorHandler";
import { medicineCategoryRoutes } from "./modules/medicineCategory/medicineCategory.route";
import { notFound } from "./middlewares/notFound";
import { orderRouter } from "./modules/order/placeOrder.route";
import { CartRouter } from "./modules/cart/cart.route";
import { sellerRouter } from "./modules/seller/seller.route";
import { userRouter } from "./modules/user/user.route";

const app: Application = express()

app.use(cors({
    origin: [
        process.env.APP_URL || 'http://localhost:5000'
    ],
    credentials: true
}))

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json())

app.use('/api/v1/medicine', medicineRouter)
app.use('/api/v1/review', reviewRouter)

app.use('/api/v1/categories', medicineCategoryRoutes)
app.use('/api/v1/order', orderRouter)
app.use('/api/v1/cart', CartRouter)

app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/seller', sellerRouter)
app.use('/api/v1/user', userRouter)


app.get('/', (req: Request, res: Response) => {
    res.status(200).send({
        success: true,
        message: 'MediCorner Server is running',
        path: req.path
    })
})

app.use(notFound)

// app.use(errorHandler)



export default app; 