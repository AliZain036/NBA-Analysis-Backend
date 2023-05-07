const {
  playerSeasonData,
  getSeasonMedian,
  getSeasonMin,
  getSeasonMax,
  getSeasonMode,
  getSeasonRange,
  getSeasonGeoMean,
} = require("../controllers/seasonController")

const seasonRouter = require("express").Router()

seasonRouter.get("/geoMean", getSeasonGeoMean)
seasonRouter.get("/median", getSeasonMedian)
seasonRouter.get("/minimum", getSeasonMin)
seasonRouter.get("/maximum", getSeasonMax)
seasonRouter.get("/mode", getSeasonMode)
seasonRouter.get("/range", getSeasonRange)

module.exports = seasonRouter
