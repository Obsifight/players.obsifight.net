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
  db.query('SELECT count, time FROM players' + (limit ? ' LIMIT ' + limit : ''), function (err, rows, fields) {
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
    res.json({max: rows.count})
  })
})
// Peak hours
// Peak days

// ==========
// LISTEN
// ==========
app.listen(3003, function () {
  console.log('App listen on port 3003')
})
