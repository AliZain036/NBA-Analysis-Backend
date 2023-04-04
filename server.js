const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const cors = require("cors")
const https = require("https")
const path = require("path")
const mongoose = require("mongoose")
const Stripe = require("stripe")
const { createProxyMiddleware } = require("http-proxy-middleware")

const stripe = Stripe(
  "sk_test_51Mg4d0A5j1K1pUTFhowYmQMWTVOMvzelqTl3GQ3U2aVNm7qj9Q8E1uncv7jtDNF3Qep4EMWKNh7OdcL9CCdNALJA00gu74VIgF"
)

app.use(cors())
// app.use(
//   cors({
//     origin: "https://nba-analysis-swart.vercel.app",
//   })
// )

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://nba-analysis-swart.vercel.app"
  )
  next()
})

// app.use(
//   "*",
//   createProxyMiddleware({
//     target: "http://13.53.171.179:8080",
//     changeOrigin: true,
//     secure: true,
//   })
// )

const Schedule = require("./models/commonModels")

// const commonRoutes = require('./routes/commonRoutes')

require("dotenv").config()

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
// app.use(bodyParser.json())
app.use(express.json())

// app.use('/common', commonRoutes)

// connect mongodb server

// mongoose
//   .connect(
//     "mongodb+srv://alizainbhatti5:YeZZGPRHubAY5aax@nbaanalysiscluster.ux7glkz.mongodb.net/test",
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     }
//   )
//   .then(() => console.log("connection successful"))
//   .catch((err) => console.error(err))

app.get("/", (req, res) => {
  https.get(
    "https://api.sportsdata.io/api/nba/fantasy/json/Players",
    {
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": "5f32177ca5c549979aee86c4d2376c14",
      },
    },
    (response) => {
      let data = ""
      response.on("data", (chunk) => {
        data += chunk
      })
      response.on("end", () => {
        res.send(data)
      })
    }
  )
})

app.get("/PlayerSeasonStats/:season", (req, res) => {
  const season = req.params.season
  https.get(
    `https://api.sportsdata.io/api/nba/fantasy/json/PlayerSeasonStats/${season}`,
    {
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": "5f32177ca5c549979aee86c4d2376c14",
      },
    },
    (response) => {
      let data = ""
      response.on("data", (chunk) => {
        data += chunk
      })
      response.on("end", () => {
        res.send(data)
      })
    }
  )
})

app.get("/schedules/:season", async (req, res, next) => {
  const season = req.params.season
  https.get(
    `https://api.sportsdata.io/api/nba/odds/json/Games/${season}`,
    {
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": "5f32177ca5c549979aee86c4d2376c14",
      },
    },
    async (response) => {
      let data = ""
      response.on("data", (chunk) => {
        data += chunk
      })
      response.on("end", async () => {
        console.log(data[0])
        Schedule.create(data[0][0])
          .then((res) => console.log("successfull"))
          .catch((err) => console.error(err.name))
        // console.log({ response })
        res.send(data)
        next()
      })
    }
  )
})

app.post("/create-payment-intent", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "T-shirt",
            },
            unit_amount: 50 * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ["card"],
      success_url: "https://www.google.com",
      cancel_url: "https://mariza-9e743.web.app/confirm-order",
    })
    // const charge = await stripe.charges.create({
    //   amount: req.amount * 100,
    //   currency: "USD",
    //   source: "pm_1MqMbwA5j1K1pUTFpgi1nkew",
    //   description: "Payment for " + data.email,
    // })
    res.status(200).send(session)
  } catch (error) {
    res.status(500).json({ error })
  }
})

app.get("/GameOddsLineMovement/:gameid", (req, res) => {
  const gameid = req.params.gameid
  https.get(
    `https://api.sportsdata.io/api/nba/odds/json/GameOddsLineMovement/
${gameid}`,
    {
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": "5f32177ca5c549979aee86c4d2376c14",
      },
    },
    (response) => {
      let data = ""
      response.on("data", (chunk) => {
        data += chunk
      })
      response.on("end", () => {
        res.send(data)
      })
    }
  )
})

app.get("/PlayerGameStatsByDate/:date", (req, res) => {
  const date = req.params.date
  https.get(
    `https://api.sportsdata.io/api/nba/fantasy/json/PlayerGameStatsByDate/${date}`,
    {
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": "5f32177ca5c549979aee86c4d2376c14",
      },
    },
    (response) => {
      let data = ""
      response.on("data", (chunk) => {
        data += chunk
      })
      response.on("end", () => {
        res.send(data)
      })
    }
  )
})

app.listen(8080, () => {
  console.log("CORS-enabled web server listening on port 8080")
})
