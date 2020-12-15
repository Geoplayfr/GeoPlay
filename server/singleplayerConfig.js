let timerId
/**
 *
 * @param {Socket} io
 */
function setupSingleplayerSockets (io) {
  console.log('>>> Setting up socket io (Singleplayer)')
  io.on('connection', socket => {
    socket.on('enableServerTimer', data => {
      timerId = setTimeout(() => {
          console.log('EMIT')
        socket.emit('timerFinished')
      }, /* data.duration */ 2 * 1000)
    })

    socket.on('disableServerTimer', data => {
      if (timerId !== undefined) {
        clearInterval(timerId)
        console.log('Disabled server timer')
      } else {
        console.log('Could not clear interval ')
      }
    })
  })
}

export default setupSingleplayerSockets
