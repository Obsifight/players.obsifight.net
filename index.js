// ==========
// INIT
// ==========
var express = require('express')
var CronJob = require('cron').CronJob
var app = express()
global.config = require('./config/config')
global.db = require('./api/db')(config.db)

// ==========
// HOMEPAGE
// ==========
app.get('/', function (req, res) {
  return res.json({
    name: 'obsiapi-playersping',
    version: require('fs').readFileSync('./VERSION').toString().trim(),
    author: 'Eywek',
    environement: (process.env.NODE_ENV === 'production') ? 'production' : 'development'
  })
})

// ===========
// UPDATE DATA
// ===========
new CronJob('0 */1 * * * *', function () { // Every minutes
  require('./api/getData')(config.mc.ip, config.mc.port, db)
}, null, true, 'Europe/Paris')

// ==========
// GET DATA
// ==========
app.get('/data', function (req, res) {
  // init
  console.info('[' + new Date() + '] Request players.json from ' + req.ip)
  res.setHeader('Content-Type', 'application/json') // is json
  // limit
  if (req.query !== undefined && req.query.limit !== undefined)
    var limit = parseInt(req.query.limit)
  // query
  db.query('SELECT count, time FROM players' + (limit ? ' LIMIT ' + limit : '') + ' ORDER BY id DESC', function (err, rows, fields) {
    if (err || rows === undefined || rows.length === 0) {
      if (err) console.error(err)
      return res.json([])
    }
    var result = []
    for (var i = 0; i < rows.length; i++) {
      result.push({
        count: rows[i].count,
        time: (new Date(rows[i].time)).getTime()
      })
    }
    res.json(result)
  })
})
// Max players
app.get('/max', function (req, res) {
  console.info('[' + new Date() + '] Request max players from ' + req.ip)
  res.setHeader('Content-Type', 'application/json') // is json
  // query
  db.query('SELECT count FROM players ORDER BY count DESC LIMIT 1', function (err, rows, fields) {
    if (err || rows === undefined || rows.length === 0) {
      if (err) console.error(err)
      return res.json({max: 0})
    }
    res.json({max: rows[0].count})
  })
})
// Peak times - hours
app.get('/stats/peak-times/hours', function (req, res) {
  console.info('[' + new Date() + '] Request peak times hours from ' + req.ip)
  res.setHeader('Content-Type', 'application/json') // is json
  // query
  db.query('SELECT HOUR(time) AS `hour`, AVG(count) AS `average_players` ' +
    'FROM players ' +
    'GROUP BY HOUR(time) ' +
    'ORDER BY AVG(count) DESC ' +
    'LIMIT 5',
  function (err, rows, fields) {
    if (err || rows === undefined || rows.length === 0) {
      if (err) console.error(err)
      return res.json([])
    }
    // formatting
    var data = {}
    for (var i = 0; i < rows.length; i++) {
      data[rows[i].hour] = rows[i].average_players.toFixed()
    }
    res.json(data)
  })
})
// Peak times - days
app.get('/stats/peak-times/days', function (req, res) {
  console.info('[' + new Date() + '] Request peak times days from ' + req.ip)
  res.setHeader('Content-Type', 'application/json') // is json
  // query
  db.query('SELECT WEEKDAY(time) AS `day`, AVG(count) AS `average_players`, time ' +
    'FROM players ' +
    'GROUP BY WEEKDAY(time) ' +
    'ORDER BY AVG(count) DESC ' +
    'LIMIT 5',
  function (err, rows, fields) {
    if (err || rows === undefined || rows.length === 0) {
      if (err) console.error(err)
      return res.json([])
    }
    // formatting
    var data = {}
    var day
    for (var i = 0; i < rows.length; i++) {
      day = (new Date(rows[i].time)).getDay()
      switch (day) {
        case 0:
          day = 'Dimanche'
          break
        case 1:
          day = 'Lundi'
          break
        case 2:
          day = 'Mardi'
          break
        case 3:
          day = 'Mercredi'
          break
        case 4:
          day = 'Jeudi'
          break
        case 5:
          day = 'Vendredi'
          break
        case 6:
          day = 'Samedi'
          break
        default:
          break
      }
      data[day] = rows[i].average_players.toFixed()
    }
    res.json(data)
  })
})

// ==========
// LISTEN
// ==========
app.listen(3003, function () {
  console.log('App listen on port 3003')
})
