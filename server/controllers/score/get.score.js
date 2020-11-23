import Score from '../../models/score.model.js'

export async function getScoreUser (req, res) {
	const userId = req.params.userId
    const scores = await Score.getScoreUser(userId)
    if (!scores) {
        res.status(400).json(scores)
    } else {
        res.status(200).json(scores)
    }
}

export async function getScoreQuiz (req, res) {
	const quizId = req.params.quizId
    const scores = await Score.getScoreQuiz(quizId)
    if (!scores) {
        res.status(400).json(scores)
    } else {
        res.status(200).json(scores)
    }
}