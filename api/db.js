var mysql = require('mysql')
module.exports = function (config) {
  var connection = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    connectionLimit: 10
  })
  return connection
}
