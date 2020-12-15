import User from '../../models/user.model.js'

export async function putModifyPassword (req, res) {
  const id = req.params.userId
  const currentPassword = req.body.currentPassword
  const newPassword = req.body.newPassword
  const user = await User.updateUserpassword(id, currentPassword, newPassword)
  if (!user) {
    res.status(404).json(user)
  } else {
    res.status(200).json(user)
  }
}

export async function putModifyUsername (req, res) {
  const id = req.params.userId
  const username = req.params.newUsername
  const password = req.body.password
  const user = await User.updateUsername(id, username, password)
  if (!(user.username)) {
    if (user.message.includes('rompt la contrainte unique « users_username_key »')) { user.message = 'This username is already taken' }
    res.status(500).json(user.message)
  } else {
    res.status(200).json(user)
  }
}
