const express = require("express")
const config = require("../config")
const helpers = require("../helpers")

const app = express()

app.get('/', (req, res) => {
  res.send('hello world')
})

helpers.ifPortIsFree(config.port, () => {
  app.listen(config.port, () => {
    console.log(`App listening at http://localhost:${config.port}`)
  })
})
exports.app = app
