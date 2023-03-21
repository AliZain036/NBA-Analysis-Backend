const express = require('express');

const router = express.Router()

router.get('/playerSeasonStats', (req, res, next) => {
  const season = req.params.season
  https.get(
    `https://api.sportsdata.io/api/nba/fantasy/json/PlayerSeasonStats/${season}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': '5f32177ca5c549979aee86c4d2376c14',
      },
    },
    (response) => {
      let data = ''
      response.on('data', (chunk) => {
        data += chunk
      })
      response.on('end', () => {
        res.send(data)
      })
    },
  )
})
