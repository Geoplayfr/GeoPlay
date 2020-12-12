import Quiz from '../../models/quiz.model.js'

export async function putModifyQuiz(req, res) {
    const quizId = req.params.quizId
    const newName = req.body.newName
    const newDescription = req.body.newDescription
    const newMapId = req.body.newMapId
    const newDifficulty = req.body.newDifficulty
    const newDuration = req.body.newDuration
    const newNbQuestion = req.body.newNbQuestion
    const quiz = await Quiz.updateQuiz(quizId, newName, newDescription, newMapId, newDifficulty, newDuration, newNbQuestion)
    if(!quiz.name) {
        if(quiz.message && quiz.message.includes("rompt la contrainte unique « quizzes_name_key »")) 
        quiz.message = "This quiz name is already taken"
		res.status(500).json(quiz.message)
    } else {
        res.status(200).json(quiz)
    }
}