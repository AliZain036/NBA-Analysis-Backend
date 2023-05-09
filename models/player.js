const mongoose = require("mongoose")

const Player = new mongoose.Schema({
  PlayerID: Number,
  Status: String,
  TeamID: Number,
  Team: String,
  Jersey: Number,
  PositionCategory: String,
  Position: String,
  FirstName: String,
  LastName: String,
  Height: Number,
  Weight: Number,
  BirthDate: String,
  College: String,
  PhotoUrl: String,
  Experience: Number,
  InjuryStatus: String,
  FanDuelPlayerID: Number,
  DraftKingsPlayerID: Number,
  FanDuelName: String,
  DraftKingsName: String,
})

Player.index({ Team: 1 })
Player.index({ Opponent: 1 })

module.exports = mongoose.model("Player", Player)
