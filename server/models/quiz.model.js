import Debug from 'debug'
import postgresStore from '../postgres-store.js'
const debug = Debug('geoplay')

export default class Quiz {
    /** @type {Number} */
    id_quiz
    /** @type {String} */
    quiz_name
    /** @type {String} */
    map_name
    /** @type {String} */
    difficulty
    /** @type {Number} */
    duration
    /** @type {Number} */
    id_user
    /** @type {String} */
    questions

    static async generateTable() {
        await postgresStore.client.query(`
        CREATE TABLE quizzes (
            id_quiz SERIAL PRIMARY KEY,
            name text NOT NULL UNIQUE,
            map_name text NOT NULL,
            difficulty text NOT NULL,
            duration integer NOT NULL,
            id_user integer NOT NULL,
            question text NOT NULL,
            CONSTRAINT fk_user
                FOREIGN KEY(id_user)
                    REFERENCES users(id_user)
        )
        `)
    }

}