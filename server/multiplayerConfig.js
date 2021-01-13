import Game from './models/game.model'
const axios = require('axios')
const GAME_STATE_RECEIVED = 'GameStateReceived'
let gameId = 0
let serverUrl = process.env.SERVER_URL || 'http://localhost:3000'
if (serverUrl.endsWith('/')) {
  serverUrl = serverUrl.slice(0, -1)
}

/**
 * List of game sessions
 * @type {Array<Game>}
 */
let games = []
/**
 * @param {Socket} socket - The player's socket
 * @param {Game} game
 * @param {Socket} io
 */
function setupCorrectionListener (socket, game, io) {
  socket.removeAllListeners('QuestionResult')
  if (!socket.eventNames().includes('QuestionResult')) {
    socket.on('QuestionResult', (data) => {
      if (!data.id) {
        throw new Error('Player id not found')
      }
      const player = game.playerList.find(p => p.id === data.id)
      // Verify player's answer
      if (data.response_location_id === game.quizz.questions[game.curQuestionIndex].response_location_id) {
        player.score++
        game.updatePlayerList()
      }
      // If player is still in the game
      if (player !== undefined) {
        const correction = {
          status: 'CORRECTING',
          correcting_data: {
            response_location_id: game.quizz.questions[game.curQuestionIndex].response_location_id,
            score: parseInt(player.score),
            correction_duration: game.correction_duration
          }
        }
        io.to(socket.id).emit(GAME_STATE_RECEIVED, correction)
      } else {
        game.updatePlayerList()
      }
    })
  }
}

/**
 * Starts the server timer, that will start a game round.
 * In the default gamemode, each round consist of a 2 phases: a playing phase and a correction phase
 *
 * @param {Socket} socket
 * @param {Game} game
 */
function setupGameTimer (io, socket, game, firstTime = true) {
  // Show cur question
  if (game.curQuestionIndex < game.quizz.nb_questions) {
    const questionDur = game.quizz.questions[game.curQuestionIndex].duration
    const obj = {
      status: 'PLAYING',
      playing_data: {
        question: game.quizz.questions[game.curQuestionIndex],
        questionIndex: game.curQuestionIndex,
        remainingSeconds: questionDur
      }
    }
    game.state = obj
    // Start the game
    io.to(game.room).emit(GAME_STATE_RECEIVED, obj)

    // Collect the results & edit score
    setTimeout(() => {
      io.to(game.room).emit('RequestQuestionResult')

      game.state = {
        status: 'CORRECTING',
        correcting_data: {
          response_location_id: game.quizz.questions[game.curQuestionIndex].response_location_id,
          score: 0,
          correction_duration: game.correction_duration
        }
      }
      // React to each player answer for the current question
      if (firstTime) { setupCorrectionListener(socket, game, io) }
      setTimeout(() => {
        game.curQuestionIndex++
        // Start the next round of the quiz
        setupGameTimer(io, socket, game, false)
      }, game.correction_duration * 1000)
    }, questionDur * 1000)
  } else {
    delete game.io // Very important to delete the reference, not doing so will result in a server crash (because of recursive socket calls)
    io.to(game.room).emit(GAME_STATE_RECEIVED, {
      status: 'STOPPED',
      stopped_data: {
        game: game
      }
    })
    games = games.filter(g => g.room !== game.room)
    socket.leave(game.room)
  }
}

/**
 * Socket IO configuration for GeoPlay online, must be called once, when instantiating socket IO server
 * @param {Socket} io
 */
