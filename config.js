require("dotenv").config()

module.exports = {
  mongoUrl: process.env.MONGO_URL ?? "mongodb://localhost:27017",
  port: process.env.PORT ?? 3000,
  appurl: process.env.APP_URL ?? 'http://localhost:3000'
}
