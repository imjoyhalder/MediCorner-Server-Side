import express, { Application, Request, Response } from "express"
import { auth } from "./lib/auth";
import cors from "cors"


import { toNodeHandler } from "better-auth/node";
import { medicineRouter } from "./modules/medicine/medicine.router";
import { reviewRouter } from "./modules/review/review.router";
import { userRouter } from "./modules/user/user.router";

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


app.get('/', (req: Request, res: Response) => {
    res.status(200).send({
        success: true,
        message: 'MediCorner Server is running',
        path: req.path
    })
})

// app.use(notFound)

// app.use(errorHandler)



export default app; 