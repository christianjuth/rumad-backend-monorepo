const express = require('express')
const config = require('../config')
const helpers = require('../helpers')
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

let data;

app.post('/update-message', (req, res) => {
  const { message } = req.body;

  if (message === undefined) {
    res.message(400).send('missing message param')
  }

  data = message
  res.send('updated')
})

app.get('/get-message', (_, res) => {
  res.send(data)
})

helpers.ifPortIsFree(config.port, () => {
  app.listen(config.port, () => {
    console.log(`App listening at http://localhost:${config.port}`)
  })
})
exports.app = app;