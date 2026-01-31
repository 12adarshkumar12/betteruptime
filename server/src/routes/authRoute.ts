import express from 'express'
import { signinController, signoutController, signupController } from '../controllers/authController'

const authRouter = express.Router()

authRouter.post('/signin', signinController)
authRouter.post('/signup', signupController)
authRouter.post('/signout', signoutController)

export default authRouter


