const https = require("https")
const csvToJson = require("csvtojson")
const PlayerSeasonModal = require("../models/PlayerSeasonModal")
const {
  PlayerGame,
  SeasonGeoMean,
  SeasonMinimum,
  SeasonMaximum,
  SeasonRange,
  SeasonMode,
  SeasonMedian,
} = require("../models/playerGameModal")

const seasonMedianByPlayer = async (req, res) => {
  try {
    const data = await PlayerGame.find({
      Games: "1",
      SeasonType: { $in: ["1", "3"] },
    })
    const tempArrForMedian = []
    // const groupedPlayers = groupPlayersByPlayerID(data)
    console.log(groupedPlayers, " === groupedPlayers")
    // groupedPlayers?.forEach((playerArr = [], index) => {
    //   const sortByPoints = playerArr.map((pl) => pl.Points)
    //   sortByPoints.sort((a, b) => a - b)
    //   const sortByThreePointersMade = playerArr.map(
    //     (pl) => pl.ThreePointersMade
    //   )
    //   sortByThreePointersMade.sort((a, b) => a - b)
    //   const sortByFreeThrowsMade = playerArr.map((pl) => pl.FreeThrowsMade)
    //   sortByFreeThrowsMade.sort((a, b) => a - b)
    //   const sortByAssists = playerArr.map((pl) => pl.Assists)
    //   sortByAssists.sort((a, b) => a - b)
    //   const sortByRebounds = playerArr.map((pl) => pl.Rebounds)
    //   sortByRebounds.sort((a, b) => a - b)
    //   const sortByPersonalFouls = playerArr.map((pl) => pl.PersonalFouls)
    //   sortByPersonalFouls.sort((a, b) => a - b)
    //   const sortByBlockedShots = playerArr.map((pl) => pl.BlockedShots)
    //   sortByBlockedShots.sort((a, b) => a - b)
    //   const sortBySteals = playerArr.map((pl) => pl.Steals)
    //   sortBySteals.sort((a, b) => a - b)

    //   const length = playerArr.length
    //   const middleIndex = Math.floor(length / 2)
    //   let medianPoints,
    //     medianThreePointersMade,
    //     medianFreeThrowsMade,
    //     medianAssists,
    //     medianRebounds,
    //     medianPersonalFouls,
    //     medianBlockedShots,
    //     medianSteals

    //   if (length % 2 === 1) {
    //     medianPoints = sortByPoints[middleIndex]
    //     medianThreePointersMade = sortByThreePointersMade[middleIndex]
    //     medianFreeThrowsMade = sortByFreeThrowsMade[middleIndex]
    //     medianAssists = sortByAssists[middleIndex]
    //     medianRebounds = sortByRebounds[middleIndex]
    //     medianPersonalFouls = sortByPersonalFouls[middleIndex]
    //     medianBlockedShots = sortByBlockedShots[middleIndex]
    //     medianSteals = sortBySteals[middleIndex]
    //   } else {
    //     medianPoints =
    //       (sortByPoints[middleIndex - 1] + sortByPoints[middleIndex]) / 2
    //     medianThreePointersMade =
    //       (sortByThreePointersMade[middleIndex - 1] +
    //         sortByThreePointersMade[middleIndex]) /
    //       2
    //     medianFreeThrowsMade =
    //       (sortByFreeThrowsMade[middleIndex - 1] +
    //         sortByFreeThrowsMade[middleIndex]) /
    //       2
    //     medianAssists =
    //       (sortByAssists[middleIndex - 1] + sortByAssists[middleIndex]) / 2
    //     medianRebounds =
    //       (sortByRebounds[middleIndex - 1] + sortByRebounds[middleIndex]) / 2
    //     medianPersonalFouls =
    //       (sortByPersonalFouls[middleIndex - 1] +
    //         sortByPersonalFouls[middleIndex]) /
    //       2
    //     medianBlockedShots =
    //       (sortByBlockedShots[middleIndex - 1] +
    //         sortByBlockedShots[middleIndex]) /
    //       2
    //     medianSteals =
    //       (sortBySteals[middleIndex - 1] + sortBySteals[middleIndex]) / 2
    //   }
    //   tempArrForMedian.push({
    //     ...playerArr[0],
    //     Points: medianPoints,
    //     ThreePointersMade: medianThreePointersMade,
    //     FreeThrowsMade: medianFreeThrowsMade,
    //     Assists: medianAssists,
    //     Rebounds: medianRebounds,
    //     PersonalFouls: medianPersonalFouls,
    //     BlockedShots: medianBlockedShots,
    //     Steals: medianSteals,
    //   })
    //   // minStatsValue.push({
    //   //   ...playerArr[length - 1],
    //   //   Points: sortByPoints[0],
    //   //   FreeThrowsMade: sortByFreeThrowsMade[length - 1],
    //   //   ThreePointersMade: sortByThreePointersMade[length - 1],
    //   //   Assists: sortByAssists[length - 1],
    //   //   Rebounds: sortByRebounds[length - 1],
    //   //   PersonalFouls: sortByPersonalFouls[length - 1],
    //   //   BlockedShots: sortByBlockedShots[length - 1],
    //   //   Steals: sortBySteals[length - 1],
    //   // })
    //   // maxStatsValue.push({
    //   //   ...playerArr[0],
    //   //   Points: sortByPoints[sortByPoints?.length - 1],
    //   //   FreeThrowsMade: sortByFreeThrowsMade[sortByFreeThrowsMade?.length - 1],
    //   //   ThreePointersMade:
    //   //     sortByThreePointersMade[sortByFreeThrowsMade?.length - 1],
    //   //   Assists: sortByAssists[sortByAssists?.length - 1],
    //   //   Rebounds: sortByRebounds[sortByRebounds?.length - 1],
    //   //   PersonalFouls: sortByPersonalFouls[sortByPersonalFouls.length - 1],
    //   //   BlockedShots: sortByBlockedShots[sortByBlockedShots.length - 1],
    //   //   Steals: sortBySteals[sortBySteals.length - 1],
    //   // })
    //   // rangeStatsArr.push({
    //   //   ...playerArr[0],
    //   //   Points: sortByPoints[sortByPoints?.length - 1] - sortByPoints[0],
    //   //   FreeThrowsMade:
    //   //     sortByFreeThrowsMade[length - 1] - sortByFreeThrowsMade[0],
    //   //   ThreePointersMade:
    //   //     sortByThreePointersMade[length - 1] - sortByThreePointersMade[0],
    //   //   Assists: sortByAssists[length - 1] - sortByAssists[0],
    //   //   Rebounds: sortByRebounds[length - 1] - sortByRebounds[0],
    //   //   PersonalFouls: sortByPersonalFouls[length - 1] - sortByPersonalFouls[0],
    //   //   BlockedShots: sortByBlockedShots[length - 1] - sortByBlockedShots[0],
    //   //   Steals: sortBySteals[length - 1] - sortBySteals[0],
    //   // })
    // })
    console.log({ data }, " ==== got the data!!!")
    res.status(200).json({ success: true, data: data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

const playerSeasonData = async (req, res) => {
  try {
    const playerSeasonData = await PlayerSeasonModal.find({
      Games: "1",
      SeasonType: { $in: ["1", "3"] },
    })
      .lean()
      .exec()
      .then((docs) => {
        res.status(200).json({ success: true, data: docs })
      })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

function groupPlayersByPlayerID(arrays) {
  const result = []
  const players = {}
  for (const array of arrays) {
    for (const player of array) {
      const playerID = player.PlayerID
      if (!players[playerID]) {
        players[playerID] = []
      }
      players[playerID].push(player)
    }
  }
  for (const playerID in players) {
    result.push(players[playerID])
  }
  return result
}

const seasonMinByPlayer = async (req, res) => {
  try {
    const data = await PlayerGame.find({
      Games: "1",
    })
    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getSeasonGeoMean = async (req, res) => {
  try {
    const docs = await SeasonGeoMean.find({})
    res.status(200).json({ success: true, docs })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getSeasonMin = async (req, res) => {
  try {
    const docs = await SeasonMinimum.find({})
    res.status(200).json({ success: true, docs })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getSeasonMax = async (req, res) => {
  try {
    const docs = await SeasonMaximum.find({})
    res.status(200).json({ success: true, docs })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getSeasonRange = async (req, res) => {
  try {
    const docs = await SeasonRange.find({})
    res.status(200).json({ success: true, docs })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getSeasonMode = async (req, res) => {
  try {
    const docs = await SeasonMode.find({})
    res.status(200).json({ success: true, docs })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getSeasonMedian = async (req, res) => {
  try {
    const docs = await SeasonMedian.find({})
    res.status(200).json({ success: true, docs })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = {
  seasonMedianByPlayer,
  playerSeasonData,
  getSeasonMin,
  getSeasonMax,
  getSeasonMedian,
  getSeasonGeoMean,
  getSeasonRange,
  getSeasonMode
}
