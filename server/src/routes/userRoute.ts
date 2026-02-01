import express from 'express'
import { loadWebsiteData, websitesOverview } from '../controllers/userController'

const userRouter = express.Router()

userRouter.get('/', websitesOverview)
userRouter.get('/monitor', loadWebsiteData)

export default userRouter 