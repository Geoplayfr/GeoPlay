import Score from '../../models/score.model.js'

export async function postAddScore(req, res) {
    const quizId = req.body.quizId
    const userId = req.body.userId
    const score_value = req.body.score_value
    const result = await Score.addScore(score_value, quizId, userId)
    if(!(result)) {
		res.status(500).json(result)
	}else {
		res.status(200).json(result)
	}
}