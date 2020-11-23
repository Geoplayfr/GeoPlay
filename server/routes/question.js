import { Router } from 'express'
import {postAddQuestions} from '../controllers/question/post.question.js'
import {putModifyQuestion} from '../controllers/question/put.question.js'
import deleteQuestion from '../controllers/question/delete.question.js'

const router = Router()
router.post('/add', postAddQuestions)
router.put('/update/:questionId', putModifyQuestion)
router.delete('/delete/:questionId', deleteQuestion)

export default router