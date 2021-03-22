const express = require("express")
const config = require("../config")
const helpers = require("../helpers")
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt")
const { v4: uuid } = require("uuid")
const jwt = require('jsonwebtoken')

const SALT_ROUNDS = 10
const JWT_SECRET = 'supersecretkey'

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
async function authUser({ username, password, token }) {
  if (token) {
    try {
      const tokenValue = jwt.verify(token, JWT_SECRET)
      const user = users.find(u => {
        const usernameMatch = u.username === tokenValue.username
        const tokenStillValid = u.passwordUpdatedAt === tokenValue.passwordUpdatedAt
        return usernameMatch && tokenStillValid
      })
      return user ? redactUserInfo(user) : false
    } catch(e) {
      console.log(e)
      return false
    }
  }

  const user = users.find(u => u.username === username)
  if (user === undefined) {
    return false
  }

  const passwordMatch = await bcrypt.compare(password, user.hashedPassword)
  if (!passwordMatch) {
    return false
  }

  return {
    ...redactUserInfo(user),
    token: getAuthToken(user)
  }
}

function getAuthToken(user) {
  return jwt.sign({ 
    username: user.username, 
    passwordUpdatedAt: user.passwordUpdatedAt 
  }, JWT_SECRET, { expiresIn: '1h' })
}

async function updateUserPassword(user, password) {
  user.hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  user.passwordUpdatedAt = Date.now()
}

async function authMiddleware(req, res, next) {
  const { username, password } = req.body
  const { authorization } = req.headers
  const token = authorization?.replace(/^Bearer\s/,'')

  const user = await authUser({ username, password, token })
  if (!user) {
    res.status(401).send({
      error: token ? "Invalid auth token" : "Incorrect username password combination"
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

  const exsistingUser = users.find(u => u.username === username)
  if (exsistingUser !== undefined) {
    res.status(400).send({
      error: `Username "${username}" is taken`
    })
    return
  }

  const user = {
    id: uuid(),
    username,
  }
  await updateUserPassword(user, password)
  users.push(user)

  res.send({ token: getAuthToken(user) })
})

/**
 * Authenticate using username and password then return auth token
 */
app.post('/login', authMiddleware, (req, res) => {
  res.send({
    token: req.user.token
  })
})

/**
 * Authenticate using auth token
 */
app.get('/auth', authMiddleware, (req, res) => {
  res.send({
    user: req.user
  })
})

/**
 * Change user password. Invalidates old tokens.
 */
app.post('/change-password', authMiddleware, async (req, res) => {
  const { newPassword } = req.body
  const user = users.find(u => u.id === req.user.id)
  await updateUserPassword(user, newPassword)
  res.send({
    token: getAuthToken(user)
  })
})

/**
 * Dump all users in the database including password hashes
 */
app.get('/dump', (req, res) => {
  res.send(users)
})

helpers.ifPortIsFree(config.port, () => {
  app.listen(config.port, () => {
    console.log(`App listening at http://localhost:${config.port}`)
  })
})
exports.app = app