function setupGameSockets (io) {
  io.on('connection', socket => {
    socket.on('disconnect', function () {
      games.forEach(g => {
        const playerToRmv = g.playerList.find(p => p.socketId === socket.id)
        if (playerToRmv !== undefined) {
          g.playerList = g.playerList.filter(p => p !== playerToRmv)
          g.updatePlayerList()
        }
      })
    })

    // Register the player to the game network for the given room
    socket.on('RequestGameState', (data, errorCallback) => {
      if (!data.id || !data.username) {
        return errorCallback('Invalid data format for the user requesting the game state')
      }

      socket.join(data.room)
      let player
      const assignedGame = games.find(g => g.room === data.room)
      for (let index = 0; index < assignedGame.quizz.questions.length; index++) {
        const q = assignedGame.quizz.questions[index]
        assignedGame.quizz.questions[index].response_location_id =
                                axios.get(serverUrl + '/api/questions/response/' + q.id_question).then(respQuestion => {
                                  q.response_location_id = respQuestion.data[0].response_location_id
                                })
      }
      games.forEach(g => {
        if (player === undefined) {
          player = g.playerList.find(p => p.id === data.id)
        }
      })
      // New player
      if (player === undefined) {
        player = data
        player.score = 0
        data.socketId = socket.id
        assignedGame.playerList.push(player)
      }
      setupCorrectionListener(socket, assignedGame, io)
      assignedGame.updatePlayerList()
      io.to(data.room).emit(GAME_STATE_RECEIVED, assignedGame.state)
    })

    // Create a new lobby that can group players for an new game
    socket.on('createLobby', (data, errorCallback) => {
      if (!data.id || !data.username || !data.id_quiz || !data.room) {
        return errorCallback('Invalid data format for the user requesting the game state')
      }
      socket.join(data.room)
      const assignedGame = games.find(g => g.room === data.room)
      if (!assignedGame) {
        // First player to start the game, instantiate the Game room
        const game = new Game(io)
        game.curQuestionIndex = 0
        game.state = {
          status: 'WAITING'
        }
        game.id_game = gameId++
        axios.get(serverUrl + '/api/quizzes/' + data.id_quiz).then((response) => {
          game.quizz = response.data
          game.room = data.room
          game.playerList = []
          if (game.playerList.length < data.room_size) {
            const userAlreadyConnected = game.playerList.find(o => o.id === data.id)
            if (!userAlreadyConnected) {
              game.playerList.push({
                id: data.id,
                username: data.username,
                socketId: socket.id,
                score: 0
              })
            }
          }
          data.score = 0
          games.push(game)
          game.updatePlayerList()
          io.to(socket.id).emit('GameStateReceived', game.state)
          io.to(data.room).emit('addUser', game.playerList)
        }).catch((error) => {
          console.error(error)
        })
      } else {
        if (assignedGame.playerList.length < data.room_size) {
          const userAlreadyConnected = assignedGame.playerList.find(o => o.id === data.id)
          if (!userAlreadyConnected) {
            assignedGame.playerList.push({
              id: data.id,
              username: data.username,
              socketId: socket.id,
              score: 0
            })
          }
        }
        assignedGame.updatePlayerList()
        io.to(socket.id).emit('GameStateReceived', assignedGame.state)
        io.to(data.room).emit('addUser', assignedGame.playerList)
      }
    })

    // Join an existing lobby
    socket.on('joinLobby', (data) => {
      const assignedGame = games.find(g => g.room === data.room)
      if (assignedGame !== undefined) {
        if (assignedGame.lobbyOpen) {
          socket.join(data.room)
          if (assignedGame.playerList.length < data.room.split('-')[2]) {
            io.to(data.room).emit('validateJoin', {
              quiz_id: data.room.split('-')[1],
              nbPlayers: data.room.split('-')[2]
            })
          } else {
            io.emit('fullRoom', { msg: 'Game lobby is full (' + assignedGame.playerLimit + '/' + assignedGame.playerLimit + ')' })
          }
        } else {
          io.emit('lockedRoom', { msg: 'Game lobby is locked' })
        }
      }
    })
    // When the creator locks or unlocks the game lobby
    socket.on('lobbyLock', (data) => {
      const assignedGame = games.find(g => g.room === data.room)
      assignedGame.lobbyOpen = data.lobbyOpen
      io.to(data.room).emit('setRoomInfo', { lobbyOpen: assignedGame.lobbyOpen ? 'Open' : 'Locked' })
    })
    // When a player (non creator) leaves the lobby
    socket.on('leaveRoom', (data) => {
      socket.emit('playerLeave', {})
      socket.leave(data.room)
      const assignedGame = games.find(g => g.room === data.room)
      const index = assignedGame.playerList.findIndex(o => o.id === data.id)
      assignedGame.playerList.splice(index, 1)
      io.to(data.room).emit('addUser', assignedGame.playerList)
    })
    // When a player wants to be kicked, we indicate the room and the id of the player to kick
    socket.on('requestKick', clientData => {
      const assignedGame = games.find(g => g.room === clientData.room)
      const player = assignedGame.playerList.find(o => o.id === clientData.id)
      assignedGame.playerList.splice(assignedGame.playerList.indexOf(player), 1)
      io.to(player.socketId).emit('playerLeave', {})
      io.to(assignedGame.room).emit('addUser', assignedGame.playerList)
    })

    // When the creator of the quits the lobby, everyone quits
    socket.on('leaveRoomCreator', (data) => {
      io.to(data.room).emit('playerLeave', {})
      socket.leave(data.room)
    })

    // Start the game, and signal game start to players
    socket.on('launchGame', (data) => {
      io.to(data.room).emit('startGame', {})
      const assignedGame = games.find(g => g.room === data.room)
      setupGameTimer(io, socket, assignedGame)
    })
  })
}

export default setupGameSockets
