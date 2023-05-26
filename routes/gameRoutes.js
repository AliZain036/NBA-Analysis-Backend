const gameRouter = require("express").Router()
const {
  getLastTenGames,
  getTodaysGames,
  getLastTenGamesAverage,
  getLastTenGamesMinimum,
  getLastTenGamesMaximum,
  getLastTenGamesRange,
  getLastTenGamesMedian,
  getLastTenGamesGeoMean,
  getLastTenGamesMode,
  getLastTenDVPGeoMean,
  getLastTenDVPAverage,
  getLastTenDVPMode,
  getLastTenDVPMedian,
} = require("../controllers/playerGamesController")

gameRouter.get("/getLastTenGames", getLastTenGames)
gameRouter.get("/today", getTodaysGames)
gameRouter.get("/last-ten-average", getLastTenGamesAverage)
gameRouter.get("/last-ten-minimum", getLastTenGamesMinimum)
gameRouter.get("/last-ten-maximum", getLastTenGamesMaximum)
gameRouter.get("/last-ten-range", getLastTenGamesRange)
gameRouter.get("/last-ten-mode", getLastTenGamesMode)
gameRouter.get("/last-ten-median", getLastTenGamesMedian)
gameRouter.get("/last-ten-geomean", getLastTenGamesGeoMean)

gameRouter.get("/last-ten-dvp-geomean", getLastTenDVPGeoMean)
gameRouter.get("/last-ten-dvp-average", getLastTenDVPAverage)
gameRouter.get("/last-ten-dvp-mode", getLastTenDVPMode)
gameRouter.get("/last-ten-dvp-median", getLastTenDVPMedian)

module.exports = gameRouter
