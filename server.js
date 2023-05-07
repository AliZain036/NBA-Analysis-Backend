require("dotenv").config()
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
// const gameRoutes = require('./routes/gameRoutes')

app.use(cors({ origin: "*" }))
app.use(express.json())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const { getLatestFileName } = require("./util")
const {
  seasonMedianByPlayer,
  playerSeasonData,
} = require("./controllers/seasonController")
const PlayerSeasonModal = require("./models/PlayerSeasonModal")
const gameRouter = require("./routes/gameRoutes")
const scheduleRouter = require("./routes/scheduleRoutes")
const {
  PlayerGame,
  SeasonMaximum,
  SeasonMinimum,
  SeasonRange,
  SeasonMode,
  SeasonGeoMean,
} = require("./models/playerGameModal")
const seasonRouter = require("./routes/seasonRoutes")

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    try {
      console.log("Connection successfully established")
      // PlayerGame.find({ Games: 1, SeasonType: { $in: [1, 3] } })
      //   .lean()
      //   .exec()
      //   .then((docs) => {
      //     console.log("Fetched Data")
      //     const combinedGames = mergeSamePlayerObjects(docs)
      //     calculateGeoMean(combinedGames)
      //   })
    } catch (error) {
      console.error(error.message, " error")
    }
  })
  .catch((err) => console.error(err))

function mergeSamePlayerObjects(playerData) {
  let players = []
  let result = []
  for (const player of playerData) {
    const playerID = player.PlayerID
    if (!players[playerID]) {
      players[playerID] = []
    }
    players[playerID].push(player)
  }
  for (const playerID in players) {
    result.push(players[playerID])
  }
  return result
}

app.use("/game", gameRouter)
app.use("/schedule", scheduleRouter)
app.use("/season", seasonRouter)

const zipFilePath = "./sportsdata.zip"
const extractDir = "./sportsDataCSV"
let latestFile = null
let latestYear = 0

const fileName = getLatestFileName("Stadium", "./sportsDataCSV")

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

