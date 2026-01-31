import express from "express";
import userRouter from "./routes/userRoute";
import authRouter from "./routes/authRoute";

const app = express()

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.listen(process.env["PORT"] || 3001, () => {
    console.log(`Server is running on port ${process.env["PORT"]}`)
})