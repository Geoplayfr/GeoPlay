import { Router } from 'express'
import getUsers from '../controllers/user/get.users.js'
import postUser from '../controllers/user/post.user.js'

const router = Router()
router.get('/users', getUsers)
router.post('/user', postUser)

export default router