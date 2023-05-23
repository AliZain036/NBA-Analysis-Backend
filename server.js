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
const axios = require("axios")

const jszip = require("jszip")
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
const {
  PlayerSeason,
  PlayerSeasonAverage,
  PlayerSeasonMinimum,
  PlayerSeasonMaximum,
  PlayerSeasonRange,
  PlayerSeasonMedian,
  PlayerSeasonMode,
  PlayerSeasonGeoMean,
} = require("./models/PlayerSeasonModal")
const gameRouter = require("./routes/gameRoutes")
const scheduleRouter = require("./routes/scheduleRoutes")
const {
  PlayerGame,
  SeasonVersusAverage,
  SeasonVersusMedian,
  SeasonMedian,
  SeasonVersusMode,
  SeasonVersusGeoMean,
  SeasonVersusMinimum,
  SeasonVersusMaximum,
  SeasonVersusRange,
  LastTenGamesAverage,
  LastTenGamesMinimum,
  LastTenGamesMaximum,
  LastTenGamesRange,
  LastTenGamesMedian,
  LastTenGamesGeoMean,
  LastTenGamesMode,
} = require("./models/playerGameModal")
const seasonRouter = require("./routes/seasonRoutes")
const player = require("./models/player")

const fantasyDataCSVFileUrl =
  "https://sportsdata.io/members/download-file?product=5aff2d7c-d41e-40a8-bb7c-b18096c1ca3b"

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async (res) => {
    try {
      console.log("Connection successfully established")
      // downloadAndExtractZip()
      // getLastTenGamesData()
      // calculateSeasonVersusCalculations()
      // convertToJSONandSavePlayerGameData()
      // convertToJSONandSavePlayerSeasonData()
    } catch (error) {
      console.error(error.message, " error")
    }
  })
  .catch((err) => console.error(err))

const outputDir = "./sportsDataCSV"
//
// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir)
}

// Function to download and extract the zip file
async function downloadAndExtractZip() {
  try {
    // Download the zip file
    const response = await axios.get(fantasyDataCSVFileUrl, {
      responseType: "arraybuffer",
    })

    // Save the zip file locally
    const zipFilePath = path.join(outputDir, "file.zip")
    fs.writeFileSync(zipFilePath, response.data)

    // Extract the zip contents
    const extractedFiles = await unzipper.Open.file(zipFilePath)
    for (const file of extractedFiles.files) {
      const filePath = path.join(outputDir, file.path)
      const fileContent = await file.buffer()

      // Provide header information if required
      const header = "Header1,Header2,Header3" // Replace with your actual header information

      // Write the file content with header to the output file
      fs.writeFileSync(filePath, `${fileContent}`)
    }

    console.log("Zip file downloaded and extracted successfully!")

    getLastTenGamesData()
    convertToJSONandSavePlayerData()
    calculateSeasonVersusCalculations()
    convertToJSONandSavePlayerGameData()
    convertToJSONandSavePlayerSeasonData()
  } catch (error) {
    console.error("Error downloading and extracting the zip file:", error)
  }
}
//
app.get("PlayerGameProjectionStatsByDate", (req, res, next) => {
  const year = new Date().getFullYear()
  const date = new Date().getDate()
  const month = new Date().getMonth() + 1
  https.get(
    `https://api.sportsdata.io/api/nba/fantasy/json/PlayerGameProjectionStatsByDate/${year}-${month}-${date}`,
    {
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
      },
    },
    (response) => {
      let data = ""
      response.on("data", (chunk) => {
        data += chunk
      })
      response.on("end", () => {
        console.log({ data })
        res.send(data)
      })
    }
  )
})

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

