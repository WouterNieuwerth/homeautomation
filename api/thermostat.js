const express = require('express')
const router = express.Router()
const Base64 = require('js-base64').Base64
const body = require('body/form')
const address = require('address')
const publicIp = require('public-ip')
const getToken = require('./thermostatRequests.js').getToken
const getLocations = require('./thermostatRequests.js').getLocations
const refreshToken = require('./thermostatRequests.js').refreshToken
const getDevice = require('./thermostatRequests.js').getDevice
const getThermostat = require('./thermostatRequests.js').getThermostat
const setTemperature = require('./thermostatRequests.js').setTemperature
const notifyThermostatOffline = require('./thermostatRequests').notifyThermostatOffline
const db = require('../db/database.js')
const logger = require('../logger.js')
const privateStuff = require('../../private/private.js')
const weather = require('./weather.js')

var apiKey, secret, redirectUri
var authorizationCode, url

publicIp.v4().then(ip => {
  logger(`Public IP address: ${ip}`, 'green')

  address(function (err, addrs) {
    if (err) throw err
    if (addrs.ip === '192.168.2.18') {
      // DEV
      apiKey = privateStuff.honeywell_apiKey_test
      secret = privateStuff.honeywell_secret_test
      redirectUri = 'http://' + ip + ':3456/thermostat/code'
    } else if (addrs.ip === '192.168.2.17') {
      // LIVE
      apiKey = privateStuff.honeywell_apiKey_live
      secret = privateStuff.honeywell_secret_live
      redirectUri = 'http://' + ip + ':2345/thermostat/code'
    } else {
      logger('Interne IP-adressen zijn gewijzigd!', 'red')
    }

    authorizationCode = Base64.encode(apiKey + ':' + secret)
    url = 'https://api.honeywell.com/oauth2/authorize?response_type=code&redirect_uri=' + redirectUri + '&client_id=' + apiKey
  })
})

var Tokens
var Locations, LocationId, DeviceId, ThermostatDevice // 559728, LCC-00D02DEBB14D

router.get('/', function (req, res) {
  weather.current(function (err, currentWeather) {
    if (err) throw err
    res.render('thermostat', {
      title: 'Thermostaat',
      locations: Locations,
      thermostat: ThermostatDevice,
      currentWeather: currentWeather
    })
  })
})

router.get('/login', function (req, res) {
  if (Tokens !== undefined) {
    logger(Tokens, 'yellow')
  } else {
    res.redirect(url)
  }
})

router.get('/code', function (req, res) {
  if (req.query.code) {
    logger('Aangekomen op /code en we hebben een code!', 'yellow')
    logger(req.query.code, 'yellow')
    var postData = 'grant_type=authorization_code&code=' + req.query.code + '&redirect_uri=' + redirectUri
    getToken(authorizationCode, postData, function (tokens) {
      logger(tokens, 'yellow')
      try {
        Tokens = JSON.parse(tokens)
        res.redirect('/thermostat/locations')
      } catch (err) {
        logger(`ERROR: Er ging iets mis bij Honeywell. ${err}`, 'red')
        notifyThermostatOffline()
        res.redirect('/thermostat')
      }
    })
  } else {
    logger('Aangekomen op /code, maar zonder code', 'red')
    res.render('thermostat', {
      title: 'Thermostaat',
      locations: Locations,
      thermostat: ThermostatDevice
    })
  }
})

router.get('/locations', function (req, res) {
  if (Tokens !== undefined && apiKey !== undefined) {
    getLocations(getAPIKeys, function (locations) {
      logger(`LOCATIONS: ${locations}`, 'yellow')
      Locations = JSON.parse(locations)

      for (var i = 0; i < Locations.length; i++) {
        LocationId = Locations[i].locationID
        logger(`LocationId: ${LocationId}`, 'yellow')
        if (Locations[i].devices[0]) {
          logger('Deze locatie heeft een device!', 'green')
          if (!Locations[i].devices[0].deviceID) {
            logger('You did not select a device! Please repeat step 1 and select a device!', 'red')

            res.redirect('/thermostat')
          } else {
            DeviceId = Locations[i].devices[0].deviceID
            logger(`DeviceId: ${DeviceId}`, 'yellow')

            res.redirect('/thermostat')
            return
          }
        } else {
          logger('Deze locatie heeft geen device!', 'red')
        }
      }

      // Als we hier aankomen zonder dat er een device is gevonden kunnen
      // we ook niet inloggen op de thermostaat.
      logger('Er is geen device beschikbaar!', 'red')
      res.redirect('/thermostat')
    })
  } else {
    logger('Aangekomen op /locations, maar Tokens en/of apiKey ontbreken. Daarom /thermostat renderen.', 'red')
    res.render('thermostat', {
      title: 'Thermostaat',
      locations: Locations
    })
  }
})

router.get('/device', function (req, res) {
  if (Tokens !== undefined && apiKey !== undefined) {
    getDevice(getAPIKeys, function (device) {
      logger(`Device: ${device}`, 'yellow')

      res.redirect('/thermostat')
    })
  } else {
    logger('Aangekomen op /device, maar Tokens en/of apiKey ontbreken. Daarom /thermostat renderen.', 'red')
    res.render('thermostat', {
      title: 'Thermostaat',
      locations: Locations
    })
  }
})

