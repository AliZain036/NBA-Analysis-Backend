const mongoose = require("mongoose")
const GameSchema = new mongoose.Schema({
  GameID: Number,
  Season: String,
  SeasonType: Number,
  Status: String,
  Day: String,
  DateTime: String,
  AwayTeam: String,
  HomeTeam: String,
  AwayTeamID: Number,
  HomeTeamID: Number,
  StadiumID: Number,
  AwayTeamScore: Number,
  HomeTeamScore: Number,
  PointSpread: Number,
  OverUnder: Number,
  AwayTeamMoneyLine: Number,
  HomeTeamMoneyLine: Number,
  HomeRotationNumber: Number,
  AwayRotationNumber: Number,
  NeutralVenue: String,
})

const Game = mongoose.model("Game", GameSchema)
module.exports = Game
