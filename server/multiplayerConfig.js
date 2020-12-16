import Game from './models/game.model'
const axios = require('axios')
const GAME_STATE_RECEIVED = 'GameStateReceived'
const UPDATE_PLAYERS = 'UpdatePlayers'
let gameId = 0
const serverUrl = process.env.SERVER_URL || 'http://localhost:3000'
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
        io.to(game.room).emit(UPDATE_PLAYERS, game.playerList)
      }
      const correction = {
        status: 'CORRECTING',
        correcting_data: {
          response_location_id: game.quizz.questions[game.curQuestionIndex].response_location_id,
          score: parseInt(player.score),
          correction_duration: game.correction_duration
        }
      }
      io.to(socket.id).emit(GAME_STATE_RECEIVED, correction)
      console.log('Emitted correction to client, wait ' + game.correction_duration + ' seconds')
    })
  }
}

/**
 * @param {Socket} socket
 * @param {Game} game
 */
function setupGameTimer (io, socket, game, firstTime = true) {
  console.log('>>>    Starting game round ...')
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
    console.log('Waiting for the question to end: ', questionDur, ' seconds')

    // Collect the results & edit score
    setTimeout(() => {
      console.log('Collecting player results')
      io.to(game.room).emit('RequestQuestionResult')

      // For new players
      game.state = {
        status: 'CORRECTING',
        correcting_data: {
          response_location_id: game.quizz.questions[game.curQuestionIndex].response_location_id,
          score: 0,
          correction_duration: game.correction_duration
        }
      }
      // React to each player answer for the current question
      // Prendre l'ensemble des sockets dans la room
      if (firstTime) { setupCorrectionListener(socket, game, io) }
      setTimeout(() => {
        game.curQuestionIndex++
        setupGameTimer(io, socket, game, false)
      }, game.correction_duration * 1000)
    }, questionDur * 1000)
  } else {
    game.playerList.forEach(p => p)
    io.to(game.room).emit(GAME_STATE_RECEIVED, {
      status: 'STOPPED',
      stopped_data: {
        game: game
      }
    })
    games = games.filter(g => g.room !== game.room)
  }
}

/**
 * Socket IO configuration for GeoPlay online
 * @param {Socket} io
 */
