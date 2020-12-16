import Question from '../../models/question.model.js'

export async function postAddQuestions (req, res) {
  const quizId = req.body.quizId
  const questionList = req.body.questionList
  const questions = await Question.addQuestions(quizId, questionList)
  if (!(questions)) {
    res.status(500).json(questions)
  } else {
    res.status(200).json(questions)
  }
}
