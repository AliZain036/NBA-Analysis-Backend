const gameRouter = require("express").Router()
const { getLastTenGames, getTodaysGames } = require("../controllers/playerGamesController")

gameRouter.get("/getLastTenGames", getLastTenGames)
gameRouter.get("/today", getTodaysGames)


module.exports = gameRouter