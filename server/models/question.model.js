import Debug from 'debug'
import postgresStore from '../postgres-store.js'
const debug = Debug('geoplay')

export default class Question {
    /** @type {Number} */
    id_question
    /** @type {String} */
    question_tag
    /** @type {String} */
    response_location_id
    /** @type {Number} */
    duration
    /** @type {Number} */
    id_quiz
    
    
    static async generateTable() {
        await postgresStore.client.query(`
        CREATE TABLE questions (
            id_question SERIAL PRIMARY KEY,
            question_tag text NOT NULL,
            response_location_id text NOT NULL,
            duration integer NOT NULL,
            id_quiz integer NOT NULL,
            CONSTRAINT fk_quiz_id
                FOREIGN KEY(id_quiz)
                    REFERENCES quizzes(id_quiz)
        )
        `)
    }
}