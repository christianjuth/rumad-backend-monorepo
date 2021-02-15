const express = require("express")
const config = require("../config")
const helpers = require("../helpers")
const bodyParser = require("body-parser")
const piglatin = require("piglatin")
const translate = require("translate")

const languages = [
  "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", "ba",
  "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch", "co",
  "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo",
  "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga", "gd", "gl",
  "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "ia",
  "id", "ie", "ig", "ii", "ik", "io", "is", "it", "iu", "ja", "jv", "ka", "kg",
  "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky",
  "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk",
  "ml", "mn", "mr", "ms", "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn",
  "no", "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps",
  "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "si",
  "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta",
  "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty",
  "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", "yo", "za",
  "zh", "zu", "piglatin"
]

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

let data = ""

/**
 * Let the user update the message stored in the data variable
 */
app.post("/update-message", (req, res) => {
  const { message } = req.body

  if (message === undefined) {
    res.message(400).send("missing message param")
  }

  data = message
  res.send("updated")
})

/**
 * Retrieve the message saved by /update-message
 * and return it in the language that the user asks
 */
app.get("/get-message", (req, res) => {
  const { language } = req.query

  if (!data) {
    res.status(500).send("error, no message saved")
  } 
  
  else if (language === "piglatin") {
    if (/^([a-z]|\s)+$/i.test(data)) {
      res.send(piglatin(data))
    } else {
      const invalidChar = data.match(/[^a-z]/)?.[0]
      res.status(500).send(`error, invalid character ${invalidChar}`)
    }
  } 

  else if (languages.includes(language)) {
    translate(data, { 
      from: "en", 
      to: language,
      engine: 'libre'
    })
    .then(output => res.send(output))
  }
  
  else {
    res.send(data)
  }
})

/**
 * TODO: Reutrn a list of language that the user can ask for
 */
app.get("/languages", (req, res) => {})

helpers.ifPortIsFree(config.port, () => {
  app.listen(config.port, () => {
    console.log(`App listening at http://localhost:${config.port}`)
  })
})
exports.app = app
