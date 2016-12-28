var mcping = require('mc-ping-updated')
var fs = require('fs')
var file = './data/players.json'

module.exports = function (ip, port) {
  port = port || 25565
  console.info('-- Ping ' + ip + ':' + port + ' --')

  mcping(ip, port, function (err, res) {
    if (err) return console.error('Error when ping', err)
    // save
    var players = res.players.online
    // read file
    fs.readFile(file, function (err, data) {
      if (err) return console.error('Error when read file', err)
      // parse json
      data = JSON.parse(data)
      // push into json
      var result = {}
      result[Date.now()] = players
      data.push(result)
      // write in file
      fs.writeFile(file, JSON.stringify(data), function (err) {
        if (err) return console.error('Error when write file', err)
      })
    })
  }, 3000)
}
