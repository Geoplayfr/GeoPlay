import http from 'http'
import socketIO from 'socket.io'
import setupMultiplayer from '../server/multiplayerConfig'
import setupSingleplayer from '../server/singleplayerConfig'
import postgresStore from '../server/postgres-store.js'
import config from '../server/server.config'
export default function () {
  this.nuxt.hook('render:before', async (renderer) => {
    const server = http.createServer(this.nuxt.renderer.app)
    const io = socketIO(server)
    setupSingleplayer(io)
    setupMultiplayer(io)
    try {
      await postgresStore.init(config.postgres)

      const queryString = 'IF (SELECT * from users)'
      const query = await postgresStore.client.query({
        text: queryString
      })
      if (query.rows.length === 0) {
        throw new ReferenceError('One of the table \'users\' is missing, did you initialize the database with \'npm run db\' ?')
      }
      console.log(query.rows)
    } catch (e) {
      e.message += ' \ndid you try to initialize the database with \'npm run db \'?'
      throw e
    }
    // overwrite nuxt.server.listen()
    this.nuxt.server.listen = (port, host) => new Promise(resolve => server.listen(port || process.env.PORT || 3000, process.env.HOST || 'localhost', resolve))
    // close this server on 'close' event
    this.nuxt.hook('close', () => new Promise(server.close))
  })
}
