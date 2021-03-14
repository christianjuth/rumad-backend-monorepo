const express = require('express')
const bodyParser = require('body-parser')
const translate = require("translate");

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

const languages = [
  "es", "fr", "ar", "zh", "de", "it", "pt", "ru"
]

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

  res.send('Created new tweet')
})

/**
 * GET a feed of all tweets
 */
app.get('/tweets', async (req, res) => {
  const { language } = req.query
  const filteredTweets = tweets //.filter(t => t.parentId === undefined)

  if (language === undefined || language === 'en') {
    res.send(filteredTweets)
    return
  }

  if (!languages.includes(language)) {
    res.status(400).send(`Error: can't use language ${language}`)
  }

  const translated = await Promise.all(
    filteredTweets.map(t => {
      return translate(t.message, {
        from: 'en',
        to: language,
        engine: 'libre'
      })
    })
  )

  const output = translated.map((msg, index) => {
    return {
      ...filteredTweets[index],
      message: msg,
    }
  })
  
  res.send(output)
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

app.listen(3000, () => {
  console.log('Listening on http://localhost:3000')
})