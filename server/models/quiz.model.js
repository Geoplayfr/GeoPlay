import Debug from 'debug'
import postgresStore from '../postgres-store.js'
const debug = Debug('geoplay')

export default class Quiz {
    /** @type {Number} */
    id_quiz
    /** @type {String} */
    quiz_name
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
    
    static async generateTable() {
        await postgresStore.client.query(`
        CREATE TABLE quizzes (
            id_quiz SERIAL PRIMARY KEY,
            name text NOT NULL UNIQUE,
            mapId text NOT NULL,
            difficulty text NOT NULL,
            duration integer,
            id_user integer NOT NULL,
            nb_questions integer NOT NULL,
            CHECK (nb_questions >= 5 AND nb_questions <= 25),
            CONSTRAINT fk_user
                FOREIGN KEY(id_user)
                    REFERENCES users(id_user)
        )
        `)
    }

}