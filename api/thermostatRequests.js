const https = require('https')
const logger = require('../logger.js')

function getToken (authCode, postData, callback) {
  const options = {
    hostname: 'api.honeywell.com',
    // port: 433,
    path: '/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': authCode,
      'Accept': 'application/json'
    }
  }

  const req = https.request(options, (res) => {
    // logger(`STATUS: ${res.statusCode}`);
    // logger(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8')
    res.on('data', (chunk) => {
      // logger(`BODY: ${chunk}`);
      callback(chunk)
    })
    res.on('end', () => {
      logger('No more data in response', 'yellow')
    })
  })

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`)
  })

  // Write data to request body
  // req.write(postData);
  req.end(postData)
}

function refreshToken (getAPIKeys, callback) {
  var APIKeys = getAPIKeys()

  var postData = 'grant_type=refresh_token&refresh_token=' + APIKeys.Tokens.refresh_token

  const options = {
    hostname: 'api.honeywell.com',
    // port: 433,
    path: '/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + APIKeys.Base64authorizationCode,
      'Accept': '/'
    }
  }

  const req = https.request(options, (res) => {
    res.setEncoding('utf8')
    res.on('data', (chunk) => {
      callback(undefined, chunk)
    })
    res.on('end', () => {
      logger('No more data in response', 'yellow')
    })
  })

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`)
    callback(e, undefined)
  })

  // Write data to request body
  // req.write(postData);
  req.end(postData)
}

function getLocations (getAPIKeys, callback) {
  var APIKeys = getAPIKeys()

  logger(`ACCESS TOKEN getLocations: ${APIKeys.Tokens.access_token}`, 'yellow')

  const options = {
    hostname: 'api.honeywell.com',
    // port: 433,
    path: '/v2/locations?apikey=' + APIKeys.apiKey,
    method: 'GET',
    headers: {
      // 'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + APIKeys.Tokens.access_token,
      'Accept': '/'
    }
  }

  const req = https.request(options, (res) => {
    // logger(`STATUS: ${res.statusCode}`);
    // logger(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8')
    res.on('data', (chunk) => {
      // logger(`BODY: ${chunk}`);
      callback(chunk)
    })
    res.on('end', () => {
      logger('No more data in response', 'yellow')
    })
  })

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`)
  })

  req.end()
}

function getDevice (getAPIKeys, callback) {
  var APIKeys = getAPIKeys()

  logger(`ACCESS TOKEN getDevice: ${APIKeys.Tokens.access_token}`, 'yellow')

  const options = {
    hostname: 'api.honeywell.com',
    // port: 433,
    path: '/v2/devices/thermostats/' + APIKeys.DeviceId + '?apikey=' + APIKeys.apiKey + '&locationId=' + APIKeys.LocationId,
    method: 'GET',
    headers: {
      // 'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + APIKeys.Tokens.access_token,
      'Accept': '/'
    }
  }

  const req = https.request(options, (res) => {
    // logger(`STATUS: ${res.statusCode}`);
    // logger(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8')
    res.on('data', (chunk) => {
      // logger(`BODY: ${chunk}`);
      try {
        callback(chunk)
      }
      catch (error) {
        logger(`ERROR: Er ging iets mis met de callback in getDevice. ${error}`, 'red')
        notifyThermostatOffline()
      }
    })
    res.on('end', () => {
      logger('No more data in response', 'yellow')
    })
  })

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`)
  })

  req.end()
}

function setTemperature (getAPIKeys, postData, callback) {
  var APIKeys = getAPIKeys()

  if (APIKeys.Tokens === undefined) {
    logger('No tokens, you need to log in to the thermostat first.', 'red')
    return
  }

  const options = {
    hostname: 'api.honeywell.com',
    // port: 433,
    path: '/v2/devices/thermostats/' + APIKeys.DeviceId + '?apikey=' + APIKeys.apiKey + '&locationId=' + APIKeys.LocationId,
    method: 'POST',
    headers: {
      // 'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + APIKeys.Tokens.access_token,
      'Accept': '/',
      'Content-Type': 'application/json'
    }
  }

  const req = https.request(options, (res) => {
    // logger(`STATUS: ${res.statusCode}`);
    // logger(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8')
    res.on('data', (chunk) => {
      // logger(`BODY: ${chunk}`);
      callback(chunk)
    })
    res.on('end', () => {
      logger('No more data in response', 'yellow')
      var resultaat = 'Callback uitgevoerd...'
      callback(resultaat)
    })
  })

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`)
  })

  // Write data to request body
  // req.write(postData);
  req.end(postData)
}

function setTemp (temp, getAPIKeys) {
  var postData = JSON.stringify({
    'mode': 'Heat',
    'heatSetpoint': temp,
    'coolSetpoint': 22,
    'thermostatSetpointStatus': 'TemporaryHold'
  })
  setTemperature(getAPIKeys, postData, function (result) {
    logger(`RESULT: ${JSON.stringify(result)}`, 'yellow')
  })
}

function returnToSchedule (getAPIKeys) {
  var postData = JSON.stringify({
    'mode': 'Heat',
    'heatSetpoint': 16.5,
    'coolSetpoint': 22,
    'thermostatSetpointStatus': 'NoHold'
  })
  setTemperature(getAPIKeys, postData, function (result) {
    logger(`RESULT: ${JSON.stringify(result)}`, 'yellow')
  })
}

function getThermostat (getAPIKeys, callback) {
  try {
    getDevice(getAPIKeys, function (result) {
      try {
        var resultToLog = JSON.parse(result)
        if (resultToLog.indoorTemperature) {
          logger(`RESULT getThermostat: ${resultToLog.indoorTemperature}`, 'yellow')
        }
        callback(result)
      }
      catch (error) {
        logger(`RESULT getThermostat: ${result}`, 'yellow')
        logger(`ERROR: Er ging iets mis met getDevice. ${error}`, 'red')
      }
    })
  }
  catch (error) {
    logger(`ERROR: Er ging iets mis met getDevice. ${error}`, 'red')
    notifyThermostatOffline()
  }
}

function notifyThermostatOffline () {
  https.get('https://maker.ifttt.com/trigger/thermostat_offline/with/key/geSO7F_NG7xhlCEc_kzmO4PWBJebB75rZ2s1aNEK9jf', (res) => {
    logger(`statusCode: ${res.statusCode}`, 'green')
    logger(`headers:' ${res.headers}`, 'green')

    res.on('data', (d) => {
      logger(d, 'green')
    })

    res.on('end', () => {
      logger('Alle data ontvangen en get-request succesvol uitgevoerd.', 'green')
    })
  }).on('error', (e) => {
    console.error(e)
  })
}

module.exports = {
  getToken: getToken,
  refreshToken: refreshToken,
  getLocations: getLocations,
  getDevice: getDevice,
  setTemperature: setTemperature,
  setTemp: setTemp,
  returnToSchedule: returnToSchedule,
  getThermostat: getThermostat,
  notifyThermostatOffline: notifyThermostatOffline
}
