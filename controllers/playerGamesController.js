const https = require("https")
const {
  LastTenGamesAverage,
  LastTenGamesMinimum,
  LastTenGamesMaximum,
  LastTenGamesRange,
  LastTenGamesMode,
  LastTenGamesMedian,
  LastTenGamesGeoMean,
  LastTenDefenceVsPositionAverage,
  LastTenDefenceVsPositionMode,
  LastTenDefenceVsPositionMedian,
  LastTenDefenceVsPositionGeoMean,
} = require("../models/playerGameModal")

const getLastTenGames = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: [] })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

const getTodaysGames = async (req, res) => {
  try {
    const date = new Date().getDate()
    const month = new Date().getMonth() + 1
    const year = new Date().getFullYear()
    https.get(
      `https://api.sportsdata.io/api/nba/odds/json/GamesByDate/${
        year + "-" + month + "-" + date
      }`,
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
          res.send(JSON.stringify(data))
        })
      }
    )
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getLastTenGamesAverage = async (req, res) => {
  try {
    const docs = await LastTenGamesAverage.find({})
    res.status(200).json({ success: true, data: docs })
  } catch (error) {
    res.status(500).json({ success: true, message: error.message })
  }
}

const getLastTenDVPAverage = async (req, res) => {
  try {
    const docs = await LastTenDefenceVsPositionAverage.find({})
    res.status(200).json({ success: true, data: docs })
  } catch (error) {
    res.status(500).json({ success: true, message: error.message })
  }
}

const getLastTenDVPMode = async (req, res) => {
  try {
    const docs = await LastTenDefenceVsPositionMode.find({})
    res.status(200).json({ success: true, data: docs })
  } catch (error) {
    res.status(500).json({ success: true, message: error.message })
  }
}
const getLastTenDVPMedian = async (req, res) => {
  try {
    const docs = await LastTenDefenceVsPositionMedian.find({})
    res.status(200).json({ success: true, data: docs })
  } catch (error) {
    res.status(500).json({ success: true, message: error.message })
  }
}
const getLastTenDVPGeoMean = async (req, res) => {
  try {
    const docs = await LastTenDefenceVsPositionGeoMean.find({})
    res.status(200).json({ success: true, data: docs })
  } catch (error) {
    res.status(500).json({ success: true, message: error.message })
  }
}

const getLastTenGamesMinimum = async (req, res) => {
  try {
    const docs = await LastTenGamesMinimum.find({})
    res.status(200).json({ success: true, data: docs })
  } catch (error) {
    res.status(500).json({ success: true, message: error.message })
  }
}
const getLastTenGamesMaximum = async (req, res) => {
  try {
    const docs = await LastTenGamesMaximum.find({})
    res.status(200).json({ success: true, data: docs })
  } catch (error) {
    res.status(500).json({ success: true, message: error.message })
  }
}
const getLastTenGamesRange = async (req, res) => {
  try {
    const docs = await LastTenGamesRange.find({})
    res.status(200).json({ success: true, data: docs })
  } catch (error) {
    res.status(500).json({ success: true, message: error.message })
  }
}
const getLastTenGamesMode = async (req, res) => {
  try {
    const docs = await LastTenGamesMode.find({})
    res.status(200).json({ success: true, data: docs })
  } catch (error) {
    res.status(500).json({ success: true, message: error.message })
  }
}
const getLastTenGamesMedian = async (req, res) => {
  try {
    const docs = await LastTenGamesMedian.find({})
    res.status(200).json({ success: true, data: docs })
  } catch (error) {
    res.status(500).json({ success: true, message: error.message })
  }
}
const getLastTenGamesGeoMean = async (req, res) => {
  try {
    const docs = await LastTenGamesGeoMean.find({})
    res.status(200).json({ success: true, data: docs })
  } catch (error) {
    res.status(500).json({ success: true, message: error.message })
  }
}

module.exports = {
  getLastTenGames,
  getTodaysGames,
  getLastTenGamesAverage,
  getLastTenGamesMode,
  getLastTenGamesMedian,
  getLastTenGamesGeoMean,
  getLastTenGamesMaximum,
  getLastTenGamesMinimum,
  getLastTenGamesRange,
  getLastTenDVPAverage,
  getLastTenDVPGeoMean,
  getLastTenDVPMedian,
  getLastTenDVPMode
}
