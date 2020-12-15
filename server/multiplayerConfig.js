import Game from './models/game.model'
const axios = require('axios');

let gameId = 0

/**
 * List of game sessions
 * @type {Array<Game>}
 */
let games = []
let playerList = []
/**
 * 
 * @param {Game} game 
 */
function setupGameTimer(game) {
    console.log('Setup game timer ...')
    console.log('Game to start : ', game)
}

/**
 * Socket IO configuration for GeoPlay online
 * @param {Socket} io 
 */
function setupGameSockets(io) {
    console.log(">>> Setting up socket IO")
    io.on('connection', socket => {
        // Register the player to the game network for the given room
        socket.on('RequestGameState', (data, errorCallback) => {
            if (!data.id || !data.username) {
                return errorCallback('Invalid data format for the user requesting the game state')
            }
            console.log('Client wants to start game', data)

            socket.join(data.room)
            let player = undefined
            let assignedGame = games.find(g => g.room === data.room)
            
            if (!assignedGame) {
                // First player to start the game, instantiate the Game room
                let game = new Game()
                game.curQuestionIndex = 0
                game.state = {
                    status: 'WAITING',
                }
                game.id_game = gameId++ 
                console.log('Requesting quiz')
                axios.get('http://localhost:3000/api/quizzes/' + data.id_quiz).then((response) => {
                    game.quizz = response.data
                    console.log('Quiz obtained', game.quizz)
                    game.room = data.room
                    delete data.quiz_id // Not needed because referenced in the game
                    game.playerList = [data]
                    data.score = 0
                    games.push(game)
                    io.to(data.room).emit('UpdatePlayers', data)
                    io.to(socket.id).emit('GameStateReceived', game.state)
                    setupGameTimer(game)
                }).catch((error) => {
                    console.error(error)
                })
            }
            else {
                games.forEach(g => {
                    if (player === undefined) {
                        player = g.playerList.find(p => p.id === data.id)
                    }
                });
                // New player
                if (player === undefined) {
                    assignedGame.playerList.push(player)
                } else {

                }
                io.to(data.room).emit('UpdatePlayers', player)
                // TODO send game state to everyone
                io.to(data.room).emit('GameStateReceived', game.state)
            }
        })
        socket.on('createLobby', (data, errorCallback)  => {
            if (!data.id || !data.username) {
                return errorCallback('Invalid data format for the user requesting the game state')
            }
            socket.join(data.room)
            let assignedGame = games.find(g => g.room === data.room)
            if (!assignedGame) {
                // First player to start the game, instantiate the Game room
                let game = new Game()
                game.curQuestionIndex = 0
                game.state = {
                    status: 'WAITING',
                }
                game.id_game = gameId++ 
                console.log('Requesting quiz')
                axios.get('http://localhost:3000/api/quizzes/' + data.id_quiz).then((response) => {
                    game.quizz = response.data
                    console.log('Quiz obtained', game.quizz)
                    game.room = data.room
                    delete data.quiz_id // Not needed because referenced in the game
                    game.playerList = []
                    if (game.playerList.length < data.room_size) {
                        let userAlreadyConnected = game.playerList.find(o => o.id === data.id)
                        if (!userAlreadyConnected) {
                            game.playerList.push({
                            id: data.id,
                            username: data.username
                          })
                        }
                    }
                    data.score = 0
                    games.push(game)
                    io.to(data.room).emit('UpdatePlayers', data)
                    io.to(socket.id).emit('GameStateReceived', game.state)
                    setupGameTimer(game)
                    io.to(data.room).emit('addUser', game.playerList)
                }).catch((error) => {
                    console.error(error)
                })
            } else {
                if (assignedGame.playerList.length < data.room_size) {
                    let userAlreadyConnected = assignedGame.playerList.find(o => o.id === data.id)
                    if (!userAlreadyConnected) {
                        assignedGame.playerList.push({
                            id: data.id,
                            username: data.username
                        })
                    }
                }
                io.to(data.room).emit('addUser', assignedGame.playerList)
            }
        })
        socket.on('joinLobby', (data, errorCallback)  => {
            if (!data.id || !data.username) {
                return errorCallback('Invalid data format for the user requesting the game state')
            }
            socket.join(data.room)
            let assignedGame = games.find(g => g.room === data.room)
            if (assignedGame.playerList.length < data.room.split('-')[2]) {
                io.to(data.room).emit('validateJoin', {
                quiz_id: data.room.split('-')[1],
                nbPlayers: data.room.split('-')[2]
            })
            } else {
                io.emit('fullRoom', {})
            }
        })
        socket.on('leaveRoom', (data, errorCallback)  => {
            socket.emit('playerLeave', {})
            socket.leave(data.room)
            let assignedGame = games.find(g => g.room === data.room)
            let index = assignedGame.playerList.findIndex(o => o.id === data.id)
            assignedGame.playerList.splice(index, 1)
            io.to(data.room).emit('addUser', assignedGame.playerList)
        })
        socket.on('leaveRoomCreator', (data, errorCallback)  => {
            io.to(data.room).emit('playerLeave', {})
            socket.leave(data.room)
        })
    })
}


export default setupGameSockets