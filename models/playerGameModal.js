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
  Day: Date,
  DateTime: String,
  HomeOrAway: String,
  Games: Number,
  GamesCount: { type: Number },
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

const PlayerGame = mongoose.model("PlayerGame", PlayerGameSchema)
const PlayerGameProjection = mongoose.model("PlayerGameProjection", PlayerGameSchema)
const LastTenGamesAverage = mongoose.model(
  "LastTenGamesAverage",
  PlayerGameSchema
)
const LastTenGamesMode = mongoose.model("LastTenGamesMode", PlayerGameSchema)
const LastTenGamesMedian = mongoose.model(
  "LastTenGamesMedian",
  PlayerGameSchema
)
const LastTenGamesGeoMean = mongoose.model(
  "LastTenGamesGeoMean",
  PlayerGameSchema
)
const LastTenGamesMinimum = mongoose.model(
  "LastTenGamesMinimum",
  PlayerGameSchema
)
const LastTenGamesMaximum = mongoose.model(
  "LastTenGamesMaximum",
  PlayerGameSchema
)
const LastTenGamesRange = mongoose.model("LastTenGamesRange", PlayerGameSchema)
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
const SeasonDefenceVsPositionAverage = mongoose.model(
  "SeasonDefenceVsPositionAverage",
  PlayerGameSchema
)
const LastTenDefenceVsPositionAverage = mongoose.model(
  "LastTenDefenceVsPositionAverage",
  PlayerGameSchema
)
const SeasonVersusMedian = mongoose.model(
  "SeasonVersusMedian",
  PlayerGameSchema
)
const SeasonDefenceVsPositionMedian = mongoose.model(
  "SeasonDefenceVsPositionMedian",
  PlayerGameSchema
)
const LastTenDefenceVsPositionMedian = mongoose.model(
  "LastTenDefenceVsPositionMedian",
  PlayerGameSchema
)
const SeasonVersusMode = mongoose.model("SeasonVersusMode", PlayerGameSchema)
const SeasonDefenceVsPositionMode = mongoose.model(
  "SeasonDefenceVsPositionMode",
  PlayerGameSchema
)
const LastTenDefenceVsPositionMode = mongoose.model(
  "LastTenDefenceVsPositionMode",
  PlayerGameSchema
)
const SeasonVersusGeoMean = mongoose.model(
  "SeasonVersusGeoMean",
  PlayerGameSchema
)
const SeasonDefenceVsPositionGeoMean = mongoose.model(
  "SeasonDefenceVsPositionGeoMean",
  PlayerGameSchema
)
const LastTenDefenceVsPositionGeoMean = mongoose.model(
  "LastTenDefenceVsPositionGeoMean",
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
  LastTenGamesAverage,
  LastTenGamesGeoMean,
  LastTenGamesMaximum,
  LastTenGamesMedian,
  LastTenGamesMinimum,
  LastTenGamesMode,
  LastTenGamesRange,
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
  SeasonDefenceVsPositionAverage,
  SeasonDefenceVsPositionMode,
  SeasonDefenceVsPositionMedian,
  SeasonDefenceVsPositionGeoMean,
  LastTenDefenceVsPositionAverage,
  LastTenDefenceVsPositionMode,
  LastTenDefenceVsPositionMedian,
  LastTenDefenceVsPositionGeoMean,
  PlayerGameProjection
}
