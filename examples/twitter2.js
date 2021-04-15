const config = require('../config')
const assert = require('assert');
const express = require('express')
const bcrypt = require("bcrypt")
// const { v4: uuid } = require("uuid")
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const cors = require('cors');
var cookieParser = require('cookie-parser')

const SALT_ROUNDS = 10
const JWT_SECRET = 'supersecretkey'

const app = express()
app.use(cors({
  origin: config,
  credentials: true
}));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())
app.use(cookieParser())

async function hashedPassword(password) {
  return {
    hashedPassword: await bcrypt.hash(password, SALT_ROUNDS),
    passwordUpdatedAt: Date.now()
  }
}

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
  const users = db.collection('users')

  if (token) {
    try {
      const tokenValue = jwt.verify(token, JWT_SECRET)
      const user = await users.findOne({ username: tokenValue.username })
      const validToken = tokenValue.passwordUpdatedAt === user.passwordUpdatedAt
      return user && validToken ? redactUserInfo(user) : false
    } catch(e) {
      console.log(e)
      return false
    }
  }

  // const user = users.find(u => u.username === username)
  const user = await users.findOne({ username })
  if (user === null) {
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

async function authMiddleware(req, res, next) {
  const { username, password } = req.body
  const { authorization } = req.headers
  let token = authorization ?? req.cookies.authToken ?? ''
  token = token.replace(/^Bearer\s/,'')

  const user = await authUser({ username, password, token })
  if (!user) {
    res.status(401).send({
      error: token ? "Invalid auth token" : "Incorrect username password combination"
    })
    return
  }

  if (username && password) {
    res.cookie('authToken', `Bearer ${user.token}`, { 
      maxAge: 1000 * 60 * 60 * 12, // 12 hours
      httpOnly: true, 
      // secure: true 
    });
  }

  req.user = user
  next()
}

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.mongoUrl, { useUnifiedTopology: true });
let db;

client.connect(function(err) {
  assert.strictEqual(null, err);
  db = client.db('twitter');

  const users = db.collection('users');
  users.createIndex({ username: 1 }, { unique: true })

  app.emit('db-connected')
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body

  const users = db.collection('users');

  try {
    const user = await users.insertOne({
      username,
      ...await hashedPassword(password)
    })
    res.send(redactUserInfo(user.ops))  
  } catch(e) {
    res.status(400).send({
      error: `Username "${username}" is taken`
    })
  }
})

app.post('/login', authMiddleware, (req, res) => {
  res.send({
    token: req.user.token
  })
})

app.post('/logout', (req, res) => {
  res.clearCookie("authToken")
  res.send({
    success: true
  })
})

app.post('/tweets', authMiddleware, async (req, res) => {
  const { message, parentId } = req.body

  if (message === undefined) {
    res.status(400).send({
      error: 'message is required.'
    })
    return
  }

  if (message.length < 2 || message.length > 280) {
    res.status(400).send({
      error: 'tweet should be 2 to 280 characters.'
    })
    return
  }

  const tweets = db.collection('tweets')

  const parent = await getTweet.findOne({ id: parentId })
  if (parentId !== undefined && parent === undefined) {
    res.status(404).send({
      error: 'no parent tweet with that id.'
    })
    return
  }

  const tweet = await tweets.insertOne({
    username: req.user.username,
    message,
    // parentId,
  })

  // if (parent !== undefined) {
  //   parent.replies++
  // }

  res.send(tweet.ops)
})

app.get('/tweets', async (req, res) => {
  const tweets = db.collection('tweets')
  const data = await tweets.find().sort({_id: -1})
  res.send(await data.toArray())
})

app.on('db-connected', () => {
  app.listen(config.port, () => {
    console.log(`app listening on http://localhost:${config.port}`)
  })
})