const express             = require("express");
const app                 = express();
const address             = require('address');
const _                   = require('lodash');
const body                = require('body/form');
const logger              = require('./logger.js');
const timer               = require('./timer.js');
const contactsensors      = require('./contactsensors.js');
const notify              = require('./home-notifier.js').notify;
const discoverChromecasts = require('./home-notifier.js').discover;
const goodmorning         = require('./greeter.js').goodmorning;
const pimatic_api         = require("./api/pimatic_api.js");
const thermostat          = require('./api/thermostat.js').router;
const setTemp             = require('./api/thermostatRequests.js').setTemp;
const returnToSchedule    = require('./api/thermostatRequests.js').returnToSchedule;
const getAPIKeys          = require('./api/thermostat.js').getAPIKeys;

//Paar algemene variabelen:
const socket = pimatic_api.socket;
const dialects = ["en-AU","en-CA","en-GH","en-GB","en-IN","en-IE","en-KE","en-NZ","en-NG","en-PH","en-ZA","en-TZ","en-US"];
var startPage = "/"

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
    {dayOfWeek: 1, hour: 06, minute: 30},
    {dayOfWeek: 1, hour: 17, minute: 00},
    {dayOfWeek: 2, hour: 06, minute: 30},
    {dayOfWeek: 2, hour: 17, minute: 00},
    {dayOfWeek: 3, hour: 06, minute: 30},
    {dayOfWeek: 3, hour: 17, minute: 00},
    {dayOfWeek: 4, hour: 06, minute: 30},
    {dayOfWeek: 4, hour: 17, minute: 00},
    {dayOfWeek: 5, hour: 06, minute: 30},
    {dayOfWeek: 6, hour: 08, minute: 00},
    {dayOfWeek: 7, hour: 08, minute: 00}
  ],
  off: [
    {dayOfWeek: 1, hour: 08, minute: 00},
    {dayOfWeek: 1, hour: 23, minute: 00},
    {dayOfWeek: 2, hour: 08, minute: 00},
    {dayOfWeek: 2, hour: 23, minute: 00},
    {dayOfWeek: 3, hour: 08, minute: 00},
    {dayOfWeek: 3, hour: 23, minute: 00},
    {dayOfWeek: 4, hour: 08, minute: 00},
    {dayOfWeek: 4, hour: 23, minute: 00},
    {dayOfWeek: 5, hour: 23, minute: 00},
    {dayOfWeek: 6, hour: 23, minute: 00},
    {dayOfWeek: 7, hour: 23, minute: 00}
  ]
};

//Bij het starten van deze app moeten ook een paar andere
//functies worden uitgevoerd.

//Schakel de timer in die de boiler in- en uitschakelt.
timer.boilerTimer(boilerSchemas);

//Zorg ervoor dat de Google Home bekend is voor de notifier
discoverChromecasts();

//Maak de contactsensors op de deuren actief,
//maar alleen als we niet aan het testen zijn.
//Zo sturen we geen dubbele hits naar Analytics.
address(function (err, addrs) {
  if (addrs.ip == '192.168.2.18') {
    logger('Testomgeving live, geen contactsensors activeren...','yellow');
  } else if(addrs.ip == '192.168.2.11') {
    //Activeer de contactsensors:
    contactsensors.contactsensors();
  } else {
    logger('Interne IP-adressen zijn gewijzigd!', 'red');
  }
});

//Schakel de pimatic API in.
pimatic_api.on();

//Enkele instellingen voor Express.js
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('*/static', express.static(__dirname + '/public'));

//De pagina waar het allemaal mee begint:
app.get(startPage, function (req, res) {
  res.render('index', {
    title: 'Home',
  })
});

