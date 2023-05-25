const {
  playerSeasonData,
  getSeasonMedian,
  getSeasonMin,
  getSeasonMax,
  getSeasonMode,
  getSeasonRange,
  getSeasonGeoMean,
  getSeasonAverage,
  getSeasonVersusGeoMean,
  getSeasonVersusMedian,
  getSeasonVersusMin,
  getSeasonVersusMax,
  getSeasonVersusMode,
  getSeasonVersusRange,
  getSeasonVersusAverage,
  getSeasonDefenceVsPositionAverage,
  getSeasonDefenceVsPositionMode,
  getSeasonDefenceVsPositionMedian,
  getSeasonDefenceVsPositionGeoMean,
} = require("../controllers/seasonController")

const seasonRouter = require("express").Router()

seasonRouter.get("/geoMean", getSeasonGeoMean)
seasonRouter.get("/average", getSeasonAverage)
seasonRouter.get("/median", getSeasonMedian)
seasonRouter.get("/minimum", getSeasonMin)
seasonRouter.get("/maximum", getSeasonMax)
seasonRouter.get("/mode", getSeasonMode)
seasonRouter.get("/range", getSeasonRange)

seasonRouter.get('/defence-vs-position-average', getSeasonDefenceVsPositionAverage)
seasonRouter.get('/defence-vs-position-mode', getSeasonDefenceVsPositionMode)
seasonRouter.get('/defence-vs-position-median', getSeasonDefenceVsPositionMedian)
seasonRouter.get('/defence-vs-position-geomean', getSeasonDefenceVsPositionGeoMean)

seasonRouter.get("/versus-geoMean", getSeasonVersusGeoMean)
seasonRouter.get("/versus-average", getSeasonVersusAverage)
seasonRouter.get("/versus-median", getSeasonVersusMedian)
seasonRouter.get("/versus-minimum", getSeasonVersusMin)
seasonRouter.get("/versus-maximum", getSeasonVersusMax)
seasonRouter.get("/versus-mode", getSeasonVersusMode)
seasonRouter.get("/versus-range", getSeasonVersusRange)

module.exports = seasonRouter
