import express from 'express'
const router = express.Router()

import userRouter from './user.js'
router.use('/', userRouter)

export default router