const calculateMedian = (playersGames) => {
  const tempArrForMedian = []
  const minStatsValue = []
  const maxStatsValue = []
  const rangeStatsArr = []

  playersGames?.forEach((playerArr = [], index) => {
    const sortByPoints = [...playerArr].sort((a, b) => a - b)
    const sortByThreePointersMade = [...playerArr].sort(
      (a, b) => a.ThreePointersMade - b.ThreePointersMade
    )
    const sortByFreeThrowsMade = [...playerArr].sort(
      (a, b) => a.FreeThrowsMade - b.FreeThrowsMade
    )
    const sortByAssists = [...playerArr].sort((a, b) => a.Assists - b.Assists)
    const sortByRebounds = [...playerArr].sort(
      (a, b) => a.Rebounds - b.Rebounds
    )
    const sortByPersonalFouls = [...playerArr].sort(
      (a, b) => a.PersonalFouls - b.PersonalFouls
    )
    const sortByBlockedShots = [...playerArr].sort(
      (a, b) => a.BlockedShots - b.BlockedShots
    )
    const sortBySteals = [...playerArr].sort((a, b) => a.Steals - b.Steals)

    const length = playerArr.length
    const middleIndex = Math.floor(length / 2)
    let medianPoints,
      medianThreePointersMade,
      medianFreeThrowsMade,
      medianAssists,
      medianRebounds,
      medianPersonalFouls,
      medianBlockedShots,
      medianSteals
    if (length % 2 === 1) {
      medianPoints = sortByPoints[middleIndex].Points
      medianThreePointersMade =
        sortByThreePointersMade[middleIndex].ThreePointersMade
      medianFreeThrowsMade = sortByFreeThrowsMade[middleIndex].FreeThrowsMade
      medianAssists = sortByAssists[middleIndex].Assists
      medianRebounds = sortByRebounds[middleIndex].Rebounds
      medianPersonalFouls = sortByPersonalFouls[middleIndex].PersonalFouls
      medianBlockedShots = sortByBlockedShots[middleIndex].BlockedShots
      medianSteals = sortBySteals[middleIndex].Steals
    } else {
      medianPoints =
        (sortByPoints[middleIndex - 1].Points +
          sortByPoints[middleIndex].Points) /
        2
      medianThreePointersMade =
        (sortByThreePointersMade[middleIndex - 1].ThreePointersMade +
          sortByThreePointersMade[middleIndex].ThreePointersMade) /
        2
      medianFreeThrowsMade =
        (sortByFreeThrowsMade[middleIndex - 1].FreeThrowsMade +
          sortByFreeThrowsMade[middleIndex].FreeThrowsMade) /
        2
      medianAssists =
        (sortByAssists[middleIndex - 1].Assists +
          sortByAssists[middleIndex].Assists) /
        2
      medianRebounds =
        (sortByRebounds[middleIndex - 1].Rebounds +
          sortByRebounds[middleIndex].Rebounds) /
        2
      medianPersonalFouls =
        (sortByPersonalFouls[middleIndex - 1].PersonalFouls +
          sortByPersonalFouls[middleIndex].PersonalFouls) /
        2
      medianBlockedShots =
        (sortByBlockedShots[middleIndex - 1].BlockedShots +
          sortByBlockedShots[middleIndex].BlockedShots) /
        2
      medianSteals =
        (sortBySteals[middleIndex - 1].Steals +
          sortBySteals[middleIndex].Steals) /
        2
    }
    tempArrForMedian.push({
      ...playerArr[0],
      Points: medianPoints,
      ThreePointersMade: medianThreePointersMade,
      FreeThrowsMade: medianFreeThrowsMade,
      Assists: medianAssists,
      Rebounds: medianRebounds,
      PersonalFouls: medianPersonalFouls,
      BlockedShots: medianBlockedShots,
      Steals: medianSteals,
    })
    minStatsValue.push({
      ...playerArr[length - 1],
      Points: sortByPoints[0].Points,
      FreeThrowsMade: sortByFreeThrowsMade[length - 1].FreeThrowsMade,
      ThreePointersMade: sortByThreePointersMade[length - 1].ThreePointersMade,
      Assists: sortByAssists[length - 1].Assists,
      Rebounds: sortByRebounds[length - 1].Rebounds,
      PersonalFouls: sortByPersonalFouls[length - 1].PersonalFouls,
      BlockedShots: sortByBlockedShots[length - 1].BlockedShots,
      Steals: sortBySteals[length - 1].Steals,
    })
    maxStatsValue.push({
      ...playerArr[0],
      Points: sortByPoints[sortByPoints?.length - 1].Points,
      FreeThrowsMade:
        sortByFreeThrowsMade[sortByFreeThrowsMade?.length - 1].FreeThrowsMade,
      ThreePointersMade:
        sortByThreePointersMade[sortByFreeThrowsMade?.length - 1]
          .ThreePointersMade,
      Assists: sortByAssists[sortByAssists?.length - 1].Assists,
      Rebounds: sortByRebounds[sortByRebounds?.length - 1].Rebounds,
      PersonalFouls:
        sortByPersonalFouls[sortByPersonalFouls.length - 1].PersonalFouls,
      BlockedShots:
        sortByBlockedShots[sortByBlockedShots.length - 1].BlockedShots,
      Steals: sortBySteals[sortBySteals.length - 1].Steals,
    })
    rangeStatsArr.push({
      ...playerArr[0],
      Points:
        sortByPoints[sortByPoints?.length - 1].Points - sortByPoints[0].Points,
      FreeThrowsMade:
        sortByFreeThrowsMade[length - 1].FreeThrowsMade -
        sortByFreeThrowsMade[0].FreeThrowsMade,
      ThreePointersMade:
        sortByThreePointersMade[length - 1].ThreePointersMade -
        sortByThreePointersMade[0].ThreePointersMade,
      Assists: sortByAssists[length - 1].Assists - sortByAssists[0].Assists,
      Rebounds:
        sortByRebounds[length - 1].Rebounds - sortByRebounds[0].Rebounds,
      PersonalFouls:
        sortByPersonalFouls[length - 1].PersonalFouls -
        sortByPersonalFouls[0].PersonalFouls,
      BlockedShots:
        sortByBlockedShots[length - 1].BlockedShots -
        sortByBlockedShots[0].BlockedShots,
      Steals: sortBySteals[length - 1].Steals - sortBySteals[0].Steals,
    })
  })

  try {
    SeasonMinimum.deleteMany().then((_) =>
      SeasonMinimum.insertMany(minStatsValue)
    )
    SeasonMaximum.deleteMany().then((_) =>
      SeasonMaximum.insertMany(maxStatsValue)
    )
    SeasonRange.deleteMany().then((_) => SeasonRange.insertMany(rangeStatsArr))
    console.log("Succeess writing the documents")
  } catch (error) {
    console.error(error)
  }
}

