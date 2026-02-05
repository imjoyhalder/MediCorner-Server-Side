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
        'http://localhost:3000', 
        "https://medicorner-client.vercel.app",
        "https://medicorner-client-11v3g6lqp-joy-halders-projects.vercel.app"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))


app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json())

app.use('/medicine', medicineRouter)
app.use('/review', reviewRouter)

app.use('/categories', medicineCategoryRoutes)
app.use('/order', orderRouter)
app.use('/cart', CartRouter)

app.use('/admin', adminRouter)
app.use('/seller', sellerRouter)
app.use('/user', userRouter)


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