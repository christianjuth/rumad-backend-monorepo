const express = require("express")
const bodyParser = require("body-parser")

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

/**
 * Remove sensitive user info
 */
function redactUserInfo() {
}

/**
 * Authenticate user using username and password or token. Returns boolean or new auth token.
 */
function authUser() {
  // token auth
    // verify jwt
    // check that password hasn't changed since token was created

  // password auth
    // check if user exsists
    // check if password matches

  // return redacted user with new token
}

/**
 * Generate a new auth token for the user
 */
function getAuthToken() {
}

/**
 * updateUserPassword
 */
function updateUserPassword() {
}

/**
 * authentication middleware that can autenticate user
 * via username and password or a valid token
 */
function authMiddleware(req, res, next) {
  next()
}

/**
 * Signup using username and password
 */
app.post('/signup', () => {
  // get username and password from body
  // check if user exsists
  // create and save user
  // return auth token
})

/**
 * Authenticate using username and password then return auth token
 */
app.post('/login', () => {
  // return auth token
})

/**
 * Example authenticated endpoint
 */
app.get('/auth', () => {
  // return user used for auth
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
app.get('/dump', () => {})

app.listen(3000, () => {
  console.log('App listening at http://localhost:3000')
})