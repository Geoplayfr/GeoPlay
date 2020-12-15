import Score from '../../models/score.model.js'

export async function putModifyScore (req, res) {
  const scoreId = req.params.scoreId
  const newScore = req.body.newScore
  const score = await Score.updateScore(scoreId, newScore)
  if (!score) {
		  res.status(404).json(score)
  } else {
    res.status(200).json(score)
  }
}
