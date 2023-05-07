const { getSchedule } = require("../controllers/scheduleController")

const scheduleRouter = require("express").Router()

scheduleRouter.get("/:season", getSchedule)

module.exports = scheduleRouter
