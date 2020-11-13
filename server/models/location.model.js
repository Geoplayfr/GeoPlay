import Debug from 'debug'
import postgresStore from '../postgres-store.js'
const debug = Debug('geoplay')

export default class Location {
    /** @type {Number} */
    id
    /** @type {String} */
    location_id
    /** @type {Number} */
    id_quiz
    
    
    static async generateTable() {
        await postgresStore.client.query(`
        CREATE TABLE location (
            id SERIAL PRIMARY KEY,
            location_id text NOT NULL,
            id_quiz integer NOT NULL,
            CONSTRAINT fk_quiz_id
                FOREIGN KEY(id_quiz)
                    REFERENCES quizzes(id_quiz)
        )
        `)
    }
}