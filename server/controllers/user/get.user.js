import User from '../../models/user.model.js'

export async function getUsers (req, res) {
  const users = await User.getAll()
  res.status(200).json(users)
}

export async function getUser (req, res) {
  const userId = req.params.userId
  const user = await User.getUser(userId)
  if (!user) {
    res.status(404).json(user)
  } else {
    res.status(200).json(user)
  }
}
