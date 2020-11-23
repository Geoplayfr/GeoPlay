import Debug from 'debug'
import postgresStore from '../postgres-store.js'
const debug = Debug('geoplay')

export default class Quiz {
    /** @type {Number} */
    id_quiz
    /** @type {String} */
    quiz_name
    /** @type {String} */
    description
    /** @type {String} */
    map_id
    /** @type {String} */
    difficulty
    /** @type {Number} */
    duration
    /** @type {Number} */
    id_user
    /** @type {Number} */
    nb_questions

    /**
	 * @returns {Promise<Quiz[]>}
	 */
	static async getAll () {
		const quizzes = await postgresStore.client.query({
			text: `
			SELECT * FROM quizzes
			`
		  })
		return quizzes.rows
    }
    
  /**
	 * @param {Number} quizId
	 * @returns {Promise<Quiz>}
	 */
	static async getQuiz (quizId) {
		const quiz = await postgresStore.client.query({
			text: `
			SELECT * FROM quizzes WHERE id_quiz = $1
			`,
			values: [quizId]
          })
		return quiz.rows[0]
    }

  /**
	 * @param {Number} userId
	 * @returns {Promise<Quiz[]>}
	 */
	static async getQuizUser (userId) {
		const quiz = await postgresStore.client.query({
			text: `
			SELECT * FROM quizzes WHERE id_user = $1
			`,
			values: [userId]
          })
		return quiz.rows
    }

    /**
	 * @param {String} name
   * @param {String} description
	 * @param {String} mapid
   * @param {String} difficulty
   * @param {Number} duration
   * @param {Number} id_user
   * @param {Number} nb_questions
	 * @returns {Promise<Quiz>}
	 */
	static async addQuiz(name, description, mapid, difficulty, duration, id_user, nb_questions) {
		try {
			const result = await postgresStore.client.query({
        text: `INSERT INTO public.quizzes(name, description, mapid, difficulty, duration, id_user, nb_questions)
          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
				values: [name, description, mapid, difficulty, duration, id_user, nb_questions]
			})
			return result.rows
		} catch (err) {
			return { error: err, message: err.message } // 500
		}
  }
  
  /**
   * 
   * @param {Number} quizId 
   * @param {String} newName 
   * @param {String} newDescription
   * @param {String} newMapId 
   * @param {String} newDifficulty 
   * @param {Number} newDuration 
   * @param {Number} newNbQuestion 
   * @return {Promise<Quiz>}
   */
  static async updateQuiz(quizId, newName, newDescription, newMapId, newDifficulty, newDuration, newNbQuestion){
    try {
			const result = await postgresStore.client.query({
                text: `UPDATE quizzes SET 
                name = $2,
                description = $3,
                mapid = $4,
                difficulty = $5,
                duration = $6,
                nb_questions = $7
				        WHERE id_quiz = $1 RETURNING *`,
				values: [quizId, newName, newDescription, newMapId, newDifficulty, newDuration, newNbQuestion]
			})
			return result.rows
		} catch (err) {
			return { error: err, message: err.message } // 500
		}
  }

  /**
     * 
     * @param {Number} id 
     * @return {Promise<Quiz>}
     */
    static async deleteQuiz(id){
      try {
    const result = await postgresStore.client.query({
      text: `DELETE FROM quizzes WHERE id_quiz = $1 RETURNING *`,
      values: [id]
    })
    return result.rows
  } catch (err) {
    return { error: err, message: err.message } // 500
  }
  }
    
    static async generateTable() {
        await postgresStore.client.query(`
        CREATE TABLE quizzes (
            id_quiz SERIAL PRIMARY KEY,
            name text NOT NULL UNIQUE,
            description text,
            mapId text NOT NULL,
            difficulty text NOT NULL,
            duration integer,
            id_user integer NOT NULL,
            nb_questions integer NOT NULL,
            CHECK (nb_questions >= 5 AND nb_questions <= 25),
            CONSTRAINT fk_user
                FOREIGN KEY(id_user)
                    REFERENCES users(id_user) ON DELETE CASCADE
        )
        `)
    }

}