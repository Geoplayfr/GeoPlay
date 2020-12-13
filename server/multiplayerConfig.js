import Game from './models/game.model'
const axios = require('axios');
const GAME_STATE_RECEIVED = "GameStateReceived"
let gameId = 0

/**
 * List of game sessions
 * @type {Array<Game>}
 */
let games = []


/**
 * @param {Socket} socket
 * @param {Game} game 
 */
function setupGameTimer(io, socket, game, firstTime = true) {
    console.log('>>>    Starting game round ...')
    //console.log('Game to start quiz : ', game.quizz.questions)
    // Show cur question
    console.log(game.curQuestionIndex + '/' + game.nb_questions - 1)
    if (game.curQuestionIndex < game.quizz.nb_questions - 1) {

        const questionDur = game.quizz.questions[game.curQuestionIndex].duration
        let obj = {
            status: 'PLAYING',
            playing_data: {
                question: game.quizz.questions[game.curQuestionIndex],
                questionIndex: game.curQuestionIndex,
                remainingSeconds: questionDur
            }
        }
        // Start the game
        io.to(game.room).emit(GAME_STATE_RECEIVED, obj)
        console.log('Waiting for the question to end: ', questionDur, ' seconds')

        // Collect the results & edit score
        setTimeout(() => {
            console.log('Collecting player results')
            io.to(game.room).emit('RequestQuestionResult')

            // React to each player answer for the current question
            if (firstTime)
                socket.on('QuestionResult', (data) => {
                    console.log('Received result')
                    if (!data.id) {
                        throw new Error('Player id not found')
                    }
                    const player = game.playerList.find(p => p.id === data.id)
                    // Verify player's answer
                    if (data.response_location_id === game.quizz.questions[game.curQuestionIndex].response_location_id) {
                        player.score++
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
            setTimeout(() => {
                game.curQuestionIndex++
                setupGameTimer(io, socket, game, false)
            }, game.correction_duration * 1000);
        }, questionDur * 1000)
    } else {
        io.to(game.room).emit(GAME_STATE_RECEIVED, {
            status: 'STOPPED',
            stopped_data: {
                playerList: game.playerList, // contains updated scores
                maxScore: game.nb_questions
            }
        })
    }
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
                io.to(socket.id).emit(GAME_STATE_RECEIVED, game.state)
                axios.get('http://localhost:3000/api/quizzes/' + data.id_quiz).then((response) => {
                    game.quizz = response.data
                    var waitForQuestions = new Promise((resolve, reject) => {
                        for (let index = 0; index < game.quizz.questions.length; index++) {
                            let q = game.quizz.questions[index]
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
                        console.log('Quiz obtained', game.quizz)
                        game.room = data.room
                        delete data.quiz_id // Not needed because referenced in the game
                        game.playerList = [data]
                        data.score = 0
                        games.push(game)
                        io.to(data.room).emit('UpdatePlayers', game.playerList)
                        io.to(socket.id).emit(GAME_STATE_RECEIVED, game.state)
                        setupGameTimer(io, socket, game)
                    }).catch((error) => {
                        console.error(error)
                    })
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
                io.to(data.room).emit(GAME_STATE_RECEIVED, game.state)
            }





        })
    })
}


export default setupGameSockets