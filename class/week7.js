const express = require("express")
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt")
const { v4: uuid } = require("uuid")

const SALT_ROUNDS = 10

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

const users = []

/**
 * Remove sensitive user info
 */
function redactUserInfo(user) {
  user = { ...user }
  delete user.hashedPassword
  delete user.passwordUpdatedAt
  return user
}

/**
 * Authenticate user using username and password or token. Returns boolean or new auth token.
 */
async function authUser({ username, password }) {
  // token auth

    // verify jwt

    // check that password hasn't changed since token was created

  // password auth
  const user = users.find(u => u.username === username)
  if (!user) {
    return false
  }

  const passwordMatches = await bcrypt.compare(password, user.hashedPassword)
  if (!passwordMatches) {
    return false
  }

  // return redacted user with new token
  return {
    ...redactUserInfo(user),
    token: ''
  }
}

/**
 * Generate a new auth token for the user
 */
function getAuthToken() {

}

/**
 * updateUserPassword
 */
async function updateUserPassword(user, password) {
  user.hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  user.passwordUpdatedAt = Date.now()
}

/**
 * authentication middleware that can autenticate user
 * via username and password or a valid token
 */
async function authMiddleware(req, res, next) {
  const { username, password } = req.body

  const user = await authUser({ username, password })
  if (!user) {
    res.status(401).send({
      error: 'incorrect username or password'
    })
    return
  }

  req.user = user
  next()
}

/**
 * Signup using username and password
 */
app.post('/signup', async (req, res) => {
  const { username, password } = req.body

  // check if user exsists
  const userConflict = users.find(u => u.username === username)
  if (userConflict !== undefined) {
    res.status(400).send({
      error: `Username "${username}" is taken`
    })
    return
  }

  // create and save user
  const user = {
    id: uuid(),
    username
  }
  await updateUserPassword(user, password)
  users.push(user)

  // return auth token
  res.send(redactUserInfo(user))
})

/**
 * Authenticate using username and password then return auth token
 */
app.post('/login', authMiddleware, (req, res) => {
  // return auth token
  res.send({
    user: req.user
  })
})

/**
 * Example authenticated endpoint
 */
app.get('/auth', authMiddleware, () => {
  // return user used for auth
  res.send({
    test: 'test'
  })
})

/**
 * Change user password. Invalidates old tokens.
 */
app.post('/change-password', () => {
  // retrieve user

  // update password

  // return auth token
})

/**
 * Dump all users in the database including password hashes
 */
app.get('/dump', (req, res) => {
  res.send({
    users
  })
})




app.listen(3000, () => {
  console.log('App listening at http://localhost:3000')
})