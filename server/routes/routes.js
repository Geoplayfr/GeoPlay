import express from 'express'
const router = express.Router()

import userRouter from './user.js'
import quizRouter from './quiz.js'

router.use('/users', userRouter)
router.use('/quizzes', quizRouter)

export default router
