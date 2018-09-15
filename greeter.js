const greeterCounterReset = require('./timer').greeterCounterReset
const notify = require('./home-notifier.js').notify
const moment = require('moment')
const _ = require('lodash')
const weather = require('./api/weather.js')
const logger = require('./logger.js')

// Bij het opstarten van de app moet de teller op 0 gezet worden
var counter = 0
logger('De greeter app is gestart en de counter is nu: ' + counter, 'yellow')

/*
 * Opties voor schedule:
 * - dayOfWeek: 0-7, 0 en 7 is zondag, 1 maandag, enz.
 * - second:
 * - minute:
 * - hour:
 * - date:
 * - month: 1-12
 * - year:
 */
const schemas = {
  goodmorning: [
    { dayOfWeek: 1, hour: 4, minute: 0 },
    { dayOfWeek: 2, hour: 4, minute: 0 },
    { dayOfWeek: 3, hour: 4, minute: 0 },
    { dayOfWeek: 4, hour: 4, minute: 0 },
    { dayOfWeek: 5, hour: 4, minute: 0 },
    { dayOfWeek: 6, hour: 4, minute: 0 },
    { dayOfWeek: 7, hour: 4, minute: 0 }
  ]
}

counter = greeterCounterReset(schemas, resetCounter, counter)

function goodmorning (testMode) {
  var daysToVerjaardagLisan = daysUntil(5, 15)
  var daysToVerjaardagWouter = daysUntil(10, 30)
  weather.current(function (err, currentWeather) {
    if (err) throw err

    if (moment().format('HH') < 12 || testMode) {
      logger('Goodmorning greet wordt uitgevoerd...', 'yellow')
      // console.log(counter);
      if (counter === 0 || testMode) {
        const greets = [
          'Good morning!',
          'Good day!',
          'Good morning and have a great day!',
          'Good morning, how are you today?',
          'Good morning, did you sleep okay?',
          'Hello! Have a great day!',
          'Wow, you look fantastic today!',
          'Good morning! I\'m sure this will be a great day!',
          'Wow, it\'s only ' + moment().format('HH:mm') + ' and you\'re already up?!',
          'Good morning! The time is ' + moment().format('HH:mm'),
          'Good day! The time is ' + moment().format('HH:mm'),
          'Good day! Today will be great!',
          'Hello! Today is ' + moment().format('dddd') + ', my favourite day of the week!',
          'Good morning! Wow, is it ' + moment().format('MMMM Qo') + ' already? Time flies!',
          'Hello! Today is the ' + moment().format('DDDo') + ' day of the year.',
          'Hi! Did you know it\'s only ' + daysToVerjaardagLisan + ' until Lisan her birthday?',
          'Hi! Did you know it\'s only ' + daysToVerjaardagWouter + ' until Wouter his birthday?',
          'Hi! How wonderfull to see you this morning. I\'m sure this will be a great day.',
          'Hey you! Yes, you! I\'m trying to say something nice to you, but you\'re not even paying attention. How rude!',
          'My goodness! You look incredible today. And I\'m not just saying that because Wouter programmed me to do so.',
          'Wouter asked me to say good morning to you. So here it is: good morning.',
          'Hi! I wanted to tell you I\'ve been listening to a band called Paper Motion and they\'re fantastic. You should really check them out if you can!',
          'Wow, have you been running or going to the gym or something lately? Keep up the good work!',
          'Good morning! I hope Wouter didn\'t steal your blankets again this night? So anoying, right?',
          'Good morning! Do you want some breakfast? I saw some food in the fridge earlier. And while you\'re at it, can you make me a sandwich too, please?',
          'Hi! I\'m hungry. What will it be for breakfast today? A sandwitch with appelstroop? Or some cereals perhaps?',
          'Hello. My name is Google. I\'m the household computer that runs all the stuff here. If you have any questions for me, please ask!',
          'Hey it\'s ' + moment().format('HH:mm') + ' already. Shouldn\'t you get some breakfast now?!',
          'I want to be an astronaut. Do you think I can do it?',
          'Good morning. It\'s currently ' + currentWeather.main.temp + ' degrees and ' + currentWeather.weather[0].description + ' in ' + currentWeather.name + '.',
          'Congratulations! According to my sensors, you\'re the first to reach the living room today! You could say that you\'re already in a winning mood.'
        ]
        const dialects = ['en-AU', 'en-CA', 'en-GH', 'en-GB', 'en-IN', 'en-IE', 'en-KE', 'en-NZ', 'en-NG', 'en-PH', 'en-ZA', 'en-TZ', 'en-US']
        notify(_.sample(greets), _.sample(dialects))
        counter++
        // return counter;
      } else {
        logger('Counter is niet 0, dus geen goedemorgen nodig', 'yellow')
      }
    } else {
      logger('Het is na 12-en, geen \'good morning\' nodig.', 'yellow')
    }
  })
}

function resetCounter () {
  counter = 0
  logger('De counter reset function is uitgevoerd en de waarde van counter is nu: ' + counter, 'yellow')
}

function daysUntil (month, day) {
  month = month - 1
  var year = Number(moment().format('YYYY'))
  if (moment() > moment([year, month, day])) {
    // Dag is dit jaar al geweest, daarom aftellen tot volgend jaar.
    year++
    return moment([year, month, day]).fromNow(true)
  } else {
    // Dag is dit jaar nog niet geweest. We kunnen gewoon aftellen.
    return moment([year, month, day]).fromNow(true)
  }
}

module.exports = {
  goodmorning: goodmorning,
  resetCounter: resetCounter,
  daysUntil: daysUntil
}
