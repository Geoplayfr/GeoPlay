import { Router } from 'express'
import {getUsers, getUser} from '../controllers/user/get.user.js'
import {postAddUser, postCheckUser} from '../controllers/user/post.user.js'
import {putModifyPassword, putModifyUsername}  from '../controllers/user/put.user.js'
import deleteUser from '../controllers/user/delete.user.js'
import {getScoreUser} from '../controllers/score/get.score.js'
import {getQuizUser} from '../controllers/quiz/get.quiz.js'

const router = Router()
router.get('/all', getUsers)
router.get('/:userId', getUser)
router.get('/:userId/quizzes', getQuizUser)
router.get('/:userId/scores', getScoreUser)
router.post('/add', postAddUser)
router.post('/check', postCheckUser)
router.put('/:userId', putModifyPassword)
router.put('/:userId/:newUsername', putModifyUsername)
router.delete('/:userId', deleteUser)


export default router