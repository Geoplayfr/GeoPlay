import Question from '../../models/question.model.js'

export async function putModifyQuestion (req, res) {
  const questionId = req.params.questionId
  const newQuestionTag = req.body.newQuestionTag
  const newResponseLocId = req.body.newResponseLocId
  const newDuration = req.body.newDuration
  const question = await Question.updateQuestion(questionId, newQuestionTag, newResponseLocId, newDuration)
  if (!question) {
    res.status(404).json(question)
  } else {
    res.status(200).json(question)
  }
}
