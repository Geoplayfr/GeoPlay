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
			SELECT id_user ,username FROM users
			`
		  })
		return users.rows
	}

	/**
	 * @param {Number} userId
	 * @returns {Promise<User>}
	 */
	static async getUser (userId) {
		const user = await postgresStore.client.query({
			text: `
			SELECT username FROM users WHERE id_user = $1
			`,
			values: [userId]
		  })
		return user.rows[0]
	}

	/**
	 * @param {String} username
	 * @param {String} password
	 * @returns {Promise<User>}
	 */
	static async addUser(username, password) {
		try {
			const result = await postgresStore.client.query({
				text: `INSERT INTO users(username, password)
				VALUES ($1, crypt($2, gen_salt('bf'))) RETURNING *`,
				values: [username, password]
			})
			return {id: result.rows[0].id_user, username: result.rows[0].username}
		} catch (err) {
			return { error: err, message: err.message } // 500
		}
	}

	/**
	 * @param {Number} id
	 * @param {String} currentPassword
	 * @param {String} newPassword
	 * @returns {Promise<User>}
	 */
	static async updateUserpassword(id, currentPassword, newPassword) {
		try {
			const result = await postgresStore.client.query({
				text: `UPDATE users SET password = crypt($3, gen_salt('bf')) 
				WHERE id_user = $1 AND password = crypt($2, password) RETURNING *`,
				values: [id, currentPassword, newPassword]
			})
			return (result.rows).map(e => ({id:e.id_user, username : e.username}))[0]
		} catch (err) {
			return { error: err, message: err.message } // 500
		}
	}

	/**
	 * @param {Number} id
	 * @param {String} newUsername
	 * @param {String} password
	 * @returns {Promise<User>}
	 */
	static async updateUsername(id, newUsername, password) {
		try {
			const result = await postgresStore.client.query({
				text: `UPDATE users SET username = $2 
				WHERE id_user = $1 AND password = crypt($3, password) RETURNING *`,
				values: [id, newUsername, password]
			})
			return (result.rows).map(e => ({id:e.id_user, username : e.username}))[0]
		} catch (err) {
			return { error: err, message: err.message } // 500
		}
	}

	/**
	 * @param {Number} id
	 * @param {String} password
	 * @returns {Promise<User>}
	 */
	static async deleteUser(id, password) {
		try {
			const result = await postgresStore.client.query({
				text: `DELETE FROM users 
				WHERE id_user = $1 AND password = crypt($2, password) RETURNING *`,
				values: [id, password]
			})
			return (result.rows).map(e => ({id:e.id_user, username : e.username}))[0]
		} catch (err) {
			return { error: err, message: err.message } // 500
		}
	}

	/**
	 * @param {String} username
	 * @param {String} password
	 * @returns {Promise<Todo>}
	 */
	static async checkUserCreds(username, password) {
		try {
			const result = await postgresStore.client.query({
				text: `SELECT id_user, username FROM users WHERE
				username = $1 AND password = crypt($2, password)`,
				values: [username, password]
			})
			return result.rows[0]
		} catch (err) {
			return { error: err, message: err.message } // 500
		}
	}

	/**
	 * @param {Number} quizId
	 * @returns {Promise<String>}
	 */
	static async getCreator (quizId) {
		try {
			const result = await postgresStore.client.query({
				text: `SELECT users.username FROM users
				JOIN quizzes ON (quizzes.id_user = users.id_user)
				WHERE id_quiz = $1`,
				values: [quizId]
			})
			return result.rows
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
