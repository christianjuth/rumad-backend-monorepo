require('dotenv').config()
const config = {
  mongoUrl: process.env.MONGO_URL,
}

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

const SALT_ROUNDS = 10
const JWT_SECRET = 'supersecretkey'

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

function redactUserInfo(user) {
  user = { ...user }
  delete user.hashedPassword
  return user
}

/**
 * Authenticate user using username and password or token. Returns boolean or new auth token.
 */
async function authUser({ username, password, token }) {
  const users = db.collection('users');

  if (token) {
    try {
      const tokenValue = jwt.verify(token, JWT_SECRET)
      const user = await users.findOne({ username: tokenValue.username })
      return user ? redactUserInfo(user) : false
    } catch(e) {
      console.log(e)
      return false
    }
  }

  const user = await users.findOne({ username })
  if (!user) {
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
  }, JWT_SECRET, { expiresIn: '1h' })
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

// Connect to Mongo DB client
let db;
const client = new MongoClient(config.mongoUrl, { useUnifiedTopology: true });
// Use connect method to connect to the server
client.connect(function(err) {
  assert.strictEqual(null, err);
  db = client.db('twitter');

  // setup users
  const users = db.collection('users')
  users.createIndex( { username: 1 }, { unique: true } )

  app.emit('db-connected')
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body

  // create user
  const users = db.collection('users')

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  try {
    const user = await users.insertOne({
      username,
      hashedPassword
    })
    res.send(redactUserInfo(user.ops[0]))
  } catch(err) {
    res.status(400).send({
      error: `username "${username}" is taken`
    })
  }
})

app.post('/login', authMiddleware, (req, res) => {
  res.send({
    user: req.user
  }) 
})

app.post('/logout', (req, res) => {
  
})

app.post('/tweets', authMiddleware, async (req, res) => {
  const { message } = req.body
  const { username } = req.user

  if (message === undefined) {
    res.status(400).send({
      error: 'message and handle required.'
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

  const tweet = await tweets.insertOne({
    message,
    username
  })

  res.send(tweet.ops)
})

app.get('/tweets', async (req, res) => {
  const tweets = db.collection('tweets') 
  const data = await tweets.find().sort({_id: -1})
  res.send(await data.toArray())
})

app.on('db-connected', () => {
  app.listen(3000, () => {
    console.log('app listening on localhost:3000')
  })
})
