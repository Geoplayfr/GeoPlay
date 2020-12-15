import Question from '../../models/question.model.js'

export default async function deleteQuestion (req, res) {
  const id = req.params.questionId
  const question = await Question.deleteQuestion(id)
  if (!question) {
    res.status(404).json(question)
  } else {
    res.status(200).json(question)
  }
}
