import { Router } from 'express'
import {getQuizzes, getQuiz} from '../controllers/quiz/get.quiz.js'

const router = Router()
router.get('/all', getQuizzes)
router.get('/:quizId', getQuiz)

export default router