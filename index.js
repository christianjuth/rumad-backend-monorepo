const express = require("express")
const config = require("./config")
const week2 = require("./examples/week2")
const week3 = require("./examples/week3")
const twitter = require("./examples/twitter")
const twitter2 = require("./examples/twitter2")
const auth = require("./examples/auth")
const helpers = require("./helpers")

const app = express()

app.listen(config.port, () => {
  console.log(`App listening at http://localhost:${config.port}`)
})

// Launch sub apps
const subApps = {
  week2,
  week3,
  twitter,
  auth,
  twitter2
}

helpers.expressExposeSubApps(app, subApps)

// List routes instead of 404
const availableRoutes = helpers.availableRoutesString(subApps)
app.get("*", (_, res) => {
  res.send(`
    <html>
      <head>
        <style>
        table, th, td {
          border: 1px solid black;
          border-collapse: collapse;
        }
        th, td {
          padding: 5px;
        }
        </style>
      </head>
        <body>

          <table>
            <tr>
              <th>List of routes</th>
            </tr>
            ${availableRoutes.map((r) => `<tr><td>${r}</td></tr>`).join("")}
          </table>

        </body>
    </html>
  `)
})
