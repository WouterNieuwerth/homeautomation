const mongoose = require('mongoose')
const options = { promiseLibrary: require('bluebird') }
const ThermostatDevice = require('./schemas.js').ThermostatDevice
const privateStuff = require('../../private/private.js')
var object = {}

var deviceSchema = new mongoose.Schema(ThermostatDevice)

function connect (callback) {
  mongoose.connect(privateStuff.mongoose, options)

  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))

  db.once('open', function () {
    console.log('We\'re connected to the database!')

    var Device = db.model('Device', deviceSchema)

    function find (query, model, callback) {
      if (!query) {
        model.find(function (err, results) {
          if (err) throw err
          callback(err, results)
        })
      } else {
        model.find(query, function (err, results) {
          if (err) throw err
          callback(err, results)
        })
      }
    };

    function add (content, Model, callback) {
      var newDevice = new Model(content)
      newDevice.save(function (err, results) {
        if (err) throw err
        console.log('Device added...')
        callback(err, results)
      })
    };

    function remove (query, model) {
      model.remove(query, function (err, removed) {
        if (err) throw err
        // console.log(removed);
        console.log('Remove executed...')
      })
    };

    object = {
      Device: Device,
      find: find,
      add: add,
      remove: remove
    }

    callback(object)
  })
}

module.exports = {
  connect: connect
}
