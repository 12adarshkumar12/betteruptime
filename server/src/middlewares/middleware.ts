import express from 'express'
import jwt, { decode } from 'jsonwebtoken'
import type { authenticatedRequest } from '../interfaces/interface'

export function authMiddleware(req: authenticatedRequest, res: express.Response, next: express.NextFunction){
    const jwt_token = req.cookies.jwt
    if (!jwt_token) return res.status(401).json({
        message: "Login first to continue"
    })
    try {
        const decoded = jwt.verify(jwt_token, process.env["JWT_SECRET"] as string) as {user_id : string}
        if (decoded) {
            req.user_id = decoded.user_id
            next()
        }
    } catch(e) {
        return res.status(401).json({
            message: "Session expired Login again"
        })
    }
}

export function rateLimitter(req: express.Request, res: express.Response, next: express.NextFunction){

}