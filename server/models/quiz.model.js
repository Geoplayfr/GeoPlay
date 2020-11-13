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

    static async generateTable() {
        await postgresStore.client.query(`
        CREATE TABLE quizzes (
            id_quiz SERIAL PRIMARY KEY,
            name text NOT NULL UNIQUE,
            mapId text NOT NULL,
            difficulty text NOT NULL,
            duration integer,
            id_user integer NOT NULL,
            nb_question integer NOT NULL,
            CHECK (nb_question >= 5 AND nb_question <= 25),
            CONSTRAINT fk_user
                FOREIGN KEY(id_user)
                    REFERENCES users(id_user)
        )
        `)
    }

}