import User from '../../models/user.model.js'

export default async function deleteUser (req, res) {
	const id = req.params.userId
	const password = req.body.password
	const user = await User.deleteUser(id, password)
	if(!user) {
		res.status(404).json(user)
	}else {
		res.status(200).json(user)
	}
}