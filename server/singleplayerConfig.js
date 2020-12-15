let timerPlayer = []
/**
 *
 * @param {Socket} io
 */
function setupSingleplayerSockets (io) {
  console.log('>>> Setting up socket io (Singleplayer)')
  io.on('connection', socket => {
    socket.on('enableServerTimer', data => {
      const timerId = setTimeout(() => {
        // remove timer from list
        const existingTimer = timerPlayer.find(t => t.player.id === data.id)
        if (existingTimer !== undefined) {
          timerPlayer = timerPlayer.filter(t => t.player.id !== data.id) // Remove existing timer
        }
        // Send the event
        io.to(socket.id).emit('timerFinished')
      }, data.duration * 1000)
      // Store the timer, associated to a player
      timerPlayer.push({
        timer: timerId,
        player: data
      })
    })

    socket.on('disableServerTimer', data => {
      const selectedPlayerTimer = timerPlayer.find(t => t.player.id === data.player.id)
      timerPlayer = timerPlayer.filter(t => t.player.id !== data.player.id)
      console.log(selectedPlayerTimer)
      if (selectedPlayerTimer !== undefined) {
        clearTimeout(selectedPlayerTimer.timer)
      }
    })
  })
}

export default setupSingleplayerSockets
