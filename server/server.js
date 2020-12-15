import session from 'express-session'
import logger from 'morgan'
import express from 'express'
import apiRouter from './routes/routes.js'
import config from './server.config.js'
import postgresStore from './postgres-store.js'
const app = express()
const { Nuxt, Builder } = require('nuxt')
const http = require('http').createServer(app)

postgresStore.init(config.postgres)
config.dev = process.env.NODE_ENV !== 'production'

async function start () {
  const nuxt = new Nuxt(config)
  // Start build process in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    builder.build()
  }
  app.use(nuxt.render)
  const port = process.env.PORT || 3000
  http.listen(port, process.env.HOST)
  console.log('Server listening on localhost:' + port) // eslint-disable-line no-console

  app.use(logger('dev'))
  app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))

  app.use('/api/', apiRouter)
}
start()
export default app
