// ==========
// INIT
// ==========
var express = require('express')
var fs = require('fs')
var CronJob = require('cron').CronJob
var app = express()

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
  require('./api/getData')('149.202.201.146', '4545')
}, null, true, 'Europe/Paris')

// ==========
// GET DATA
// ==========
app.get('/data', function (req, res) {
  console.info('[' + new Date() + '] Request players.json from ' + req.ip)
  res.setHeader('Content-Type', 'application/json') // is json
  fs.createReadStream('./data/players.json').pipe(res) // pipe cache file
})

// ==========
// LISTEN
// ==========
app.listen(3003, function () {
  console.log('App listen on port 3003')
})