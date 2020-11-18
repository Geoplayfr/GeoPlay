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

    static async generateTable() {
        await postgresStore.client.query(`
        CREATE TABLE scores (
            id_score SERIAL PRIMARY KEY,
            score_value integer NOT NULL,
            id_user integer NOT NULL,
            id_quiz integer NOT NULL,
            CONSTRAINT fk_user
                FOREIGN KEY(id_user)
                    REFERENCES users(id_user),
            CONSTRAINT fk_quiz
                FOREIGN KEY(id_quiz)
                        REFERENCES quizzes(id_quiz)
        )
        `)
    }

}