const getLastTenGamesData = async () => {
  try {
    let teams = [
      { name: "ATL", games: [] },
      { name: "BKN", games: [] },
      { name: "BOS", games: [] },
      { name: "CHA", games: [] },
      { name: "CHI", games: [] },
      { name: "CLE", games: [] },
      { name: "DAL", games: [] },
      { name: "DEN", games: [] },
      { name: "DET", games: [] },
      { name: "GS", games: [] },
      { name: "HOU", games: [] },
      { name: "IND", games: [] },
      { name: "LAC", games: [] },
      { name: "LAL", games: [] },
      { name: "MEM", games: [] },
      { name: "MIA", games: [] },
      { name: "MIL", games: [] },
      { name: "MIN", games: [] },
      { name: "NO", games: [] },
      { name: "NY", games: [] },
      { name: "OKC", games: [] },
      { name: "ORL", games: [] },
      { name: "PHI", games: [] },
      { name: "PHO", games: [] },
      { name: "POR", games: [] },
      { name: "SA", games: [] },
      { name: "SAC", games: [] },
      { name: "TOR", games: [] },
      { name: "UTA", games: [] },
      { name: "WAS", games: [] },
    ]
    let lastTenGamesData = []
    teams.forEach(async (team, index) => {
      const gamesForTeam = await PlayerGame.find({
        SeasonType: { $in: [1, 3] },
        Games: 1,
        Team: team.name,
      })
        .sort({ Day: -1 })
        .limit(10)
        .lean()
        .exec()
      teams[index].games = gamesForTeam
      lastTenGamesData[index] = gamesForTeam
      gamesForTeam.forEach((item) => {
        if (item.Name === "Larry Nance Jr.") {
          console.log({ item })
        }
      })
      if (index === 29) {
        let arr = []
        lastTenGamesData.forEach((teamGames) => arr.push(...teamGames))
        let samePlayerGames = mergeSamePlayerObjects(arr)
        calculateAverage(samePlayerGames, "Last Ten Games")
        calculateMedian(samePlayerGames, "Last Ten Games")
        calculateGeoMean(samePlayerGames, "Last Ten Games")
        calculateMode(samePlayerGames, "Last Ten Games")
      }
    })
  } catch (error) {
    console.error(error)
  }
}

const calculateSeasonAverage = async (data) => {
  try {
    const average = []
    data.forEach((player) => {
      if (player.Games >= 1) {
        let playerAverage = {
          ...player,
          gamesPlayed: player.Games,
          Points: (player.Points / player.Games).toFixed(2),
          Assists: (player.Assists / player.Games).toFixed(2),
          FreeThrowsMade: (player.FreeThrowsMade / player.Games).toFixed(2),
          ThreePointersMade: (player.ThreePointersMade / player.Games).toFixed(
            2
          ),
          PersonalFouls: (player.PersonalFouls / player.Games).toFixed(2),
          BlockedShots: (player.BlockedShots / player.Games).toFixed(2),
          Rebounds: (player.Rebounds / player.Games).toFixed(2),
          Steals: (player.Steals / player.Games).toFixed(2),
          GamesCount: player.Games,
        }
        Object.keys(playerAverage).forEach((key) => {
          if (isNaN(playerAverage[key]) && key === "Points") {
            console.log("key: " + key + " value: " + playerAverage[key], player)
          }
        })
        average.push(playerAverage)
      }
    })
    PlayerSeasonAverage.deleteMany({}).then((_) => {
      PlayerSeasonAverage.insertMany(average).then((_) =>
        console.log("Player season average calculated")
      )
    })
  } catch (error) {
    console.error(error)
  }
}

app.use("/game", gameRouter)
app.use("/schedule", scheduleRouter)
app.use("/season", seasonRouter)

const zipFilePath = "./sportsdata.zip"
const extractDir = "./sportsDataCSV"

async function convertToJSONandSavePlayerSeasonData() {
  try {
    const PlayerSeasonFilePath = "./sportsDataCSV/PlayerSeason.2023.csv"
    csvtojson()
      .fromFile(PlayerSeasonFilePath)
      .then((playerSeasonData) => {
        PlayerSeason.deleteMany({}).then((_) => {
          PlayerSeason.insertMany(playerSeasonData).then(async (_) => {
            {
              console.log("Player season data inserted successfully")
              // const playerGameData = await PlayerSeason.find({
              //   SeasonType: { $in: [1, 3] },
              //   Games: { $ne: 0 },
              // })
              //   .lean()
              //   .exec()
            }
          })
        })
      })
  } catch (error) {
    console.error(error)
  }
}

