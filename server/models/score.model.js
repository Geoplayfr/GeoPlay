import Debug from 'debug'
import postgresStore from '../postgres-store.js'
const debug = Debug('geoplay')

export default class Score {
    /** @type {Number} */
    id_score
    /** @type {Number} */
    score_value
    /** @type {Number} */
    id_user
    /** @type {Number} */
    id_quiz

    /**
	 * @param {Number} userId
	 * @returns {Promise<Score[]>}
	 */
	static async getScoreUser (userId) {
		const scores = await postgresStore.client.query({
			text: `
			SELECT scores.score_value, quizzes.name
            FROM scores
            JOIN quizzes ON scores.id_quiz = quizzes.id_quiz
            WHERE scores.id_user = $1
			`,
			values: [userId]
          })
		return scores.rows
    }

    /**
     * 
     * @param {Number} score_value 
     * @param {Number} id_quiz 
     * @param {Number} id_user
     * @return {Promise<Score>} 
     */
    static async addScore(score_value , id_quiz, id_user) {
        try {
            const score = await postgresStore.client.query({
            text: `INSERT INTO scores(score_value, id_quiz, id_user)
            VALUES ($1, $2, $3) RETURNING *`,
			values: [score_value , id_quiz, id_user]
			})
			return score.rows[0]
		} catch (err) {
			return { error: err, message: err.message } // 500
		}
	}

    /**
	 * @param {Number} quizId
	 * @returns {Promise<Score[]>}
	 */
	static async getScoreQuiz (quizId) {
		const scores = await postgresStore.client.query({
			text: `
			SELECT scores.score_value, users.username
            FROM scores
            JOIN users ON scores.id_user = users.id_user
            WHERE scores.id_quiz = $1
			`,
			values: [quizId]
          })
		return scores.rows
    }

    /**
	 * @param {Number} scoreId
	 * @param {Number} newScore
	 * @returns {Promise<Score>}
	 */
	static async updateScore(scoreId, newScore) {
		try {
			const result = await postgresStore.client.query({
				text: `UPDATE scores SET score_value = $2
				WHERE id_score = $1 RETURNING *`,
				values: [scoreId, newScore]
			})
			return result.rows
		} catch (err) {
			return { error: err, message: err.message } // 500
		}
    }
    
    /**
     * 
     * @param {Number} id 
     * @return {Promise<Score>}
     */
    static async deleteScore(id){
        try {
			const result = await postgresStore.client.query({
				text: `DELETE FROM scores 
				WHERE id_score = $1 RETURNING *`,
				values: [id]
			})
			return result.rows
		} catch (err) {
			return { error: err, message: err.message } // 500
		}
    }

    static async generateTable() {
        await postgresStore.client.query(`
        CREATE TABLE scores (
            id_score SERIAL PRIMARY KEY,
            score_value integer NOT NULL,
            id_user integer NOT NULL,
            id_quiz integer NOT NULL,
            CONSTRAINT fk_user
                FOREIGN KEY(id_user)
                    REFERENCES users(id_user) ON DELETE CASCADE,
            CONSTRAINT fk_quiz
                FOREIGN KEY(id_quiz)
                        REFERENCES quizzes(id_quiz) ON DELETE CASCADE
        )
        `)
    }

}