import User from '../../models/user.model.js'

export default async function postUser (req, res) {
	const user = await User.addUser(req.body.username, req.body.password)
	res.status(200).json(user)
}