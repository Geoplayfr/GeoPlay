import { Server } from "socket.io"
import Quiz from "./quiz.model"
const axios = require('axios')

/**
 * Game instance for multiplayer only
 */
export default class Game {
    /** @type {Number} */
    id_game
    /** @type {Array<Object>} */
    playerList
    /** @type {Number} */
    curQuestionIndex
    /** @type {Object} */
    state
    /** @type  {Quiz} */
    quizz
    /** @type {String} */
    room
    /** @type {boolean} */
    lobbyOpen = true
    /** @type {Number} */
    correction_duration = 5
    /** @type {Number} */
    playerLimit = 0
    /** @type {Server} */
    io

    /** @param {Server} io */
    constructor (io) {
        if(io === undefined || io === null) {
            throw new ReferenceError('Socket IO server reference is required to create a Game object')
        }
        this.io = io
    }

    /**
     * Get all the client sockets for this room
     * @returns {Array<Socket>}
     */
    getAllSockets() {
        return this.io.sockets.adapter.rooms[this.room].sockets
    }

    /**
     * Send to every player in the room the current playerlist
     * @returns {void}
     */
    updatePlayerList() {
        this.io.to(this.room).emit('UpdatePlayers',this.playerList)
    }

    /**
     * Request a quiz with all the possible answers
     * @param {String} id_quiz
     * @returns {Promise<Quiz>}
     */
    RequestQuizWithAnswers(id_quiz) {

        if(id_quiz === undefined || id_quiz === null ) {
            //throw new ReferenceError('id_quiz is null or undefined')
        }

        if(typeof id_quiz !== 'string') {
           //throw new TypeError('id_quiz must be of type string for requesting a quiz')
        }
        console.log('axios req')
        axios.get(serverUrl + 'api/quizzes/' + id_quiz).then(() => {
            return new Promise((resolve, reject) => {
                for (let index = 0; index < this.quizz.questions.length; index++) {
                  const q = this.quizz.questions[index]
                  this.quizz.questions[index].response_location_id = axios.get(serverUrl + 'api/questions/response/' + q.id_question).then(respQuestion => {
                                          q.response_location_id = respQuestion.data[0].response_location_id
                                          if (index === this.quizz.questions.length - 1) {
                                            resolve(this.quizz)
                                          }
                                        })
                }
              })
        })
    }

    /**
     * Determines if new players can connect to the game
     */
    canJoin() {
        if(this.playerList.length < this.playerLimit){
            return true
        }
        return false
    }
}