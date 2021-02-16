const express = require('express')
const bodyParser = require('body-parser')
const piglatin = require('piglatin')
const translate = require('translate')

// List of languages we can translate
const languages = [
  "es", "fr", "ar", "zh", "de", "it", "pt", "ru"
]

const app = express()
// These three lines below allow us to parse the body of our request
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

let msg = 'hello world'

/**
 * Let the client get the last message
 */
app.get('/get-message', (req, res) => {
  // NOTE: I made a mistake here in class
  // originally we imported language from req.body
  // but it should have been req.query.
  const { language } = req.query

  if (language === 'piglatin') {
    if (/^([a-z]|\s)*$/i.test(msg)) {
      res.send(piglatin(msg))
    } else {
      res.status(500).send('error: invalid characeter in message')
    }
  }

  else if(languages.includes(language)) {
    translate(msg, {
      from: 'en',
      to: language,
      engine: 'libre'
    })
    .then(text => res.send(text))
  }

  else {
    res.send(msg)
  }
})

/**
 * Let the client update the message by 
 * making a POST request to /update-message.
 */
app.post('/update-message', (req, res) => {
  // NOTE: I made a mistake here in class
  // originally we imported language from req.query
  // but it should have been req.body.
  const message = req.body.message
  msg = message
  res.send('Updated!')
})

/**
 * Homework: make it so /languages returns the languages we support.
 *   That should be everything in the languages array plus "piglatin"
 */
app.get("/languages", (req, res) => {
  res.send('here are the languages you can use')
})

/**
 * You will need to update msg so it stored the history of past messages.
 * Once you do that – don't forget to update get-message and /update-message –
 * this route should return the history of all previous messages in their 
 * original format (untranslated).
 */
app.get("/history", (req, res) => {

})

app.listen(3000, () => {
  console.log('App listening at http://localhost:3000')
})