router.post('/settemperature', function (req, res) {
  if (Tokens !== undefined && apiKey !== undefined) {
    body(req, res, function (err, post) {
      if (err) logger('There was an error: ' + err, 'red')
      logger(`POST ontvangen: ${JSON.stringify(post)}`, 'yellow')

      // post.temperature
      var postData = JSON.stringify({
        'mode': 'Heat',
        'heatSetpoint': post.temperature,
        'coolSetpoint': post.temperature,
        'thermostatSetpointStatus': 'TemporaryHold'
      })

      setTemperature(getAPIKeys, postData, function (result) {
        logger(`RESULT setTemperature: ${JSON.stringify(result)}`, 'yellow')

        res.redirect('/thermostat')
      })
    })
  } else {
    logger('Temperatuur ingediend bij de API, maar Tokens en/of apiKey ontbreken. Daarom /thermostat renderen', 'red')
    res.render('thermostat', {
      title: 'Thermostaat',
      locations: Locations
    })
  }
})

router.get('/refresh', function (req, res) {
  if (Tokens !== undefined && apiKey !== undefined) {
    refreshToken(getAPIKeys, function (err, tokens) {
      if (err) {
        logger(`ERROR met refreshToken: ${err.message}`, 'red')
        res.redirect('/thermostat')
      } else {
        logger(`Refreshed tokens: ${tokens}`, 'green')
        Tokens = tokens

        res.redirect('/thermostat')
      }
    })
  } else {
    logger('Aangekomen op /refresh, maar Tokens en/of apiKey ontbreken. Daarom /thermostat renderen.', 'red')
    res.render('thermostat', {
      title: 'Thermostaat',
      locations: Locations
    })
  }
})

router.get('/flush', function (req, res) {
  Tokens = flush(Tokens)
  Locations = flush(Locations)
  LocationId = flush(LocationId)
  DeviceId = flush(DeviceId)
  ThermostatDevice = flush(ThermostatDevice)
  logger('Alle variabelen geflusht...', 'red')
  logger(`ThermostatDevice: ${ThermostatDevice}`, 'red')
  res.redirect('/thermostat')
})

function getAPIKeys () {
  var Base64authorizationCode = Base64.encode(apiKey + ':' + secret)
  var newTokens
  if (typeof Tokens === 'object') {
    newTokens = Tokens
  } else if (typeof Tokens === 'string') {
    try {
      newTokens = JSON.parse(Tokens)
    } catch (error) {
      logger(`ERROR: Er ging iets mis met JSON.parse(). ${err}`, 'red')
    }
  } else {
    logger('GEEN STRING OF OBJECT', 'red')
  }

  var obj = {
    apiKey: apiKey,
    Tokens: newTokens,
    Locations: Locations,
    LocationId: LocationId,
    DeviceId: DeviceId,
    Base64authorizationCode: Base64authorizationCode
  }
  return obj
};

function flush (keys) {
  keys = undefined
  return keys
}

db.connect(function (database) {
  function interval1 (keys) {
    if (Tokens !== undefined && apiKey !== undefined) {
      refreshToken(keys, function (err, tokens) {
        if (err) {
          logger(`ERROR met refreshToken: ${err.message}`, 'red')
        } else {
          logger(`Refreshed tokens: ${tokens}`, 'green')
          Tokens = tokens

          try {
            getThermostat(keys, function (json) {
              var object = JSON.parse(json)
              if (object.changeableValues !== undefined && object.indoorTemperature !== undefined && object.outdoorTemperature !== undefined) {
                database.add(object, database.Device, function (err, Device) {
                  if (err) logger(`Database: ERROR: ${err}`, 'red')
                  // logger(`Database: Device added --> ${Device}`,'green');
                  ThermostatDevice = Device
                }) // Closing database.add
              } else {
                // Als we hier terechtkomen is de thermostaat niet meer ingelogd. Hier sturen we een melding van naar m'n mobiel.
                notifyThermostatOffline()
              }; // Closing if-else-statement
            }) // Closing getThermostat
          } catch (err) {
            logger(`ERROR: Er ging iets mis bij Honeywell. ${err}`, 'red')
            notifyThermostatOffline()
          }
        } // Closing else
      }) // Closing refreshToken
    }
  }

  setInterval(interval1, 300000, getAPIKeys)

  router.get('/thermostatgraphs', function (req, res) {
    database.Device.find({}, 'timestamp indoorTemperature outdoorTemperature changeableValues.heatSetpoint').lean().sort('-timestamp').limit(1000).exec(function (err, results) {
      if (err) logger(`ERROR: ${err}`, 'red')

      var data = []
      for (var i in results) {
        var row = [
          new Date(results[i].timestamp),
          results[i].indoorTemperature,
          results[i].outdoorTemperature,
          results[i].changeableValues.heatSetpoint
        ]
        data.push(row)
      }

      res.render('thermostatgraphs', {
        title: 'Grafieken',
        stats: data
      })
    })
  })

  router.post('/thermostatgraphs', function (req, res) {
    body(req, res, function (err, post) {
      if (err) logger('There was an error: ' + err, 'red')
      logger(`POST ontvangen: ${JSON.stringify(post)}`, 'yellow')

      database.Device.find({}, 'timestamp indoorTemperature outdoorTemperature changeableValues.heatSetpoint').lean().sort('-timestamp').limit(Number(post.limit)).exec(function (err, results) {
        if (err) logger(`ERROR: ${err}`, 'red')

        var data = []
        for (var i in results) {
          var row = [
            new Date(results[i].timestamp),
            results[i].indoorTemperature,
            results[i].outdoorTemperature,
            results[i].changeableValues.heatSetpoint
          ]
          data.push(row)
        }

        res.render('thermostatgraphs', {
          title: 'Grafieken',
          stats: data
        })
      })
    })
  })
})

module.exports = {
  router: router,
  apiKey: apiKey,
  Tokens: Tokens,
  getAPIKeys: getAPIKeys,
  flush: flush
}