//Een switch functie dient als lookup voor de pagina die wordt opgevraagd
//binnen /api/. Een request voor /api/ zelf levert geen pagina.
app.get('/api/:action', function (req, res) {
  switch (req.params.action) {
    case 'everything':
      pimatic_api.callDeviceAction('led-lamp1','led-lamp','toggle');
      pimatic_api.callDeviceAction('vloerlamp1','vloerlamp','toggle');
      pimatic_api.callDeviceAction('tv-meubel1','tv-meubel','toggle');
      pimatic_api.callDeviceAction('bolletjes','elro-1','toggle');
      pimatic_api.callDeviceAction('kleurtjeslamp','elro-2','toggle');
      //notify('Toggled everything.', _.sample(dialects));
      break;
    case 'everything-on':
      pimatic_api.callDeviceAction('led-lamp1','led-lamp','turnOn');
      pimatic_api.callDeviceAction('vloerlamp1','vloerlamp','turnOn');
      pimatic_api.callDeviceAction('tv-meubel1','tv-meubel','turnOn');
      pimatic_api.callDeviceAction('bolletjes','elro-1','turnOn');
      pimatic_api.callDeviceAction('kleurtjeslamp','elro-2','turnOn');
      //notify('Switched everything on.', _.sample(dialects));
      break;
    case 'everything-off':
      pimatic_api.callDeviceAction('led-lamp1','led-lamp','turnOff');
      pimatic_api.callDeviceAction('vloerlamp1','vloerlamp','turnOff');
      pimatic_api.callDeviceAction('tv-meubel1','tv-meubel','turnOff');
      pimatic_api.callDeviceAction('bolletjes','elro-1','turnOff');
      pimatic_api.callDeviceAction('kleurtjeslamp','elro-2','turnOff');
      //notify('Switched everything off.', _.sample(dialects));
      break;
    case 'togglelights':
      pimatic_api.callDeviceAction('led-lamp1','led-lamp','toggle');
      pimatic_api.callDeviceAction('vloerlamp1','vloerlamp','toggle');
      pimatic_api.callDeviceAction('bolletjes','elro-1','toggle');
      pimatic_api.callDeviceAction('kleurtjeslamp','elro-2','turnOn');
      //notify('Toggled the lights.', _.sample(dialects));
      break;
    case 'the lights':
      pimatic_api.callDeviceAction('led-lamp1','led-lamp','toggle');
      pimatic_api.callDeviceAction('vloerlamp1','vloerlamp','toggle');
      pimatic_api.callDeviceAction('bolletjes','elro-1','toggle');
      pimatic_api.callDeviceAction('kleurtjeslamp','elro-2','toggle');
      //notify('Toggled the lights.', _.sample(dialects));
      break;
    case 'lights-on':
      pimatic_api.callDeviceAction('led-lamp1','led-lamp','turnOn');
      pimatic_api.callDeviceAction('vloerlamp1','vloerlamp','turnOn');
      pimatic_api.callDeviceAction('bolletjes','elro-1','turnOn');
      pimatic_api.callDeviceAction('kleurtjeslamp','elro-2','turnOn');
      //notify('Switched the lights on.', _.sample(dialects));
      break;
    case 'lights-off':
      pimatic_api.callDeviceAction('led-lamp1','led-lamp','turnOff');
      pimatic_api.callDeviceAction('vloerlamp1','vloerlamp','turnOff');
      pimatic_api.callDeviceAction('bolletjes','elro-1','turnOff');
      pimatic_api.callDeviceAction('kleurtjeslamp','elro-2','turnOff');
      //notify('Switched the lights off.', _.sample(dialects));
      break;
    case 'toggleledlamp':
      pimatic_api.callDeviceAction('led-lamp1','led-lamp','toggle');
      //notify('Toggled the LED light.', _.sample(dialects));
      break;
    case 'ledlamp-on':
      pimatic_api.callDeviceAction('led-lamp1','led-lamp','turnOn');
      //notify('Switched the LED light on.', _.sample(dialects));
      break;
    case 'ledlamp-off':
      pimatic_api.callDeviceAction('led-lamp1','led-lamp','turnOff');
      //notify('Switched the LED light off.', _.sample(dialects));
      break;
    case 'togglevloerlamp':
      pimatic_api.callDeviceAction('vloerlamp1','vloerlamp','toggle');
      //notify('Toggled the floor light.', _.sample(dialects));
      break;
    case 'vloerlamp-on':
      pimatic_api.callDeviceAction('vloerlamp1','vloerlamp','turnOn');
      //notify('Switched the floor light on.', _.sample(dialects));
      break;
    case 'vloerlamp-off':
      pimatic_api.callDeviceAction('vloerlamp1','vloerlamp','turnOff');
      //notify('Switched the floor light off.', _.sample(dialects));
      break;
    case 'bolletjes-on':
      pimatic_api.callDeviceAction('bolletjes','elro-1','turnOn');
      break;
    case 'bolletjes-off':
      pimatic_api.callDeviceAction('bolletjes','elro-1','turnOff');
      break;
    case 'kleurtjeslamp-on':
      pimatic_api.callDeviceAction('kleurtjeslamp','elro-2','turnOn');
      break;
    case 'kleurtjeslamp-off':
      pimatic_api.callDeviceAction('kleurtjeslamp','elro-2','turnOff');
      break;
    case 'the TV':
      pimatic_api.callDeviceAction('tv-meubel1','tv-meubel','toggle');
      //notify('Toggled the TV.', _.sample(dialects));
      break;
    case 'toggletv':
      pimatic_api.callDeviceAction('tv-meubel1','tv-meubel','toggle');
      //notify('Toggled the TV.', _.sample(dialects));
      break;
    case 'tv-on':
      pimatic_api.callDeviceAction('tv-meubel1','tv-meubel','turnOn');
      //notify('Switched the TV on.', _.sample(dialects));
      break;
    case 'tv-off':
      pimatic_api.callDeviceAction('tv-meubel1','tv-meubel','turnOff');
      //notify('Switched the TV off.', _.sample(dialects));
      break;
    case 'the boiler':
      pimatic_api.callDeviceAction('boiler','boiler','toggle');
      break;
    case 'boiler-on':
      pimatic_api.callDeviceAction('boiler','boiler','turnOn');
      break;
    case 'boiler-off':
      pimatic_api.callDeviceAction('boiler','boiler','turnOff');
      break;
    case 'greet':
      goodmorning(true);
      break;
    case 'goodnight':
      pimatic_api.callDeviceAction('tv-meubel1','tv-meubel','turnOff');
      pimatic_api.callDeviceAction('vloerlamp1','vloerlamp','turnOff');
      pimatic_api.callDeviceAction('led-lamp1','led-lamp','turnOff');
      pimatic_api.callDeviceAction('bolletjes','elro-1','turnOff');
      pimatic_api.callDeviceAction('kleurtjeslamp','elro-2','turnOff');
      pimatic_api.callDeviceAction('boiler','boiler','turnOff');
      var APIKeys = getAPIKeys();
      //logger(JSON.stringify(APIKeys.Locations),'red');
      for(i=0; i<APIKeys.Locations.length; i++) {
        if(APIKeys.Locations[i].devices[0]){
          if (APIKeys.Locations[i].devices[0].changeableValues.heatSetpoint != 16.5) {
            logger('Temperatuur wordt verlaagd','green');
            setTemp(16.5, getAPIKeys);
          }
        }
      }

      break;
    case 'returntoschedule':
      returnToSchedule(getAPIKeys);
      break;
    default:
      logger("Couldn't find: " + req.params.action,"red");

  }

  /*res.render('index', {
    title: 'Home',
  });*/

  res.redirect(startPage);
});

app.get('/notifier', function (req, res) {
  res.render('notifier', {
    title: 'Notifier',
  })
});
app.post('/notifier', function (req, res) {
  logger("POST received...","yellow");

  body(req, res, function(err,post) {
    if (err) logger("There was an error: " + err,"red");
    logger(post.message,'yellow');

    notify(post.message, post.dialect);

    res.render('notifier', {
      title: 'Notifier',
    })
  })
});

app.use('/thermostat', thermostat);

app.use(function (req, res, next) {
  res.status(404).render('404', {
    title: '404'
  })
});

//Make a server.
//Testen op poort 3456, live op poort 2345.

address(function (err, addrs) {
  logger(`This device has the following addresses: IP: ${addrs.ip}, IPv6: ${addrs.ipv6}, MAC: ${addrs.mac}`,'blue');

  var port = 3456;
  if (addrs.ip == '192.168.2.18') {
    port = 3456;
  } else if(addrs.ip == '192.168.2.11') {
    port = 2345;
  } else {
    logger('Interne IP-adressen zijn gewijzigd!', 'red');
  }

  app.listen(port, function() {
    logger("Listening on port " + port + "...","blue");
  });
});
