import Debug from 'debug'
import postgresStore from '../postgres-store.js'
const debug = Debug('geoplay')

export default class LocationSerie {
    /** @type {Number} */
    id_location_serie
    /** @type {Number} */
    loc1
    /** @type {Number} */
    loc2
    /** @type {Number} */
    loc3
    /** @type {Number} */
    loc4
    /** @type {Number} */
    loc5
    /** @type {Number} */
    loc6
    /** @type {Number} */
    loc7
    /** @type {Number} */
    loc8
    /** @type {Number} */
    loc9
    /** @type {Number} */
    loc10
    /** @type {Number} */
    loc11
    /** @type {Number} */
    loc12
    /** @type {Number} */
    loc13
    /** @type {Number} */
    loc14
    /** @type {Number} */
    loc15
    /** @type {Number} */
    loc16
    /** @type {Number} */
    loc17
    /** @type {Number} */
    loc18
    /** @type {Number} */
    loc19
    /** @type {Number} */
    loc20
    /** @type {Number} */
    loc21
    /** @type {Number} */
    loc22
    /** @type {Number} */
    loc23
    /** @type {Number} */
    loc24
    /** @type {Number} */
    loc25

    static async generateTable() {
        await postgresStore.client.query(`
        CREATE TABLE location_series (
            id_location_serie SERIAL PRIMARY KEY,
            loc1 text NOT NULL,
            loc2 text NOT NULL,
            loc3 text NOT NULL,
            loc4 text NOT NULL,
            loc5 text NOT NULL,
            loc6 text,
            loc7 text,
            loc8 text,
            loc9 text,
            loc10 text,
            loc11 text,
            loc12 text,
            loc13 text,
            loc14 text,
            loc15 text,
            loc16 text,
            loc17 text,
            loc18 text,
            loc19 text,
            loc20 text,
            loc21 text,
            loc22 text,
            loc23 text,
            loc24 text,
            loc25 text
        )
        `)
    }
}