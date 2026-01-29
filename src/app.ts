import express, { Application, Request, Response } from "express"
import { auth } from "./lib/auth";
import cors from "cors"

import { toNodeHandler } from "better-auth/node";
import { medicineRouter } from "./modules/medicine/medicine.route";
import { reviewRouter } from "./modules/review/review.route";
import {  userRouter } from "./modules/user/user.route";
import errorHandler from "./middlewares/errorHandler";
import { medicineCategoryRoutes } from "./modules/medicineCategory/medicineCategory.route";
import { notFound } from "./middlewares/notFound";
import { orderRouter } from "./modules/order/placeOrder.route";
import { CartRouter } from "./modules/cart/cart.route";

const app: Application = express()

app.use(cors({
    origin: [
        process.env.APP_URL || 'http://localhost:5000'
    ],
    credentials: true
}))

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json())

app.use('/medicine', medicineRouter)
app.use('/review', reviewRouter)
app.use('/users', userRouter)
app.use('/categories', medicineCategoryRoutes)
app.use('/api/v1/order', orderRouter)
app.use('/cart', CartRouter)

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