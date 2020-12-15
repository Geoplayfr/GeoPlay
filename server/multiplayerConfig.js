import Game from './models/game.model'
const axios = require('axios')
const GAME_STATE_RECEIVED = 'GameStateReceived'
const UPDATE_PLAYERS = 'UpdatePlayers'
let gameId = 0

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
  socket.off('QuestionResult', () => {})
  if (!socket.eventNames().includes('QuestionResult')) {
    socket.on('QuestionResult', (data) => {
      if (!data.id) {
        throw new Error('Player id not found')
      }
      const player = game.playerList.find(p => p.id === data.id)
      console.log('Received result from', player.username)
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
  // console.log('Game to start quiz : ', game.quizz.questions)
  // Show cur question
  console.log(game.curQuestionIndex, '/', game.nb_questions - 1)
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
      console.log('IO', io.on)
      // React to each player answer for the current question

      // IDEE : mauvais socket utilisé quand le joueur rejoint la partie
      // Prendre l'ensemble des sockets dans la room
      if (firstTime) { setupCorrectionListener(socket, game, io) }
      setTimeout(() => {
        game.curQuestionIndex++
        setupGameTimer(io, socket, game, false)
      }, game.correction_duration * 1000)
    }, 4 * 1000)
  } else {
    game.playerList.forEach(p => p)
    io.to(game.room).emit(GAME_STATE_RECEIVED, {
      status: 'STOPPED',
      stopped_data: {
        game: game
      }
    })
    games = games.filter(g => g.room !== game.room)
    console.log('Number of games after delete : ', games.length)
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
        console.log('Requesting quiz')
        io.to(socket.id).emit(GAME_STATE_RECEIVED, game.state)
        axios.get('http://localhost:3000/api/quizzes/' + data.id_quiz).then((response) => {
          game.quizz = response.data
          var waitForQuestions = new Promise((resolve, reject) => {
            for (let index = 0; index < game.quizz.questions.length; index++) {
              const q = game.quizz.questions[index]
              game.quizz.questions[index].response_location_id =
                                    axios.get('http://localhost:3000/api/questions/response/' + q.id_question).then(respQuestion => {
                                      q.response_location_id = respQuestion.data[0].response_location_id
                                      console.log('Got answer : ', respQuestion.data[0].response_location_id)
                                      if (index === game.quizz.questions.length - 1) {
                                        resolve()
                                      }
                                    })
            }
          })
          waitForQuestions.then(() => {
            // console.log('Quiz obtained', game.quizz)
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
        console.log('MODE : Join game')
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
        } else {

        }
        setupCorrectionListener(socket, assignedGame, io)
        io.to(data.room).emit(UPDATE_PLAYERS, assignedGame.playerList)
        // TODO send game state to everyone
        io.to(data.room).emit(GAME_STATE_RECEIVED, assignedGame.state)
      }
    })
  })
}

export default setupGameSockets
