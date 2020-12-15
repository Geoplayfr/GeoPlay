import Quiz from "./quiz.model"

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
    gameState
    /** @type  {Quiz} */
    quizz
    /** @type {String} */
    room
    /** @type {Number} */
    correction_duration = 5
    /** @type {Number} */
    playerLimit = 0

    /**
     * Determines if new players can connect to the game
     */
    canJoin(player) {
        if(this.playerList.length < this.playerLimit){
            return true
        }
        return false
    }
}