function calculateMode(playersGames) {
  // PlayerGame.find({ Games: 1, SeasonType: { $in: [1, 3] } })
  //   .lean()
  //   .exec()
  //   .then((_) => {
  //     const playersGames = mergeSamePlayerObjects(_)
  const temp = []
  playersGames?.forEach((playerData = [], index) => {
    const pointsMap = playerData.reduce((map, player) => {
      const points = player.Points
      if (points in map) {
        map[points]++
      } else {
        map[points] = 1
      }
      return map
    }, {})
    const sortedEntries = Object.entries(pointsMap).sort((a, b) => b[1] - a[1])
    const modes = sortedEntries
      .filter((entry) => entry[1] === sortedEntries[0][1])
      .map((entry) => entry[0])

    const threePointersMadeMap = playerData.reduce((map, player) => {
      const ThreePointersMade = player.ThreePointersMade
      if (ThreePointersMade in map) {
        map[ThreePointersMade]++
      } else {
        map[ThreePointersMade] = 1
      }
      return map
    }, {})
    const ThreePointersMadeSortedEntries = Object.entries(
      threePointersMadeMap
    ).sort((a, b) => b[1] - a[1])
    const ThreePointersMadeModes = ThreePointersMadeSortedEntries.filter(
      (entry) => entry[1] === ThreePointersMadeSortedEntries[0][1]
    ).map((entry) => entry[0])

    const FreeThrowsMadeMap = playerData.reduce((map, player) => {
      const FreeThrowsMade = player.FreeThrowsMade
      if (FreeThrowsMade in map) {
        map[FreeThrowsMade]++
      } else {
        map[FreeThrowsMade] = 1
      }
      return map
    }, {})
    const FreeThrowsMadeSortedEntries = Object.entries(FreeThrowsMadeMap).sort(
      (a, b) => b[1] - a[1]
    )
    const FreeThrowsMadeModes = FreeThrowsMadeSortedEntries.filter(
      (entry) => entry[1] === FreeThrowsMadeSortedEntries[0][1]
    ).map((entry) => entry[0])

    const AssistsMap = playerData.reduce((map, player) => {
      const Assists = player.Assists
      if (Assists in map) {
        map[Assists]++
      } else {
        map[Assists] = 1
      }
      return map
    }, {})
    const AssistsSortedEntries = Object.entries(AssistsMap).sort(
      (a, b) => b[1] - a[1]
    )
    const AssistsModes = AssistsSortedEntries.filter(
      (entry) => entry[1] === AssistsSortedEntries[0][1]
    ).map((entry) => entry[0])

    const ReboundsMap = playerData.reduce((map, player) => {
      const Rebounds = player.Rebounds
      if (Rebounds in map) {
        map[Rebounds]++
      } else {
        map[Rebounds] = 1
      }
      return map
    }, {})
    const ReboundsSortedEntries = Object.entries(ReboundsMap).sort(
      (a, b) => b[1] - a[1]
    )
    const ReboundsModes = ReboundsSortedEntries.filter(
      (entry) => entry[1] === ReboundsSortedEntries[0][1]
    ).map((entry) => entry[0])

    const PersonalFoulsMap = playerData.reduce((map, player) => {
      const PersonalFouls = player.PersonalFouls
      if (PersonalFouls in map) {
        map[PersonalFouls]++
      } else {
        map[PersonalFouls] = 1
      }
      return map
    }, {})
    const PersonalFoulsSortedEntries = Object.entries(PersonalFoulsMap).sort(
      (a, b) => b[1] - a[1]
    )
    const PersonalFoulsModes = PersonalFoulsSortedEntries.filter(
      (entry) => entry[1] === PersonalFoulsSortedEntries[0][1]
    ).map((entry) => entry[0])

    const BlockedShotsMap = playerData.reduce((map, player) => {
      const BlockedShots = player.BlockedShots
      if (BlockedShots in map) {
        map[BlockedShots]++
      } else {
        map[BlockedShots] = 1
      }
      return map
    }, {})
    const BlockedShotsSortedEntries = Object.entries(BlockedShotsMap).sort(
      (a, b) => b[1] - a[1]
    )
    const BlockedShotsModes = BlockedShotsSortedEntries.filter(
      (entry) => entry[1] === BlockedShotsSortedEntries[0][1]
    ).map((entry) => entry[0])

    const StealsMap = playerData.reduce((map, player) => {
      const Steals = player.Steals
      if (Steals in map) {
        map[Steals]++
      } else {
        map[Steals] = 1
      }
      return map
    }, {})
    const StealsSortedEntries = Object.entries(StealsMap).sort(
      (a, b) => b[1] - a[1]
    )
    const StealsModes = StealsSortedEntries.filter(
      (entry) => entry[1] === StealsSortedEntries[0][1]
    ).map((entry) => entry[0])

    temp.push({
      ...playerData[0],
      Points: modes[0],
      ThreePointersMade: ThreePointersMadeModes[0],
      FreeThrowsMade: FreeThrowsMadeModes[0],
      Assists: AssistsModes[0],
      Rebounds: ReboundsModes[0],
      PersonalFouls: PersonalFoulsModes[0],
      BlockedShots: BlockedShotsModes[0],
      Steals: StealsModes[0],
    })
  })
  SeasonMode.deleteMany().then((_) => {
    SeasonMode.insertMany(temp).then((_) => console.log("Saved season mode"))
  })

}

