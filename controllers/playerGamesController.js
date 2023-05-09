const https = require("https")

const getLastTenGames = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: [] })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

const getTodaysGames = async (req, res) => {
  try {
    const date = new Date().getDate()
    const month = new Date().getMonth() + 1
    const year = new Date().getFullYear()
    https.get(
      `https://api.sportsdata.io/api/nba/odds/json/GamesByDate/${
        year + "-" + month + "-" + date
      }`,
      {
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
        },
      },
      (response) => {
        let data = ""
        response.on("data", (chunk) => {
          data += chunk
        })
        response.on("end", () => {
          res.send(JSON.stringify(data))
        })
      }
    )
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getLastTenGames, getTodaysGames }
