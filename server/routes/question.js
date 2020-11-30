import { Router } from 'express'
import {getResponseLocationId} from '../controllers/question/get.question.js'
import {postAddQuestions} from '../controllers/question/post.question.js'
import {putModifyQuestion} from '../controllers/question/put.question.js'
import deleteQuestion from '../controllers/question/delete.question.js'

const router = Router()
router.get('/response/:questionId', getResponseLocationId)
router.post('/add', postAddQuestions)
router.put('/update/:questionId', putModifyQuestion)
router.delete('/delete/:questionId', deleteQuestion)

export default router