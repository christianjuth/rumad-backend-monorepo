require('dotenv').config()
const config = {
  mongoUrl: process.env.MONGO_URL,
}

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
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
  user = { ...user }
  delete user.password
  return user
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

  try {
    const user = await users.insertOne({
      username,
      password
    })
    res.send(redactUserInfo(user.ops[0]))
  } catch(err) {
    res.status(400).send({
      error: `username "${username}" is taken`
    })
  }
})

app.post('/login', authMiddleware, (req, res) => {
  
})

app.post('/logout', (req, res) => {
  
})

app.post('/tweets', authMiddleware, async (req, res) => {
  
})

app.get('/tweets', async (req, res) => {
  
})

app.on('db-connected', () => {
  app.listen(3000, () => {
    console.log('app listening on localhost:3000')
  })
})
