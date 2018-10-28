const express = require('express')
const app = express()
const address = require('address')
const body = require('body/form')
const path = require('path')
const logger = require('./logger.js')
const timer = require('./timer.js')
const contactsensors = require('./contactsensors.js')
const notify = require('./home-notifier.js').notify
const discoverChromecasts = require('./home-notifier.js').discover
const goodmorning = require('./greeter.js').goodmorning
const pimaticApi = require('./api/pimatic_api.js')
const thermostat = require('./api/thermostat.js').router
const setTemp = require('./api/thermostatRequests.js').setTemp
const returnToSchedule = require('./api/thermostatRequests.js').returnToSchedule
const getAPIKeys = require('./api/thermostat.js').getAPIKeys

// Paar algemene variabelen:
var startPage = '/'

/*
 * Schema voor het in- en uitschakelen van de boiler.
 * unput voor timer.boilerTimer
 *
 * Opties voor schedule:
 * - dayOfWeek: 0-7, 0 en 7 is zondag, 1 maandag, enz.
 * - second:
 * - minute:
 * - hour:
 * - date:
 * - month: 1-12
 * - year:
 */
var boilerSchemas = {
  on: [
    { dayOfWeek: 1, hour: 6, minute: 30 },
    { dayOfWeek: 1, hour: 17, minute: 0 },
    { dayOfWeek: 2, hour: 6, minute: 30 },
    { dayOfWeek: 2, hour: 17, minute: 0 },
    { dayOfWeek: 3, hour: 6, minute: 30 },
    { dayOfWeek: 3, hour: 17, minute: 0 },
    { dayOfWeek: 4, hour: 6, minute: 30 },
    { dayOfWeek: 4, hour: 17, minute: 0 },
    { dayOfWeek: 5, hour: 6, minute: 30 },
    { dayOfWeek: 6, hour: 8, minute: 0 },
    { dayOfWeek: 0, hour: 8, minute: 0 }
  ],
  off: [
    { dayOfWeek: 1, hour: 8, minute: 0 },
    { dayOfWeek: 1, hour: 23, minute: 0 },
    { dayOfWeek: 2, hour: 8, minute: 0 },
    { dayOfWeek: 2, hour: 23, minute: 0 },
    { dayOfWeek: 3, hour: 8, minute: 0 },
    { dayOfWeek: 3, hour: 23, minute: 0 },
    { dayOfWeek: 4, hour: 8, minute: 0 },
    { dayOfWeek: 4, hour: 23, minute: 0 },
    { dayOfWeek: 5, hour: 23, minute: 0 },
    { dayOfWeek: 6, hour: 23, minute: 0 },
    { dayOfWeek: 0, hour: 23, minute: 0 }
  ]
}

// Bij het starten van deze app moeten ook een paar andere
// functies worden uitgevoerd.

// Schakel de timer in die de boiler in- en uitschakelt.
timer.boilerTimer(boilerSchemas)

// Zorg ervoor dat de Google Home bekend is voor de notifier
discoverChromecasts()

// Maak de contactsensors op de deuren actief,
// maar alleen als we niet aan het testen zijn.
// Zo sturen we geen dubbele hits naar Analytics.
address(function (err, addrs) {
  if (err) throw err
  if (addrs.ip === '192.168.2.18') {
    logger('Testomgeving live, geen contactsensors activeren...', 'yellow')
  } else if (addrs.ip === '192.168.2.11') {
    // Activeer de contactsensors:
    contactsensors.contactsensors()
  } else {
    logger('Interne IP-adressen zijn gewijzigd!', 'red')
  }
})

// Schakel de pimatic API in.
pimaticApi.on()

// Enkele instellingen voor Express.js
app.set('view engine', 'pug')
app.set('views', path.resolve(__dirname, 'views'))
app.use('*/static', express.static(path.resolve(__dirname, 'public')))

// De pagina waar het allemaal mee begint:
app.get(startPage, function (req, res) {
  res.render('index', {
    title: 'Home'
  })
})

