import Quiz from '../../models/quiz.model.js'
import Location from '../../models/location.model.js'

export async function getQuizzes (req, res) {
    const quizzes = await Quiz.getAll()
    res.status(200).json(quizzes)
}

export async function getQuiz (req, res) {
    const quizId = req.params.quizId
    const quiz = await Quiz.getQuiz(quizId)
    if(!quiz) {
		res.status(404).json(quiz)
	}else {
        console.log('coucou')
        quiz.questions = await Location.getLocation(quizId)
		res.status(200).json(quiz)
	}
}