async function convertToJSONandSavePlayerData() {
  try {
    const PlayerFilePath = "./sportsDataCSV/Player.2023.csv"
    csvtojson()
      .fromFile(PlayerFilePath)
      .then((playersData) => {
        console.log("Success converting to json")
        player.deleteMany({}).then((_) => {
          player
            .insertMany(playersData)
            .then((_) => console.log("Players inserted successfully"))
        })
      })
  } catch (error) {
    console.error(error)
  }
}

const calculateMedian = async (playersGames = [], collectionName = "") => {
  const tempArrForMedian = []
  const minStatsValue = []
  const maxStatsValue = []
  const rangeStatsArr = []

  playersGames?.forEach((playerArr = [], index) => {
    const sortByPoints = [...playerArr].sort((a, b) => a.Points - b.Points)
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
    if (index === 0) {
      sortByPoints.forEach((item) => console.log("Points ==", item.Points))
      sortByThreePointersMade.forEach((item) =>
        console.log("Points ==", item.ThreePointersMade)
      )
      sortByFreeThrowsMade.forEach((item) =>
        console.log("Points ==", item.FreeThrowsMade)
      )
      sortByAssists.forEach((item) => console.log("Points ==", item.Assists))
      sortByRebounds.forEach((item) => console.log("Points ==", item.Rebounds))
      sortByBlockedShots.forEach((item) =>
        console.log("Points ==", item.BlockedShots)
      )
      sortBySteals.forEach((item) => console.log("Points ==", item.Steals))
    }

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
        (sortByPoints[middleIndex - 1]?.Points +
          sortByPoints[middleIndex]?.Points) /
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
    Object.keys(playerArr[0]).forEach((key) => {
      if (isNaN(playerArr[0][key]) && key === "Points") {
        console.log(playerArr)
      }
    })
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
      GamesCount: playerArr?.length,
    })
    minStatsValue.push({
      ...playerArr[0],
      Points: sortByPoints[0].Points,
      FreeThrowsMade: sortByFreeThrowsMade[0].FreeThrowsMade,
      ThreePointersMade: sortByThreePointersMade[0].ThreePointersMade,
      Assists: sortByAssists[0].Assists,
      Rebounds: sortByRebounds[0].Rebounds,
      PersonalFouls: sortByPersonalFouls[0].PersonalFouls,
      BlockedShots: sortByBlockedShots[0].BlockedShots,
      Steals: sortBySteals[0].Steals,
      GamesCount: playerArr?.length,
    })
    maxStatsValue.push({
      ...playerArr[0],
      Points: sortByPoints[sortByPoints.length - 1].Points,
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
      GamesCount: playerArr?.length,
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
      GamesCount: playerArr?.length,
    })
  })

  if (collectionName === "Season Versus") {
    try {
      SeasonVersusMinimum.deleteMany().then((_) =>
        SeasonVersusMinimum.insertMany(minStatsValue).then(() =>
          console.log("SeasonVersusMinimum saved successfully")
        )
      )
      SeasonVersusMaximum.deleteMany().then((_) =>
        SeasonVersusMaximum.insertMany(maxStatsValue).then(() =>
          console.log("SeasonVersusMaximum saved successfully")
        )
      )
      SeasonVersusRange.deleteMany().then((_) =>
        SeasonVersusRange.insertMany(rangeStatsArr).then(() =>
          console.log("SeasonVersusRange saved successfully")
        )
      )
      SeasonVersusMedian.deleteMany().then((_) =>
        SeasonVersusMedian.insertMany(tempArrForMedian).then(() =>
          console.log("SeasonVersusMedian saved successfully")
        )
      )
    } catch (error) {
      console.error(error)
    }
  } else if (collectionName === "Last Ten Games") {
    LastTenGamesMinimum.deleteMany().then((_) =>
      LastTenGamesMinimum.insertMany(minStatsValue).then(() =>
        console.log("last ten games minimum saved successfully")
      )
    )
    LastTenGamesMaximum.deleteMany().then((_) =>
      LastTenGamesMaximum.insertMany(maxStatsValue).then(() =>
        console.log("last ten games maximum saved successfully")
      )
    )
    LastTenGamesRange.deleteMany().then((_) =>
      LastTenGamesRange.insertMany(rangeStatsArr).then(() =>
        console.log("last ten games range saved successfully")
      )
    )
    LastTenGamesMedian.deleteMany().then((_) =>
      LastTenGamesMedian.insertMany(tempArrForMedian).then(() =>
        console.log("last ten games median saved successfully")
      )
    )
  } else {
    try {
      PlayerSeasonMinimum.deleteMany().then((_) =>
        PlayerSeasonMinimum.insertMany(minStatsValue)
      )
      PlayerSeasonMaximum.deleteMany().then((_) =>
        PlayerSeasonMaximum.insertMany(maxStatsValue)
      )
      PlayerSeasonRange.deleteMany().then((_) =>
        PlayerSeasonRange.insertMany(rangeStatsArr)
      )
      PlayerSeasonMedian.deleteMany().then((_) =>
        PlayerSeasonMedian.insertMany(tempArrForMedian)
      )
      console.log("Succeess writing the documents")
    } catch (error) {
      console.error(error)
    }
  }
}

