// ==========
// INIT
// ==========
var express = require('express')
var fs = require('fs')
var CronJob = require('cron').CronJob
var _ = require('underscore')
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
  // data
  if (req.query !== undefined && req.query.limit !== undefined) {
    var limit = parseInt(req.query.limit)
    fs.readFile('./data/players.json', function (err, data) {
      if (err) return console.error('Error when read file', err)
      data = JSON.parse(data)
      var start = data.length - limit
      data = data.slice(start)
      res.json(data)
    })
  } else {
    fs.createReadStream('./data/players.json').pipe(res) // pipe cache file
  }
})
app.get('/max', function (req, res) {
  console.info('[' + new Date() + '] Request max players from ' + req.ip)
  res.setHeader('Content-Type', 'application/json') // is json
  fs.readFile('./data/players.json', function (err, data) {
    if (err) return console.error('Error when read file', err)
    var max = _.max(JSON.parse(data), function (el) {
      return el.count
    })
    // response
    res.json({
      max: max.count
    })
  })
})

// ==========
// LISTEN
// ==========
app.listen(3003, function () {
  console.log('App listen on port 3003')
})
