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
    
    /**
	 * @param {Number} quizId
	 * @returns {Promise<Location[]>}
	 */
	static async getQuestions (quizId) {
		const question = await postgresStore.client.query({
			text: `
			SELECT id_question, question_tag FROM questions WHERE id_quiz = $1
			`,
			values: [quizId]
          })
		return question.rows
    }
    
    /**
     * @param {Number} quizId
     * @param {Question[]} questionList
     * @return {Promise<Question[]>}
     */
    static async addQuestions(quiz_id, questionList) {
        let queryString = `INSERT INTO questions(question_tag, response_location_id, duration, id_quiz) VALUES `
        for (let i = 0; i < questionList.length; i++) {
            queryString += `('` + questionList[i].question_tag + `', '` + questionList[i].response_location_id + `', ` + questionList[i].duration + `, ` + quiz_id + `),`
        }
        queryString = queryString.slice(0, -1) + " RETURNING *"
        const questions = await postgresStore.client.query({
            text: queryString,
        })
        return questions.rows
    }

    /**
     * 
     * @param {Number} questionId 
     * @param {String} newQuestionTag 
     * @param {String} newResponseLocId 
     * @param {Number} newDuration 
     * @return {Promise<Question>}
     */
    static async updateQuestion(questionId, newQuestionTag, newResponseLocId, newDuration) {
        try {
			const result = await postgresStore.client.query({
                text: `UPDATE questions SET 
                question_tag = $2,
                response_location_id = $3,
                duration = $4
				WHERE id_question = $1 RETURNING *`,
				values: [questionId, newQuestionTag, newResponseLocId, newDuration]
			})
			return result.rows
		} catch (err) {
			return { error: err, message: err.message } // 500
		}
    }

    /**
     * 
     * @param {Number} id 
     * @return {Promise<Question>}
     */
    static async deleteQuestion(id){
        try {
			const result = await postgresStore.client.query({
				text: `DELETE FROM questions 
				WHERE id_question = $1 RETURNING *`,
				values: [id]
			})
			return result.rows
		} catch (err) {
			return { error: err, message: err.message } // 500
		}
    }
    
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
                    REFERENCES quizzes(id_quiz) ON DELETE CASCADE
        )
        `)
    }
}