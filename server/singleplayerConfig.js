/**
 * 
 * @param {Socket} io 
 */
function setupSingleplayerSockets(io) {
    console.log('>>> Setting up socket io (Singleplayer)')
    io.on('connection', socket => {
        socket.on('enableServerTimer', data => {
            setTimeout(() => {
                socket.emit('timerFinished')
            }, data.duration * 1000);
        })
    })
}


export default setupSingleplayerSockets