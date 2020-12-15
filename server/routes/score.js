import { Router } from 'express'
import { postAddScore } from '../controllers/score/post.score.js'
import { putModifyScore } from '../controllers/score/put.score.js'
import deleteScore from '../controllers/score/delete.score.js'

const router = Router()
router.post('/add', postAddScore)
router.put('/update/:scoreId', putModifyScore)
router.delete('/delete/:scoreId', deleteScore)

export default router
