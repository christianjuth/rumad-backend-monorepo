require('dotenv').config()

module.exports = {
  mongoUrl: process.env.MONGO_URL ?? 'mongodb://localhost:27017',
  port: process.env.PORT ?? 3000
}