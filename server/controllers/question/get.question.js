import Question from '../../models/question.model.js'

export async function getResponseLocationId (req, res) {
    const questionId = req.params.questionId
    const rep = await Question.getResponse(questionId)
    if (!rep) {
        res.status(400).json(rep)
    } else {
        res.status(200).json(rep)
    }
}