// Een switch functie dient als lookup voor de pagina die wordt opgevraagd
// binnen /api/. Een request voor /api/ zelf levert geen pagina.
app.get('/api/:action', function (req, res) {
  switch (req.params.action) {
    // IFTTT
    case 'everything':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'toggle')
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'toggle')
      pimaticApi.callDeviceAction('tv-meubel1', 'tv-meubel', 'toggle')
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'toggle')
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'toggle')
      pimaticApi.callDeviceAction('Keuken', 'tradfri_131076', 'toggle')
      pimaticApi.callDeviceAction('Tafel', 'tradfri_131074', 'toggle')
      // notify('Toggled everything.', _.sample(dialects));
      break
    // IFTTT
    case 'on-everything':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'turnOn')
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'turnOn')
      pimaticApi.callDeviceAction('tv-meubel1', 'tv-meubel', 'turnOn')
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'turnOn')
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'turnOn')
      pimaticApi.callDeviceAction('Keuken', 'tradfri_131076', 'turnOn')
      pimaticApi.callDeviceAction('Tafel', 'tradfri_131074', 'turnOn')
      break
    // IFTTT
    case 'off-everything':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'turnOff')
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'turnOff')
      pimaticApi.callDeviceAction('tv-meubel1', 'tv-meubel', 'turnOff')
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'turnOff')
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'turnOff')
      pimaticApi.callDeviceAction('Keuken', 'tradfri_131076', 'turnOff')
      pimaticApi.callDeviceAction('Tafel', 'tradfri_131074', 'turnOff')
      break
    // Web interface
    case 'everything-on':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'turnOn')
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'turnOn')
      pimaticApi.callDeviceAction('tv-meubel1', 'tv-meubel', 'turnOn')
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'turnOn')
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'turnOn')
      pimaticApi.callDeviceAction('Keuken', 'tradfri_131076', 'turnOn')
      pimaticApi.callDeviceAction('Tafel', 'tradfri_131074', 'turnOn')
      // notify('Switched everything on.', _.sample(dialects));
      break
    // Web interface
    case 'everything-off':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'turnOff')
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'turnOff')
      pimaticApi.callDeviceAction('tv-meubel1', 'tv-meubel', 'turnOff')
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'turnOff')
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'turnOff')
      pimaticApi.callDeviceAction('Keuken', 'tradfri_131076', 'turnOff')
      pimaticApi.callDeviceAction('Tafel', 'tradfri_131074', 'turnOff')
      // notify('Switched everything off.', _.sample(dialects));
      break
    // Web interface
    case 'togglelights':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'toggle')
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'toggle')
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'toggle')
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'toggle')
      pimaticApi.callDeviceAction('Keuken', 'tradfri_131076', 'toggle')
      // notify('Toggled the lights.', _.sample(dialects));
      break
    // IFTTT
    case 'the lights':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'toggle')
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'toggle')
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'toggle')
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'toggle')
      pimaticApi.callDeviceAction('Keuken', 'tradfri_131076', 'toggle')
      pimaticApi.callDeviceAction('Tafel', 'tradfri_131074', 'toggle')
      // notify('Toggled the lights.', _.sample(dialects));
      break
    // IFTTT
    case 'on-the lights':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'turnOn')
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'turnOn')
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'turnOn')
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'turnOn')
      pimaticApi.callDeviceAction('Keuken', 'tradfri_131076', 'turnOn')
      pimaticApi.callDeviceAction('Tafel', 'tradfri_131074', 'turnOn')
      break
    // IFTTT
    case 'off-the lights':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'turnOff')
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'turnOff')
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'turnOff')
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'turnOff')
      pimaticApi.callDeviceAction('Keuken', 'tradfri_131076', 'turnOff')
      pimaticApi.callDeviceAction('Tafel', 'tradfri_131074', 'turnOff')
      break
    // Web interface
    case 'lights-on':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'turnOn')
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'turnOn')
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'turnOn')
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'turnOn')
      pimaticApi.callDeviceAction('Keuken', 'tradfri_131076', 'turnOn')
      pimaticApi.callDeviceAction('Tafel', 'tradfri_131074', 'turnOn')
      // notify('Switched the lights on.', _.sample(dialects));
      break
    // Web interface
    case 'lights-off':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'turnOff')
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'turnOff')
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'turnOff')
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'turnOff')
      pimaticApi.callDeviceAction('Keuken', 'tradfri_131076', 'turnOff')
      pimaticApi.callDeviceAction('Tafel', 'tradfri_131074', 'turnOff')
      // notify('Switched the lights off.', _.sample(dialects));
      break
    // Web interface
    case 'toggleledlamp':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'toggle')
      // notify('Toggled the LED light.', _.sample(dialects));
      break
    // Web interface
    case 'ledlamp-on':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'turnOn')
      // notify('Switched the LED light on.', _.sample(dialects));
      break
    // Web interface
    case 'ledlamp-off':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'turnOff')
      // notify('Switched the LED light off.', _.sample(dialects));
      break
    // Web interface
    case 'togglevloerlamp':
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'toggle')
      // notify('Toggled the floor light.', _.sample(dialects));
      break
    // Web interface
    case 'vloerlamp-on':
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'turnOn')
      // notify('Switched the floor light on.', _.sample(dialects));
      break
    // Web interface
    case 'vloerlamp-off':
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'turnOff')
      // notify('Switched the floor light off.', _.sample(dialects));
      break
    // Web interface
    case 'bolletjes-on':
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'turnOn')
      break
    // Web interface
    case 'bolletjes-off':
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'turnOff')
      break
    // Web interface
    case 'kleurtjeslamp-on':
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'turnOn')
      break
    // Web interface
    case 'kleurtjeslamp-off':
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'turnOff')
      break
    // Web interface
    case 'tafel-on':
      pimaticApi.callDeviceAction('Tafel', 'tradfri_131074', 'turnOn')
      break
    // Web interface
    case 'tafel-off':
      pimaticApi.callDeviceAction('Tafel', 'tradfri_131074', 'turnOff')
      break
    // Web interface
    case 'keuken-on':
      pimaticApi.callDeviceAction('Keuken', 'tradfri_131076', 'turnOn')
      break
    // Web interface
    case 'keuken-off':
      pimaticApi.callDeviceAction('Keuken', 'tradfri_131076', 'turnOff')
      break
    // IFTTT
    case 'the TV':
      pimaticApi.callDeviceAction('tv-meubel1', 'tv-meubel', 'toggle')
      // notify('Toggled the TV.', _.sample(dialects));
      break
    // IFTTT
    case 'on-the TV':
      pimaticApi.callDeviceAction('tv-meubel1', 'tv-meubel', 'turnOn')
      break
    // IFTTT
    case 'off-the TV':
      pimaticApi.callDeviceAction('tv-meubel1', 'tv-meubel', 'turnOff')
      break
    // Web interface
    case 'toggletv':
      pimaticApi.callDeviceAction('tv-meubel1', 'tv-meubel', 'toggle')
      // notify('Toggled the TV.', _.sample(dialects));
      break
    // Web interface
    case 'tv-on':
      pimaticApi.callDeviceAction('tv-meubel1', 'tv-meubel', 'turnOn')
      // notify('Switched the TV on.', _.sample(dialects));
      break
    // Web interface
    case 'tv-off':
      pimaticApi.callDeviceAction('tv-meubel1', 'tv-meubel', 'turnOff')
      // notify('Switched the TV off.', _.sample(dialects));
      break
    // IFTTT
    case 'the boiler':
      pimaticApi.callDeviceAction('boiler', 'boiler', 'toggle')
      break
    // IFTTT
    case 'on-the boiler':
      pimaticApi.callDeviceAction('boiler', 'boiler', 'turnOn')
      break
    // IFTTT
    case 'off-the boiler':
      pimaticApi.callDeviceAction('boiler', 'boiler', 'turnOff')
      break
    // Web interface
    case 'boiler-on':
      pimaticApi.callDeviceAction('boiler', 'boiler', 'turnOn')
      break
    // Web interface
    case 'boiler-off':
      pimaticApi.callDeviceAction('boiler', 'boiler', 'turnOff')
      break
    // Web interface
    case 'greet':
      goodmorning(true)
      break
    // IFTTT
    case 'goodnight':
      pimaticApi.callDeviceAction('tv-meubel1', 'tv-meubel', 'turnOff')
      pimaticApi.callDeviceAction('vloerlamp1', 'tradfri_65546', 'turnOff')
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'turnOff')
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'turnOff')
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'turnOff')
      pimaticApi.callDeviceAction('boiler', 'boiler', 'turnOff')
      pimaticApi.callDeviceAction('Keuken', 'tradfri_131076', 'turnOff')
      pimaticApi.callDeviceAction('Tafel', 'tradfri_131074', 'turnOff')
      var APIKeys = getAPIKeys()
      // logger(JSON.stringify(APIKeys.Locations),'red');
      for (var i = 0; i < APIKeys.Locations.length; i++) {
        if (APIKeys.Locations[i].devices[0]) {
          if (APIKeys.Locations[i].devices[0].changeableValues.heatSetpoint !== 16.5) {
            logger('Temperatuur wordt verlaagd', 'green')
            setTemp(16.5, getAPIKeys)
          }
        }
      }
      break
    // IFTTT
    case 'netflix-and-chill':
      pimaticApi.callDeviceAction('led-lamp1', 'led-lamp', 'turnOn')
      pimaticApi.callDeviceAction('vloerlamp-scene-relax', undefined, undefined, { deviceId: 'tradfri_scene_131078', actionName: 'buttonPressed', buttonId: 'tradfri_131078_196624' })
      pimaticApi.callDeviceAction('tv-meubel1', 'tv-meubel', 'turnOn')
      pimaticApi.callDeviceAction('bolletjes', 'elro-1', 'turnOn')
      pimaticApi.callDeviceAction('kleurtjeslamp', 'elro-2', 'turnOn')
      pimaticApi.callDeviceAction('keuken-scene-relax', undefined, undefined, { deviceId: 'tradfri_scene_131076', actionName: 'buttonPressed', buttonId: 'tradfri_131076_196618' })
      pimaticApi.callDeviceAction('tafel-scene-relax', undefined, undefined, { deviceId: 'tradfri_scene_131074', actionName: 'buttonPressed', buttonId: 'tradfri_131074_196612' })
      break
    // Web interface
    case 'returntoschedule':
      returnToSchedule(getAPIKeys)
      break
    default:
      logger("Couldn't find: " + req.params.action, 'red')
  }

  /* res.render('index', {
    title: 'Home',
  }); */

  res.redirect(startPage)
})

app.get('/notifier', function (req, res) {
  res.render('notifier', {
    title: 'Notifier'
  })
})
app.post('/notifier', function (req, res) {
  logger('POST received...', 'yellow')

  body(req, res, function (err, post) {
    if (err) logger('There was an error: ' + err, 'red')
    logger(post.message, 'yellow')

    notify(post.message, post.dialect)

    res.render('notifier', {
      title: 'Notifier'
    })
  })
})

app.use('/thermostat', thermostat)

app.use(function (req, res, next) {
  res.status(404).render('404', {
    title: '404'
  })
})

// Make a server.
// Testen op poort 3456, live op poort 2345.

address(function (err, addrs) {
  if (err) throw err
  logger(`This device has the following addresses: IP: ${addrs.ip}, IPv6: ${addrs.ipv6}, MAC: ${addrs.mac}`, 'blue')

  var port = 3456
  if (addrs.ip === '192.168.2.18') {
    port = 3456
  } else if (addrs.ip === '192.168.2.11') {
    port = 2345
  } else {
    logger('Interne IP-adressen zijn gewijzigd!', 'red')
  }

  app.listen(port, function () {
    logger('Listening on port ' + port + '...', 'blue')
  })
})