function calculateMode(playersGames, collectionName = "") {
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
      Points: +modes[0],
      ThreePointersMade: +ThreePointersMadeModes[0],
      FreeThrowsMade: +FreeThrowsMadeModes[0],
      Assists: +AssistsModes[0],
      Rebounds: +ReboundsModes[0],
      PersonalFouls: +PersonalFoulsModes[0],
      BlockedShots: +BlockedShotsModes[0],
      Steals: +StealsModes[0],
      GamesCount: +playerData?.length,
    })
  })
  if (collectionName === "Season Versus") {
    SeasonVersusMode.deleteMany().then((_) => {
      SeasonVersusMode.insertMany(temp).then((_) =>
        console.log("Saved SeasonVersusMode")
      )
    })
  } else if (collectionName === "Last Ten Games") {
    LastTenGamesMode.deleteMany().then((_) => {
      LastTenGamesMode.insertMany(temp).then((_) =>
        console.log("Saved last ten games mode")
      )
    })
  } else {
    PlayerSeasonMode.deleteMany().then((_) => {
      PlayerSeasonMode.insertMany(temp).then((_) =>
        console.log("Saved season mode")
      )
    })
  }
}

const calculateGeoMean = (playersData = [], collectionName = "") => {
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
      GamesCount: player?.length,
    })
  })
  if (collectionName === "Season Versus") {
    SeasonVersusGeoMean.deleteMany().then((_) => {
      SeasonVersusGeoMean.insertMany(playersGeoMeanData).then((_) =>
        console.log("Season SeasonVersusGeoMean")
      )
    })
  } else if (collectionName === "Last Ten Games") {
    LastTenGamesGeoMean.deleteMany().then((_) => {
      LastTenGamesGeoMean.insertMany(playersGeoMeanData).then((_) =>
        console.log("Last ten games geomean saved into database")
      )
    })
  } else {
    PlayerSeasonGeoMean.deleteMany().then((_) => {
      PlayerSeasonGeoMean.insertMany(playersGeoMeanData).then((_) =>
        console.log("Season geomean saved")
      )
    })
  }
}

async function convertToJSONandSavePlayerGameData() {
  try {
    const PlayerGameFilePath = "./sportsDataCSV/PlayerGame.2023.csv"
    csvtojson()
      .fromFile(PlayerGameFilePath)
      .then((docs) => {
        console.log("Data converted to json")
        PlayerGame.deleteMany({}).then((_) => {
          PlayerGame.insertMany(docs).then(async (_) => {
            console.log("Player game data saved successfully ======= ")
            getLastTenGamesData()
            const playerGameData = await PlayerGame.find({
              Games: 1,
              SeasonType: { $in: [1, 3] },
            })
              .lean()
              .exec()
            const combinedGames = mergeSamePlayerObjects(playerGameData)
            calculateAverage(combinedGames)
            calculateMedian(combinedGames)
            calculateMode(combinedGames)
            calculateGeoMean(combinedGames)
          })
        })
      })
  } catch (error) {
    console.error(error)
  }
}

nodeCron
  .schedule("30 18 * * *", () => {
    try {
      downloadAndExtractZip()
    } catch (error) {
      console.error(error)
    }
  })
  .start()

const filePath = "./file.csv"

