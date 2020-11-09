import User from '../../models/user.model.js'

export default async function getUsers (req, res) {
	const users = await User.getAll()
	res.status(200).json(users)
}
   