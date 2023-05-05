const express = require("express")
const router = express.Router()
const bodyParser = require("body-parser")
const app = express()
const cors = require("cors")
const https = require("https")
const nodeCron = require("node-cron")
const path = require("path")
const csv = require("csv-parse")
const mongoose = require("mongoose")
const fs = require("fs")
const Stripe = require("stripe")
const { createProxyMiddleware } = require("http-proxy-middleware")
const csvtojson = require("csvtojson")
const request = require("request")
const unzipper = require("unzipper")

app.use(cors({ origin: "*" }))
require("dotenv").config()

app.use(express.json())

const { getLatestFileName } = require("./util")
const {
  seasonMedianByPlayer,
  playerSeasonData,
} = require("./controllers/seasonController")
const playerGameModal = require("./models/playerGameModal")
const PlayerSeasonModal = require("./models/PlayerSeasonModal")

const zipFilePath = "./sportsdata.zip"
const extractDir = "./sportsDataCSV"
let latestFile = null
let latestYear = 0

const fileName = getLatestFileName("Stadium", "./sportsDataCSV")

mongoose
  .connect(
    "mongodb+srv://alizainbhatti5:YeZZGPRHubAY5aax@nbaanalysiscluster.ux7glkz.mongodb.net/NBA",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((res) => {
    console.log("Connection successfully established")
    try {
      // playerGameModal
      //   .find({
      //     Games: "1",
      //     SeasonType: { $in: ["1", "3"] },
      //   })
      //   .then((res) => console.log(res, " + res"))
      //   .catch((err) => console.log({ err }, " + err"))
      // const PlayerSeasonFilePath = "./sportsDataCSV/PlayerSeason.2023.csv"
      // csvtojson()
      //   .fromFile(PlayerSeasonFilePath)
      //   .then((playerSeasonData) => {
      //     console.log("Success converting to json")
      //   })
      // const teamData = "./sportsDataCSV/PlayerSeason.2023.csv"
      // csvtojson()
      //   .fromFile(teamData)
      //   .then((res) => {
      // console.log(res[0])
      // playerGameModal
      //   .insertMany(res)
      //   .then((res) => console.log("data added successfully"))
      // })
    } catch (error) {
      console.error(error.message, " error")
    }
  })
  .catch((err) => console.error(err))

async function convertToJSONandSavePlayerSeasonData() {
  try {
    const PlayerSeasonFilePath = "./sportsDataCSV/PlayerSeason.2023.csv"
    csvtojson()
      .fromFile(PlayerSeasonFilePath)
      .then((playerSeasonData) => {
        console.log("Success converting to json")
        PlayerSeasonModal.deleteMany({}).then((_) => {
          PlayerSeasonModal.insertMany(playerSeasonData).then((_) =>
            console.log(_)
          )
        })
      })
  } catch (error) {
    console.error(error)
  }
}
// fs.readdir(extractDir, function (err, files) {
//   if (err) {
//     console.log("Error getting directory information:", err)
//   } else {
//     files.forEach(function (file) {
//       if (file.startsWith("PlayerGame.") && file.endsWith(".csv")) {
//         const year = parseInt(file.substring(11, 15))
//         if (year > latestYear) {
//           latestYear = year
//           latestFile = path.join(extractDir, file)
//         }
//       }
//     })

//     console.log("Latest file:", latestFile)
//   }
// })

nodeCron
  .schedule("0 0 * * *", () => {
    try {
      convertToJSONandSavePlayerSeasonData()
      downloadFile(fantasyDataCSVFileUrl, zipFilePath)
        .then(() => {
          return extractFile(zipFilePath, extractDir)
        })
        .then(() => {
          console.log("File extracted")
        })
        .catch((err) => {
          console.error(err)
        })
    } catch (error) {
      console.error(error)
    }
  })
  .start()

const filePath = "./file.csv"

const stripe = Stripe(
  "sk_test_51Mg4d0A5j1K1pUTFhowYmQMWTVOMvzelqTl3GQ3U2aVNm7qj9Q8E1uncv7jtDNF3Qep4EMWKNh7OdcL9CCdNALJA00gu74VIgF"
)

const fantasyDataCSVFileUrl =
  "https://sportsdata.io/members/download-file?product=5aff2d7c-d41e-40a8-bb7c-b18096c1ca3b"
let jsonData = {}
const file = fs.createWriteStream("./sportsDataCSV/Player.2023.csv")
// request(fantasyDataCSVFileUrl)
//   .pipe(file)
//   .on("finish", () => {
//     console.log("file is successfully downloaded")
//   })
//   .on("error", () => {
//     console.log("file url is incorrect")
//   })

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(dest)
    request(url)
      .pipe(fileStream)
      .on("finish", () => {
        resolve()
      })
      .on("error", (err) => {
        reject(err)
      })
  })
}

// app.get("/seasonMedianByPlayer", async (req, res) => {
//   try {
//     const teamData = "./sportsDataCSV/PlayerGame.2023.csv"
//     const data = await playerGameModal.find({
//       Games: "1",
//       SeasonType: { $in: ["1", "3"] },
//     })
//     // .then((res) => console.log(res, " + res"))
//     console.log(data, " + res")
//     res.status(200).json({ success: true, data })
//     // .then((result) => {
//     // playerGameModal.find({ Games: "1" }).then((res) => {
//     //   console.log("data added successfully")
//     //   // res.status(200).json({ success: true, data: result })
//     // })
//     // })
//   } catch (error) {
//     console.error(error.message)
//     res.status(500).json({ success: false, message: error.message })
//   }
// })

// app.get("/seasonMedianByPlayer", seasonMedianByPlayer)
app.get("/playerSeasonData", playerSeasonData)

const extractFile = (filePath, extractDir) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .on("close", () => {
        resolve()
      })
      .on("error", (err) => {
        reject(err)
      })
  })
}

function getDataFromCsv() {
  https.request(fantasyDataCSVFileUrl, (error, response, body) => {
    if (error) {
      console.error(error.message)
      throw error
    }
    console.log("success")
    csv(
      body,
      {
        columns: true,
        delimiter: ",",
      },
      (err, data) => {
        if (err) {
          console.error(error.message)
          throw err
        }
        console.log("data success")
        jsonData = JSON.stringify(data)
      }
    )
  })
}


app.get("/convert-csv-to-json", (request, response) => {
  try {
    downloadFile(fantasyDataCSVFileUrl, zipFilePath)
      .then(() => {
        return extractFile(zipFilePath, extractDir)
      })
      .then(() => {
        console.log("File extracted")
        response.status(200).send("File extracted")
      })
      .catch((err) => {
        console.error(err)
      })
  } catch (error) {
    console.error(error.name, " error")
    response.status(500).send("Error downloading file")
  }
})

app.get("/", (req, res) => {
  // getDataFromCsv()
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
        // console.log(data[0])
        // Schedule.create(data[0][0])
        //   .then((res) => console.log("successfull"))
        //   .catch((err) => console.error(err.name))
        // console.log({ response })
        res.send(data)
        next()
      })
    }
  )
})

app.get("/playerSeasonStats/:season", async (req, res) => {
  const season = req.params.season
  https.get(
    `https://api.sportsdata.io/api/nba/fantasy/json/PlayerSeasonStats/${season}`,
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
        // Schedule.create(data[0][0])
        //   .then((res) => console.log("successfull"))
        //   .catch((err) => console.error(err.name))
        // console.log({ response })
        res.send(data)
        // next()
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
