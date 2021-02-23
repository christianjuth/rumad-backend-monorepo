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
 * Post a tweet when the client POSTS to this endpoint
 */
app.post("/tweet", (req, res) => {
  const { handle, message, parentId } = req.body

  if ([handle, message].includes(undefined)) {
    res.status(400).send('Error: missing handle or message.')
    return
  }

  if (message.length < 1 || message.length > 280) {
    res.status(400).send('Error: message should be 1 to 280 characters.')
    return
  }

  if (parentId && !tweets.find(t => t.id === parentId)) {
    res.status(404).send(`Error: failed to find tweet with id ${parentId} for parent`)
    return
  }
  
  const tweet = {
    handle,
    message,
    parentId,
    createdAt: new Date(),
    id: uuid(),
    likes: 0
  }
  tweets.unshift(tweet)

  res.send(`Created tweet with id ${tweet.id}`)
})

/**
 * DELETE a tweet by its id
 */
app.delete("/tweet/:id", (req, res) => {
  const { id } = req.params

  const tweet = tweets.find(t => t.id === id)

  if (!tweet) {
    res.status(404).send(`Error: no tweet with id ${id}`)
    return
  }

  tweets = tweets.filter(t => t.id !== id)
  res.send(`Deleted tweet ${id}`)
})

/**
 * GET a feed of all tweets
 */
app.get("/feed", (req, res) => {
  // Filter tweets that are replies
  res.send(tweets.filter(t => !t.parentId))
})

/**
 * GET replies to a tweet
 */
app.get("/tweet/:id/replies", (req, res) => {
  const { id } = req.params
  res.send(tweets.filter(t => t.parentId === id))
})

/**
 * Add a like to a tweet using a POST request
 */
app.post("/tweet/:id/like", (req, res) => {
  const { id } = req.params

  const tweetIndex = tweets.findIndex(t => t.id === id)

  if (!tweetIndex) {
    res.status(404).send(`Error: no tweet with id ${id}`)
    return
  }

  tweets[tweetIndex].likes++

  res.send(`Liked tweet with id ${id}`)
})

helpers.ifPortIsFree(config.port, () => {
  app.listen(config.port, () => {
    console.log(`App listening at http://localhost:${config.port}`)
  })
})
exports.app = app
