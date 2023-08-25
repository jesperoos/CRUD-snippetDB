import { model as userModel } from '../model/user.mjs'
import bcrypt from 'bcrypt'

const controller = {}
export default controller

// Login redirect
controller.signInPage = async (req, res) => {
  console.log(res.data.flashMessage)
  res.render('userViews/sign-in', { data: { flashMessage: res.data.flashMessage } })
}

// Login
controller.signIn = async (req, res) => {
  const username = JSON.stringify(req.body.username)
  const password = JSON.stringify(req.body.password)
  const user = await userModel.getUser(username)
  const users = await userModel.listAll()

  if (user.length === 0 && users.length === 0) {
    return res.render('userViews/addAdmin', { data: { flashMessage: res.data.flashMessage } })
  }

  if (user[0]) {
    // Verify that passwords match
    const hashedPassword = user[0].password
    const success = await bcrypt.compare(password, hashedPassword)
    if (success) {
      req.session.user = {
        username: user[0].username,
        role: user[0].role ?? null
      }
      req.session.flashMessage = `Welcome ${username.replaceAll('"', '')}!`

      return res.redirect('/list-snippets')
    }
  }

  req.session.user = null
  req.session.flashMessage = 'Wrong username or password!'
  res.redirect('/sign-in')
}

// Sign out
controller.signOut = async (req, res) => {
  req.session.user = null
  req.session.flashMessage = 'You were logged out.'
  res.redirect('/sign-in')
}

// Read all users
controller.list = async (req, res) => {
  const users = await userModel.listAll()
  if (!req.session.user) {
    res.render('readLoggedIn', { data: { users, flashMessage: res.data.flashMessage, role: 'User' } })
  } else {
    res.render('readLoggedIn', { data: { users, flashMessage: res.data.flashMessage, role: req.session.user.role } })
  }
}

// redirect to create account
controller.createAccount = async (req, res) => {
  res.render('userViews/createAccount', { data: { flashMessage: res.data.flashMessage } })
}

// Register user
controller.register = async (req, res) => {
  const username = JSON.stringify(req.body.username)
  const password = await bcrypt.hash(JSON.stringify(req.body.password), 10)
  if ((await userModel.getUser(username)).length === 0) {
    userModel.register(username, password)
    req.session.flashMessage = 'Account created. Log in to create your own snippets!'
  } else {
    req.session.flashMessage = 'That username already exists!'
    return res.redirect('create-user')
  }
  return res.redirect('/sign-in')
}

// Delete all users, only available to admin account.
controller.deleteAll = async (req, res) => {
  if (req.session.user.role === 'Admin') {
    try {
      req.session.user = null
      await userModel.deleteAll()
      req.session.flashMessage = 'All users were deleted.'
      res.redirect('/')
    } catch (error) {
      console.error('Error deleting users:', error)
      req.session.flashMessage = 'An error occurred while deleting users.'
      res.redirect('/')
    }
  } else {
    res.sendStatus(403)
  }
}
