import User from '../../models/user.model.js'

export async function postAddUser (req, res) {
	const user = await User.addUser(req.body.username, req.body.password)
	console.log('user:' + user +'/')
	if(!(user.username)) {
		if(user.message.includes("rompt la contrainte unique « users_username_key »")) 
			user.message = "This username is already taken"
		res.status(500).json(user)
	}else {
		res.status(200).json(user)
	}
}

export async function postCheckUser (req, res) {
	const user = await User.checkUserCreds(req.body.username, req.body.password)
	if(!user) {
		res.status(500).json(user)
	}else {
		res.status(200).json(user)
	}
}