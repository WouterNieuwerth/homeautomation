const db = require('./database.js')
const logger = require('../logger.js')

db.connect(function (database) {
  // logger(`db --------> ${JSON.stringify(database)}`,'red');

  database.remove({ indoorTemperature: undefined }, database.Device)

  /* database.add({indoorTemperature: 12345},database.Device,function(err,Device) {
    if (err) logger(`Database: ERROR: ${err}`,'red');
    logger(`Database: Device added --> ${Device}`,'green');
  }); */
  database.Device.count(function (err, count) {
    logger(`COUNT: ${count}`, 'green')
  })

  database.Device.find({}, 'timestamp indoorTemperature outdoorTemperature changeableValues.heatSetpoint').lean().exec(function (err, results) {
    if (err) logger(`ERROR: ${err}`, 'red')
    for (var i in results) {
      logger(JSON.stringify(results[i]), 'red')
    }
    // logger(results,'blue');
    // logger(typeof results,'green');
  })

/*
  database.find({},database.Device,function(err,results){
    if(err) throw err;
    logger(results,'red');
    //logger(`RESULTS: ${results}`,'red');
  }); */
})
