import Quiz from '../../models/quiz.model.js'
import Question from '../../models/question.model.js'
import User from '../../models/user.model.js'

export async function getQuizzes (req, res) {
    const quizzes = await Quiz.getAll()
    for (const quiz of quizzes) {
        quiz.questions = await Question.getQuestions(quiz.id_quiz)
      }
    res.status(200).json(quizzes)
}

export async function getQuiz (req, res) {
    const quizId = req.params.quizId
    const quiz = await Quiz.getQuiz(quizId)
    if(!quiz) {
		res.status(404).json(quiz)
	}else {
        quiz.creator = await User.getCreator(quizId)
        quiz.questions = await Question.getQuestions(quizId)
		res.status(200).json(quiz)
	}
}

export async function getQuizUser (req, res) {
    const userId = req.params.userId
    const quizzes = await Quiz.getQuizUser(userId)
    res.status(200).json(quizzes)
}