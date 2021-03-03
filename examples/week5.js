const express = require("express")
const config = require("../config")
const helpers = require("../helpers")
const bodyParser = require("body-parser")
// const uuid = require("uuid").v4

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

class UUID {
  constructor() {
    this.id = 0
    return () => this.increment()
  }

  increment() {
    return String(this.id++)
  }
}
const uuid = new UUID()

let tweets = []

/**
 * POST a tweet when the client POSTS to this endpoint
 */
app.post('/tweets', (req, res) => {
  const { message, handle, parentId } = req.body

  if ([message, handle].includes(undefined)) {
    res.status(400).send('Error: message and handle required.')
    return
  }

  if (message.length < 2 || message.length > 280) {
    res.status(400).send('Error: tweet should be 2 to 280 characters.')
    return
  }

  const parent = tweets.find(t => t.id === parentId)
  if (parentId !== undefined && parent === undefined) {
    res.status(404).send('Error: no parent tweet with that id.')
    return
  }

  const tweet = {
    message,
    handle,
    parentId,
    createdAt: new Date(),
    updatedAt: new Date(),
    id: uuid(),
    likes: 0,
    replies: 0,
  }
  tweets.unshift(tweet)

  if (parent !== undefined) {
    parent.replies++
  }

  res.send('Created new tweet')
})

/**
 * GET a feed of all tweets
 */
app.get('/tweets', (req, res) => {
  res.send(tweets.filter(t => t.parentId === undefined))
})

/**
 * GET all tweets for a profile
 */
app.get('/profile/:handle', (req, res) => {
  const { handle } = req.params 
  res.send(tweets.filter(t => t.handle === handle))
})

/**
 * DELETE a tweet by its id
 */
app.delete('/tweets/:id', (req, res) => {
  const { id } = req.params
  
  const tweet = tweets.find(t => t.id === id)

  if (tweet === undefined) {
    res.status(404).send('Error: no tweet with that id.')
    return
  }

  tweets = tweets.filter(t => t.id !== id)

  res.send(`Deleted tweet by ${tweet.handle}.`)
})

/**
 * GET replies to a tweet
 */
app.get("/tweets/:id/replies", (req, res) => {
  const { id } = req.params
  console.log(id)
  res.send(tweets.filter(t => t.parentId === id))
})

/**
 * Add a like to a tweet using a POST request
 */
app.post('/tweets/:id', (req, res) => {
  const { id } = req.params
  
  const tweet = tweets.find(t => t.id === id)

  if (tweet === undefined) {
    res.status(404).send('Error: no tweet with that id.')
    return
  }

  tweet.likes++

  res.send(`Liked tweet with by ${tweet.handle}.`)
})

helpers.ifPortIsFree(config.port, () => {
  app.listen(config.port, () => {
    console.log(`App listening at http://localhost:${config.port}`)
  })
})
exports.app = app
