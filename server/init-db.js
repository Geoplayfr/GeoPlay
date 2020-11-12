import config from './server.config.js'
import postgresStore from './postgres-store.js'
import User from './models/user.model.js'
import Quiz from './models/quiz.model.js'
import Score from './models/score.model.js'
import LocationSerie from './models/location_serie.model.js'
import { run } from 'jest'

async function init () {
	await postgresStore.init(config.postgres)

	async function dropEverything () {
		const result = await postgresStore.client.query(
			"SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
		)
		for (const row of result.rows) {
			if (row.tablename !== 'spatial_ref_sys') {
				await postgresStore.client.query(`DROP TABLE IF EXISTS "${row.tablename}" cascade`)
			}
		}
	}
	await dropEverything()
	await postgresStore.client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto')
	await User.generateTable()
	await LocationSerie.generateTable()
	await Quiz.generateTable()
	await Score.generateTable()
	postgresStore.close()
}

init()