import http from 'http'
import socketIO from 'socket.io'

export default function () {
  this.nuxt.hook('render:before', (renderer) => {
    const server = http.createServer(this.nuxt.renderer.app)
    const io = socketIO(server)

    // overwrite nuxt.server.listen()
    this.nuxt.server.listen = (port, host) => new Promise(resolve => server.listen(port || 3000, host || 'localhost', resolve))
    // close this server on 'close' event
    this.nuxt.hook('close', () => new Promise(server.close))

    // Add socket.io events
    const messages = []
    io.on('connection', (socket) => {
      // Sending every 5 seconds a message to the game (test)
      setInterval(() => {
        socket.emit('msg-to-game', 'curdate test : ' + Date.now())
      }, 5000);
      socket.on('send-message', function (message) {
        console.log('Server received something : ' + message)
      })
    })
  })
}
