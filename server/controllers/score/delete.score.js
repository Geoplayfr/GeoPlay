import Score from '../../models/score.model.js'

export default async function deleteScore (req, res) {
	const id = req.params.scoreId
	const score = await Score.deleteScore(id)
	if(!score) {
		res.status(404).json(score)
	}else {
		res.status(200).json(score)
	}
}