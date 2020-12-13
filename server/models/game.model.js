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


    /**
     * Determines if new players can connect to the game
     */
    canJoin(player) {
        return true
    }
}