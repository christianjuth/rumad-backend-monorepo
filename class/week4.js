const express = require('express')
const bodyParser = require('body-parser')

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

const tweets = []

/**
 * POST a tweet when the client POSTS to this endpoint
 */
app.post('/tweets', (req, res) => {
  const { message, handle } = req.body

  if ([message, handle].includes(undefined)) {
    res.status(400).send('Error: message and handle required.')
    return
  }

  if (message.length < 2 || message.length > 280) {
    res.status(400).send('Error: tweet should be 2 to 280 characters.')
    return
  }

  const tweet = {
    message,
    handle,
    createdAt: new Date(),
    updatedAt: new Date(),
    id: uuid(),
    likes: 0
  }
  tweets.unshift(tweet)

  res.send('Created new tweet')
})

/**
 * GET a feed of all tweets
 */
app.get('/tweets', (req, res) => {
  res.send(tweets)
})

/**
 * DELETE a tweet by its id
 */
// tweets = tweets.filter
// app.put('/tweets/:id', () => {})

/**
 * Add a like to a tweet using a POST request
 */
// app.post('')

app.listen(3000, () => {
  console.log('Listening on http://localhost:3000')
})