const stripe = Stripe(
  "sk_test_51Mg4d0A5j1K1pUTFhowYmQMWTVOMvzelqTl3GQ3U2aVNm7qj9Q8E1uncv7jtDNF3Qep4EMWKNh7OdcL9CCdNALJA00gu74VIgF"
)

let jsonData = {}
const file = fs.createWriteStream("./sportsDataCSV/Player.2023.csv")

// const downloadFile = (url, dest) => {
//   return new Promise((resolve, reject) => {
//     // function deleteFilesInDirectory(directoryPath) {
//     fs.readdir("./sportsDataCSV", (err, files) => {
//       if (err) {
//         console.error("Error reading directory:", err)
//         return
//       }

//       files.forEach((file) => {
//         const filePath = path.join("./sportsDataCSV", file)

//         fs.unlink(filePath, (error) => {
//           if (error) {
//             console.error("Error deleting file:", filePath, error)
//           } else {
//           }
//         })
//       })
//     })
//     // }
//     const fileStream = fs.createWriteStream(dest)
//     request(url)
//       .pipe(fileStream)
//       .on("finish", () => {
//         console.log("downloaded zip file")
//         resolve()
//       })
//       .on("error", (err) => {
//         reject(err)
//       })
//   })
// }

const calculateSeasonVersusCalculations = async () => {
  try {
    const month = new Date().getMonth() + 1
    const date = new Date().getDate() - 1
    const year = new Date().getFullYear()
    https.get(
      `https://api.sportsdata.io/api/nba/fantasy/json/PlayerGameProjectionStatsByDate/${year}-${month}-${date}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
        },
      },
      (response) => {
        let data = ""
        response.on("data", (chunk) => {
          data += chunk
        })
        response.on("end", () => {
          let scheduledGames = JSON.parse(data)
          // const arr = [...scheduledGames.map((pl) => pl.OpponentID)]
          // const uniqueArr = arr.filter((el) => !uniqueArr.includes(el))
          let arr = []
          scheduledGames.forEach(async (game, index) => {
            let playerGames = await PlayerGame.find({
              SeasonType: { $in: [1, 3] },
              Games: 1,
              PlayerID: game.PlayerID,
              OpponentID: game.OpponentID,
            })
              .lean()
              .exec()
            if (playerGames.length > 0) {
              arr.push(playerGames)
            } else {
              console.log({ game })
            }
            if (index === scheduledGames.length - 1) {
              calculateAverage(arr, "Season Versus")
              calculateMedian(arr, "Season Versus")
              calculateMode(arr, "Season Versus")
              calculateGeoMean(arr, "Season Versus")
            }
          })
          // res.send(data)
        })
      }
    )
  } catch (error) {
    console.error(error)
  }
}

const calculateAverage = async (playersData, type = "") => {
  const temp = []

  // Calculate Points average for each player
  playersData?.map((playerArr = [], index) => {
    const avg = 0
    // const result = playerArr.reduce(
    //   (accumulator, currentObject) => {
    //     if (currentObject.PlayerID === accumulator.PlayerID) {
    //       accumulator.Points += currentObject.Points
    //       accumulator.ThreePointersMade += currentObject.ThreePointersMade
    //       accumulator.FreeThrowsMade += currentObject.FreeThrowsMade
    //       accumulator.Assists += currentObject.Assists
    //       accumulator.Rebounds += currentObject.Rebounds
    //       accumulator.PersonalFouls += currentObject.PersonalFouls
    //       accumulator.BlockedShots += currentObject.BlockedShots
    //       accumulator.Steals += currentObject.Steals
    //       accumulator.Count++
    //     } else {
    //       accumulator = {
    //         PlayerID: currentObject.PlayerID,
    //         Points: currentObject.Points,
    //         ThreePointersMade: currentObject.ThreePointersMade,
    //         FreeThrowsMade: currentObject.FreeThrowsMade,
    //         Assists: currentObject.Assists,
    //         Rebounds: currentObject.Rebounds,
    //         PersonalFouls: currentObject.PersonalFouls,
    //         BlockedShots: currentObject.BlockedShots,
    //         Steals: currentObject.Steals,
    //         Count: 1,
    //       }
    //     }
    //     return accumulator
    //   },
    //   {
    //     PlayerID: playerArr[0]?.PlayerID,
    //     Points: playerArr[0]?.Points,
    //     ThreePointersMade: playerArr[0]?.ThreePointersMade,
    //     FreeThrowsMade: playerArr[0]?.FreeThrowsMade,
    //     Assists: playerArr[0]?.Assists,
    //     Rebounds: playerArr[0]?.Rebounds,
    //     PersonalFouls: playerArr[0]?.PersonalFouls,
    //     BlockedShots: playerArr[0]?.BlockedShots,
    //     Steals: playerArr[0]?.Steals,
    //     Count: 0,
    //   }
    // )
    let totalPoints = 0
    let totalThreePointersMadeAvg = 0
    let totalFreeThrowsMade = 0
    let totalAssists = 0
    let totalRebounds = 0
    let totalPersonalFouls = 0
    let totalBlockedShots = 0
    let totalSteals = 0
    playerArr.forEach((playerObj) => {
      totalPoints += playerObj.Points
      totalThreePointersMadeAvg += playerObj.ThreePointersMade
      totalFreeThrowsMade += playerObj.FreeThrowsMade
      totalAssists += playerObj.Assists
      totalRebounds += playerObj.Rebounds
      totalPersonalFouls += playerObj.PersonalFouls
      totalBlockedShots += playerObj.BlockedShots
      totalSteals += playerObj.Steals
    })
    const PointsAverage = totalPoints / playerArr.length || 0
    const ThreePointersMadeAverage =
      totalThreePointersMadeAvg / playerArr.length || 0
    const FreeThrowsMadeAverage = totalFreeThrowsMade / playerArr.length || 0
    const AssistsAverage = totalAssists / playerArr.length || 0
    const ReboundsAverage = totalRebounds / playerArr.length || 0
    const PersonalFoulsAverage = totalPersonalFouls / playerArr.length || 0
    const BlockedShotsAverage = totalBlockedShots / playerArr.length || 0
    const StealsAverage = totalSteals / playerArr.length || 0

    // const gamesPlayed = playerArr.reduce((acc, player) => {
    //   if (player.Games === 1) {
    //     return acc + 1
    //   } else {
    //     return acc
    //   }
    // }, 0)

    // Create object with calculated average for requireed fields and push it in array to show in the table
    const playerWithAveragePoints = {
      ...playerArr[0],
      Points: PointsAverage.toFixed(2),
      ThreePointersMade: ThreePointersMadeAverage.toFixed(2),
      FreeThrowsMade: FreeThrowsMadeAverage.toFixed(2),
      Assists: AssistsAverage.toFixed(2),
      Rebounds: ReboundsAverage.toFixed(2),
      PersonalFouls: PersonalFoulsAverage.toFixed(2),
      BlockedShots: BlockedShotsAverage.toFixed(2),
      Steals: StealsAverage.toFixed(2),
      // gamesPlayed: gamesPlayed,
      GamesCount: playerArr?.length,
    }
    temp.push(playerWithAveragePoints)
  })
  if (type === "Season Versus") {
    SeasonVersusAverage.deleteMany().then((_) => {
      console.log(_)
      SeasonVersusAverage.insertMany(temp).then((_) =>
        console.log("seasonVersusAvg calculated and inserted")
      )
    })
  } else if (type === "Last Ten Games") {
    LastTenGamesAverage.deleteMany().then(() => {
      console.log("Deleted existing last ten games average")
      LastTenGamesAverage.insertMany(temp).then((_) =>
        console.log("Last ten games average inserted into database")
      )
    })
  } else {
    PlayerSeasonAverage.deleteMany().then(() => {
      console.log("Deleted existing PlayerSeasonAverage")
      PlayerSeasonAverage.insertMany(temp).then((_) =>
        console.log("PlayerSeasonAverage inserted into database")
      )
    })
  }
}

const extractFile = (filePath, extractDir) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .on("close", () => {
        console.log("Close")
        resolve()
      })
      .on("error", (err) => {
        console.error(err)
        reject(err)
      })
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

app.get("/PlayerSeasonStats/:season", (req, res) => {
  const season = req.params.season
  https.get(
    `https://api.sportsdata.io/api/nba/fantasy/json/PlayerSeasonStats/${season}`,
    {
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
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
        "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
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
        "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
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
