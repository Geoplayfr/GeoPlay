import Debug from 'debug'
import postgresStore from '../postgres-store.js'
const debug = Debug('geoplay')

export default class User {
	/** @type {Number} */
	id_user 
	/** @type {String} */
	username
	/** @type {String} */
	password

	/**
	 * @returns {Promise<User[]>}
	 */
	static async getAll () {
		const users = await postgresStore.client.query({
			text: `
			SELECT username FROM users
			`
		  })
		return users.rows
	}

	/**
	 * @param {String} username
	 * @param {String} password
	 * @returns {Promise<Todo>}
	 */
	static async addUser(username, password) {
		try {
			const result = await postgresStore.client.query({
				text: `INSERT INTO users(username, password)
				VALUES ($1, crypt($2, gen_salt('bf'))) RETURNING *`,
				values: [username, password]
			})
			return result.rows[0]
		} catch (err) {
			return { error: err, message: err.message } // 500
		}
	}


	static async generateTable () {
		await postgresStore.client.query(`
			CREATE TABLE users (
				id_user SERIAL PRIMARY KEY,
				username text NOT NULL UNIQUE,
				password text NOT NULL
			)
		`)
	}
}
