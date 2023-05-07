const gameRouter = require("express").Router()
const { getLastTenGames } = require("../controllers/playerGamesController")

gameRouter.get("/getLastTenGames", getLastTenGames)

module.exports = gameRouter