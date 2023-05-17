const mongoose = require("mongoose")

// Define the schema
const PlayerGameSchema = new mongoose.Schema({
  StatID: Number,
  TeamID: Number,
  PlayerID: Number,
  SeasonType: Number,
  Season: Number,
  Name: String,
  Team: String,
  Position: String,
  Started: Number,
  InjuryStatus: String,
  GameID: Number,
  OpponentID: Number,
  Opponent: String,
  Day: String,
  DateTime: String,
  HomeOrAway: String,
  Games: Number,
  FantasyPoints: Number,
  Minutes: Number,
  Seconds: Number,
  FieldGoalsMade: Number,
  FieldGoalsAttempted: Number,
  FieldGoalsPercentage: Number,
  TwoPointersMade: Number,
  TwoPointersAttempted: Number,
  TwoPointersPercentage: Number,
  ThreePointersMade: Number,
  ThreePointersAttempted: Number,
  ThreePointersPercentage: Number,
  FreeThrowsMade: Number,
  FreeThrowsAttempted: Number,
  FreeThrowsPercentage: Number,
  OffensiveRebounds: Number,
  DefensiveRebounds: Number,
  Rebounds: Number,
  Assists: Number,
  Steals: Number,
  BlockedShots: Number,
  Turnovers: Number,
  PersonalFouls: Number,
  Points: Number,
  FantasyPointsFanDuel: Number,
  FantasyPointsDraftKings: Number,
  PlusMinus: Number,
  DoubleDoubles: Number,
  TripleDoubles: Number,
})

PlayerGameSchema.index({ SeasonType: 1 })
PlayerGameSchema.index({ Games: 1 })
PlayerGameSchema.index({ PlayerID: 1 })
PlayerGameSchema.index({ Opponent: 1 })

const PlayerGame = mongoose.model("PlayerGame", PlayerGameSchema)
const SeasonMinimum = mongoose.model("SeasonMinimum", PlayerGameSchema)
const SeasonMaximum = mongoose.model("SeasonMaximum", PlayerGameSchema)
const SeasonRange = mongoose.model("SeasonRange", PlayerGameSchema)
const SeasonMode = mongoose.model("SeasonMode", PlayerGameSchema)
const SeasonMedian = mongoose.model("SeasonMedian", PlayerGameSchema)
const SeasonGeoMean = mongoose.model("SeasonGeoMean", PlayerGameSchema)
const SeasonVersusAverage = mongoose.model(
  "SeasonVersusAverage",
  PlayerGameSchema
)
const SeasonVersusMedian = mongoose.model(
  "SeasonVersusMedian",
  PlayerGameSchema
)
const SeasonVersusMode = mongoose.model("SeasonVersusMode", PlayerGameSchema)
const SeasonVersusGeoMean = mongoose.model(
  "SeasonVersusGeoMean",
  PlayerGameSchema
)
const SeasonVersusMinimum = mongoose.model(
  "SeasonVersusMinimum",
  PlayerGameSchema
)
const SeasonVersusMaximum = mongoose.model(
  "SeasonVersusMaximum",
  PlayerGameSchema
)
const SeasonVersusRange = mongoose.model("SeasonVersusRange", PlayerGameSchema)

module.exports = {
  PlayerGame,
  SeasonMinimum,
  SeasonMaximum,
  SeasonRange,
  SeasonMode,
  SeasonMedian,
  SeasonGeoMean,
  SeasonVersusAverage,
  SeasonVersusMedian,
  SeasonVersusMode,
  SeasonVersusMinimum,
  SeasonVersusMaximum,
  SeasonVersusRange,
  SeasonVersusGeoMean,
}
