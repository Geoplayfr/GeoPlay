import User from '../../models/user.model.js'

export async function putModifyPassword (req, res) {
	console.log('modify password')
	const id = req.params.userId
	const currentPassword = req.body.currentPassword
	const newPassword = req.body.newPassword
	const user = await User.updateUserpassword(id, currentPassword, newPassword)
	if(!user) {
		res.status(404).json(user)
	}else {
		res.status(200).json(user)
	}
}

export function putModifyUsername (req, res){
	const id = req.params.userId
	const username = req.params.newUsername
	console.log('modify username')
	//todo
	res.status(404).json({error: "Not implemented yet..."})
}