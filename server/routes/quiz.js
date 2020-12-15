import { Router } from 'express'
import { getQuizzes, getQuiz } from '../controllers/quiz/get.quiz.js'
import { getScoreQuiz } from '../controllers/score/get.score.js'
import { postAddQuiz } from '../controllers/quiz/post.quiz.js'
import { putModifyQuiz } from '../controllers/quiz/put.quiz.js'
import deleteQuiz from '../controllers/quiz/delete.quiz.js'

const router = Router()
router.get('/all', getQuizzes)
router.get('/:quizId', getQuiz)
router.get('/:quizId/scores', getScoreQuiz)
router.post('/add', postAddQuiz)
router.put('/update/:quizId', putModifyQuiz)
router.delete('/delete/:quizId', deleteQuiz)

export default router
