const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const https = require('https')
const mongoose = require('mongoose')

const Schedule = require('./models/commonModels')

// const commonRoutes = require('./routes/commonRoutes')

require('dotenv').config()

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
// app.use(bodyParser.json())
app.use(express.json())

app.use(cors())
// app.use('/common', commonRoutes)

// connect mongodb server

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connection successful'))
  .catch((err) => console.error(err))

app.get('/', (req, res) => {
  https.get(
    'https://api.sportsdata.io/api/nba/fantasy/json/Players',
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

app.get('/PlayerSeasonStats/:season', (req, res) => {
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

app.get('/schedules/:season', async (req, res, next) => {
  const season = req.params.season
  https.get(
    `https://api.sportsdata.io/api/nba/odds/json/Games/${season}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': '5f32177ca5c549979aee86c4d2376c14',
      },
    },
    async (response) => {
      let data = ''
      response.on('data', (chunk) => {
        data += chunk
      })
      response.on('end', async () => {
        console.log(data[0]);
        Schedule.create(data[0][0])
          .then((res) => console.log('successfull'))
          .catch((err) => console.error(err.name))
        // console.log({ response })
        res.send(data)
        next()
      })
    },
  )
})

app.get('/GameOddsLineMovement/:gameid', (req, res) => {
  const gameid = req.params.gameid
  https.get(
    `https://api.sportsdata.io/api/nba/odds/json/GameOddsLineMovement/
${gameid}`,
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

app.get('/PlayerGameStatsByDate/:date', (req, res) => {
  const date = req.params.date
  https.get(
    `https://api.sportsdata.io/api/nba/fantasy/json/PlayerGameStatsByDate/${date}`,
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

app.listen(8080, () => {
  console.log('CORS-enabled web server listening on port 8080')
})