function setupGameSockets (io) {
  console.log('>>> Setting up socket IO')
  io.on('connection', socket => {
    socket.on('disconnect', function () {
      games.forEach(g => {
        const playerToRmv = g.playerList.find(p => p.socketId === socket.id)
        if (playerToRmv !== undefined) {
          g.playerList = g.playerList.filter(p => p !== playerToRmv)
          io.to(g.room).emit(UPDATE_PLAYERS, g.playerList)
        }
      })
    })

    // Register the player to the game network for the given room
    socket.on('RequestGameState', (data, errorCallback) => {
      if (!data.id || !data.username) {
        return errorCallback('Invalid data format for the user requesting the game state')
      }
      console.log('Client wants to start game', data)

      socket.join(data.room)
      let player
      const assignedGame = games.find(g => g.room === data.room)
      if (!assignedGame) {
        console.log('MODE : New game')
        // First player to start the game, instantiate the Game room
        const game = new Game()
        game.curQuestionIndex = 0
        game.state = {
          status: 'WAITING'
        }
        game.id_game = gameId++
        io.to(socket.id).emit(GAME_STATE_RECEIVED, game.state)
        axios.get(serverUrl + '/api/quizzes/' + data.id_quiz).then((response) => {
          game.quizz = response.data
          const waitForQuestions = new Promise((resolve, reject) => {
            console.log(game.quizz)
            for (let index = 0; index < game.quizz.questions.length; index++) {
              const q = game.quizz.questions[index]
              game.quizz.questions[index].response_location_id =
                                    axios.get(serverUrl + '/api/questions/response/' + q.id_question).then(respQuestion => {
                                      q.response_location_id = respQuestion.data[0].response_location_id
                                      if (index === game.quizz.questions.length - 1) {
                                        resolve()
                                      }
                                    })
            }
          })
          waitForQuestions.then(() => {
            game.room = data.room
            delete data.quiz_id // Not needed because referenced in the game
            game.playerList = [data]
            data.socketId = socket.id
            data.score = 0
            games.push(game)
            io.to(data.room).emit(UPDATE_PLAYERS, game.playerList)
            io.to(socket.id).emit(GAME_STATE_RECEIVED, game.state)
            setupGameTimer(io, socket, game)
          }).catch((error) => {
            console.error(error.message)
            console.error(error.stack)
            console.error(error)
          })
        }).catch((error) => {
          console.error(error.message)
          console.error(error.stack)
          console.error(error)
        })
      } else {
        console.log('MODE : Join')
        for (let index = 0; index < assignedGame.quizz.questions.length; index++) {
          const q = assignedGame.quizz.questions[index]
          assignedGame.quizz.questions[index].response_location_id =
                                axios.get(serverUrl + '/api/questions/response/' + q.id_question).then(respQuestion => {
                                  console.log('response of question ' + q.id_question + ' : ' + respQuestion)
                                  q.response_location_id = respQuestion.data[0].response_location_id
                                  if (index === assignedGame.quizz.questions.length - 1) {
                                    resolve()
                                  }
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
        io.to(data.room).emit(UPDATE_PLAYERS, assignedGame.playerList)
        io.to(data.room).emit(GAME_STATE_RECEIVED, assignedGame.state)
      }
    })
    socket.on('createLobby', (data, errorCallback) => {
      if (!data.id || !data.username) {
        return errorCallback('Invalid data format for the user requesting the game state')
      }
      socket.join(data.room)
      const assignedGame = games.find(g => g.room === data.room)
      if (!assignedGame) {
        // First player to start the game, instantiate the Game room
        const game = new Game()
        game.curQuestionIndex = 0
        game.state = {
          status: 'WAITING'
        }
        game.id_game = gameId++
        console.log('Requesting quiz')
        axios.get(serverUrl + '/api/quizzes/' + data.id_quiz).then((response) => {
          game.quizz = response.data
          console.log('Quiz obtained', game.quizz)
          game.room = data.room
          delete data.quiz_id // Not needed because referenced in the game
          game.playerList = []
          if (game.playerList.length < data.room_size) {
            const userAlreadyConnected = game.playerList.find(o => o.id === data.id)
            if (!userAlreadyConnected) {
              game.playerList.push({
                id: data.id,
                username: data.username,
                score: 0
              })
            }
          }
          data.score = 0
          games.push(game)
          console.log('before update player :', game.playerList)
          io.to(data.room).emit('UpdatePlayers', game.playerList)
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
              score: 0
            })
          }
        }
        io.to(data.room).emit('UpdatePlayers', assignedGame.playerList)
        io.to(socket.id).emit('GameStateReceived', assignedGame.state)
        io.to(data.room).emit('addUser', assignedGame.playerList)
      }
    })
    socket.on('joinLobby', (data, errorCallback) => {
      if (!data.id || !data.username) {
        return errorCallback('Invalid data format for the user requesting the game state')
      }
      socket.join(data.room)
      const assignedGame = games.find(g => g.room === data.room)
      if (assignedGame !== undefined) {
        if (assignedGame.playerList.length < data.room.split('-')[2]) {
          io.to(data.room).emit('validateJoin', {
            quiz_id: data.room.split('-')[1],
            nbPlayers: data.room.split('-')[2]
          })
        } else {
          io.emit('fullRoom', {})
        }
      }
    })
    socket.on('leaveRoom', (data, errorCallback) => {
      socket.emit('playerLeave', {})
      socket.leave(data.room)
      const assignedGame = games.find(g => g.room === data.room)
      const index = assignedGame.playerList.findIndex(o => o.id === data.id)
      assignedGame.playerList.splice(index, 1)
      io.to(data.room).emit('addUser', assignedGame.playerList)
    })
    socket.on('leaveRoomCreator', (data, errorCallback) => {
      io.to(data.room).emit('playerLeave', {})
      socket.leave(data.room)
    })
    socket.on('launchGame', (data, errorCallback) => {
      io.to(data.room).emit('startGame', {})
      const assignedGame = games.find(g => g.room === data.room)
      setupGameTimer(io, socket, assignedGame)
    })
  })
}

export default setupGameSockets
