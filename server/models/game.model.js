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
     * Send to every player in the room the current playerlist
     * @returns {void}
     */
    updatePlayerList() {
        this.io.to(this.room).emit('UpdatePlayers',this.playerList)
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