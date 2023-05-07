const getSchedule = async (req, res) => {
  try {
    const season = req.params.season
    https.get(
      `https://api.sportsdata.io/api/nba/odds/json/Games/${season}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": process.env.OCP_APIM_SUBSCRIPTION_KEY,
        },
      },
      async (response) => {
        let data = ""
        response.on("data", (chunk) => {
          data += chunk
        })
        response.on("end", async () => {
          
        })
      }
    )
    res.status(200).json({ success: true, season })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

module.exports = { getSchedule }