const calculateGeoMean = (playersData = []) => {
  let playersGeoMeanData = []
  playersData.forEach((player = []) => {
    let pointsProduct = 1
    let threePointersMadeProduct = 1
    let freeThrowsMadeProduct = 1
    let assistsProduct = 1
    let reboundsProduct = 1
    let personalFoulsProduct = 1
    let blockedShotsFoulsProduct = 1
    let stealsProduct = 1
    player.forEach((item) => {
      pointsProduct *= item.Points
      threePointersMadeProduct *= item.ThreePointersMade
      freeThrowsMadeProduct *= item.FreeThrowsMade
      assistsProduct *= item.Assists
      reboundsProduct *= item.Rebounds
      personalFoulsProduct *= item.PersonalFouls
      blockedShotsFoulsProduct *= item.BlockedShots
      stealsProduct *= item.Steals
    })
    const pointsGeoMean = Math.pow(pointsProduct, 1 / player.length)
    const threePointersMadeGeoMean = Math.pow(
      threePointersMadeProduct,
      1 / player.length
    )
    const freeThrowsMadeGeoMean = Math.pow(
      freeThrowsMadeProduct,
      1 / player.length
    )
    const assistsGeoMean = Math.pow(assistsProduct, 1 / player.length)
    const reboundsGeoMean = Math.pow(reboundsProduct, 1 / player.length)
    const personalFoulsGeoMean = Math.pow(
      personalFoulsProduct,
      1 / player.length
    )
    const blockedShotsGeoMean = Math.pow(
      blockedShotsFoulsProduct,
      1 / player.length
    )
    const stealsGeoMean = Math.pow(stealsProduct, 1 / player.length)

    playersGeoMeanData.push({
      ...player[0],
      Points: pointsGeoMean.toFixed(2),
      ThreePointersMade: threePointersMadeGeoMean.toFixed(2),
      FreeThrowsMade: freeThrowsMadeGeoMean.toFixed(2),
      Assists: assistsGeoMean.toFixed(2),
      Rebounds: reboundsGeoMean.toFixed(2),
      PersonalFouls: personalFoulsGeoMean.toFixed(2),
      BlockedShots: blockedShotsGeoMean.toFixed(2),
      Steals: stealsGeoMean.toFixed(2),
    })
  })
  SeasonGeoMean.deleteMany().then((_) => {
    SeasonGeoMean.insertMany(playersGeoMeanData).then((_) => console.log("Season geomean saved"))
  })
}

async function convertToJSONandSavePlayerGameData() {
  try {
    const PlayerGameFilePath = "./sportsDataCSV/PlayerGame.2023.csv"
    csvtojson()
      .fromFile(PlayerGameFilePath)
      .then((docs) => {
        console.log("Player game data successfully converted to json")
        PlayerGame.deleteMany({}).then((_) => {
          PlayerGame.insertMany(docs).then((_) => {
            PlayerGame.find({ Games: 1, SeasonType: { $in: [1, 3] } })
              .lean()
              .exec()
              .then((_) => {
                const combinedGames = mergeSamePlayerObjects(_)
                calculateMedian(combinedGames)
                calculateMode(combinedGames)
                calculateGeoMean(combinedGames)
              })
            console.log("Player game data successfully saved to db")
          })
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
      convertToJSONandSavePlayerGameData()
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
// app.get("/playerSeasonData", playerSeasonData)

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
        "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
      },
    },
    async (response) => {
      let data = ""
      response.on("data", (chunk) => {
        data += chunk
      })
      response.on("end", async () => {
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
