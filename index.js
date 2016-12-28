// ==========
// INIT
// ==========
var express = require('express')
var CronJob = require('cron').CronJob
var app = express()
var global.config = require('./config/config')
var global.db = require('./api/db')(config.db)

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
  console.info('[' + new Date() + '] Request players.json from ' + req.ip)
  res.setHeader('Content-Type', 'application/json') // is json
})
// Max players
app.get('/max', function (req, res) {
  console.info('[' + new Date() + '] Request max players from ' + req.ip)
  res.setHeader('Content-Type', 'application/json') // is json
})
// Peak hours
// Peak days

// ==========
// LISTEN
// ==========
app.listen(3003, function () {
  console.log('App listen on port 3003')
})
