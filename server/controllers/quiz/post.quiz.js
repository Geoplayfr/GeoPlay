import Quiz from '../../models/quiz.model.js'

export async function postAddQuiz (req, res) {
	const quiz = await Quiz.addQuiz(
        req.body.name, 
        req.body.description,
        req.body.mapid,
        req.body.difficulty,
        req.body.duration,
        req.body.id_user,
        req.body.nb_questions
        )
	if(!(quiz.name)) {
		res.status(500).json(quiz)
	}else {
		res.status(200).json(quiz)
	}
}