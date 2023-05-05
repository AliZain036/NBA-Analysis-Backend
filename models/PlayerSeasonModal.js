const mongoose = require("mongoose")

// Define the schema for the player season data object

const PlayerSeason = new mongoose.Schema({
  StatID: { type: Number, required: true },
  TeamID: { type: Number, required: true },
  PlayerID: { type: Number, required: true },
  SeasonType: { type: Number, required: true },
  Season: { type: String, required: true },
  Name: { type: String, required: true },
  Team: { type: String, required: true },
  Position: { type: String, required: true },
  Started: { type: Number, required: true },
  Games: { type: Number, required: true },
  FantasyPoints: { type: Number, required: true },
  Minutes: { type: Number, required: true },
  Seconds: { type: Number, required: true },
  FieldGoalsMade: { type: Number, required: true },
  FieldGoalsAttempted: { type: Number, required: true },
  FieldGoalsPercentage: { type: Number, required: true },
  TwoPointersMade: { type: Number, required: true },
  TwoPointersAttempted: { type: Number, required: true },
  TwoPointersPercentage: { type: Number, required: true },
  ThreePointersMade: { type: Number, required: true },
  ThreePointersAttempted: { type: Number, required: true },
  ThreePointersPercentage: { type: Number, required: true },
  FreeThrowsMade: { type: Number, required: true },
  FreeThrowsAttempted: { type: Number, required: true },
  FreeThrowsPercentage: { type: Number, required: true },
  OffensiveRebounds: { type: Number, required: true },
  DefensiveRebounds: { type: Number, required: true },
  Rebounds: { type: Number, required: true },
  Assists: { type: Number, required: true },
  Steals: { type: Number, required: true },
  BlockedShots: { type: Number, required: true },
  Turnovers: { type: Number, required: true },
  PersonalFouls: { type: Number, required: true },
  Points: { type: Number, required: true },
  FantasyPointsFanDuel: { type: Number, required: true },
  FantasyPointsDraftKings: { type: Number, required: true },
  PlusMinus: { type: Number, required: true },
  DoubleDoubles: { type: Number, required: true },
  TripleDoubles: { type: Number, required: true },
})

PlayerSeason.index({ SeasonType: 1 })
PlayerSeason.index({ Games: 1 })

module.exports = mongoose.model("PlayerSeason", PlayerSeason)