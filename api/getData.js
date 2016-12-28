var mcping = require('mc-ping-updated')

module.exports = function (ip, port, db) {
  port = port || 25565
  console.info('-- Ping ' + ip + ':' + port + ' --')

  mcping(ip, port, function (err, res) {
    if (err) return console.error('Error when ping', err)
    // save
    var players = res.players.online
    db.query("INSERT INTO players SET `count` = ?, `time` = ?", [players, Date.now()], function (err, rows, fields) {
      if (err) return console.error('Error when save into db', err)
    })
  })
}
