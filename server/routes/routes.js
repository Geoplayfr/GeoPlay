import express from 'express'
const router = express.Router()

import userRouter from './user.js'
import quizRouter from './quiz.js'
import questionRouter from './question.js'
import scoreRouter from './score.js'

router.use('/users', userRouter)
router.use('/quizzes', quizRouter)
router.use('/questions', questionRouter)
router.use('/scores', scoreRouter)

export default router
