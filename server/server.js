import express from 'express'
import session from 'express-session'
import logger from 'morgan'
import apiRouter from './routes/routes.js'
import config from './server.config.js'
import postgresStore from './postgres-store.js'

export default async function run () {
  await postgresStore.init(config.postgres)
  // const queryString = 'SELECT EXISTS (SELECT 1 FROM   information_schema.tables WHERE  table_name = "users");'

  const app = express()

  app.use(logger('dev'))
  app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))

  app.use('/api/', apiRouter)
  return app
}
run()
