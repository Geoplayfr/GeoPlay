import Quiz from '../../models/quiz.model.js'

export default async function deleteQuiz (req, res) {
	const id = req.params.quizId
	const quiz = await Quiz.deleteQuiz(id)
	if(!quiz) {
		res.status(404).json(quiz)
	}else {
		res.status(200).json(quiz)
	}
}