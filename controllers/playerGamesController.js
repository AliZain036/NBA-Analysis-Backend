const getLastTenGames = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: [] })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

module.exports = { getLastTenGames }
