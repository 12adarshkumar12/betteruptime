import express from 'express'
import { z } from 'zod'
import { newClient } from '../../../packages/db/src/index'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const User = z.object({
    user_email: z.string(),
    password : z.string().min(4).optional()
})

export async function signinController(req: express.Request, res: express.Response){
    let { email, password } = req.body;
    if (!email) return res.status(401).json({message : "Email field is empty"})
    try {
        const user = await newClient.user.findFirst({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true
            }
        })
        if (!user) return res.status(401).json({message : "User not found"})
        if (user.password) {
            if (!password) return res.status(401).json({
                message:"Password field is empty"
            })
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" })
            }
        }
        const token = jwt.sign(
            { user_id: user.id },
            process.env["JWT_SECRET"] || "default_secret",
            { expiresIn: '24h' }
        )

        res.cookie('jwt', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: "Login successful",
            userId: user?.id
        })
    } catch (e) {
        console.error("Login error:", e);
        res.status(500).json({ message: "Login failed" })
    }
}

export function signoutController(req: express.Request, res: express.Response){
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true })
    res.status(200).json({
        message: "User logged out successfully"
    })
}

export async function signupController(req: express.Request, res: express.Response){
    const validuser = User.safeParse(req.body)
    if (!validuser) {
        return res.status(400).json({
            message:"Credentials are not came as expected"
        })
    }
    const password = validuser.data?.password
    const user_email = validuser.data?.user_email as string
    let hashPassword = null
    if (password) {
        hashPassword = bcrypt.hashSync(password, 4)
    }
    try {
        const user = await newClient.user.findUnique({
            where: {
                email: user_email
            },
            select: {
                email: true,
                password: true,
                id: true
            }
        })
        if (user) {
            return res.status(200).json({
                message: "User already exists",
                data: user
            })
        }
        const createdUser = await newClient.user.create({
            data: {
                email: user_email,
                password: hashPassword
            }
        })
        return res.status(200).json({
            message: "User created successfully",
            data : createdUser
        })
    } catch (error) {
        return res.status(500).json({
            message: "DB connection error"
        })
    }
}

export async function changePassword(req: express.Request, res: express.Response){
    
}