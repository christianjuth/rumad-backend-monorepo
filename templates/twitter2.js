const express = require('express')
const bodyParser = require('body-parser')

const SALT_ROUNDS = 10
const JWT_SECRET = 'supersecretkey'

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

async function hashedPassword(password) {

}

function redactUserInfo(user) {

}

/**
 * Authenticate user using username and password or token. Returns boolean or new auth token.
 */
async function authUser({ username, password, token }) {
 
}

function getAuthToken(user) {
 
}

async function authMiddleware(req, res, next) {
 
}

// Connect to Mongo DB client

app.post('/signup', async (req, res) => {
 
})

app.post('/login', authMiddleware, (req, res) => {
  
})

app.post('/logout', (req, res) => {
  
})

app.post('/tweets', authMiddleware, async (req, res) => {
  
})

app.get('/tweets', async (req, res) => {
  
})