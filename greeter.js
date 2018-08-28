const greeterCounterReset = require('./timer').greeterCounterReset;
const notify              = require('./home-notifier.js').notify;
const moment              = require('moment');
const _                   = require('lodash');
const logger              = require('./logger.js');

//Bij het opstarten van de app moet de teller op 0 gezet worden
var counter = 0;
logger("De greeter app is gestart en de counter is nu: " + counter,"yellow");


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
    {dayOfWeek: 1, hour: 04, minute: 00},
    {dayOfWeek: 2, hour: 04, minute: 00},
    {dayOfWeek: 3, hour: 04, minute: 00},
    {dayOfWeek: 4, hour: 04, minute: 00},
    {dayOfWeek: 5, hour: 04, minute: 00},
    {dayOfWeek: 6, hour: 04, minute: 00},
    {dayOfWeek: 7, hour: 04, minute: 00}
  ]
};

counter = greeterCounterReset(schemas, resetCounter, counter);

function goodmorning (testMode) {

  var daysToVerjaardagLisan = daysUntil(05,15);
  var daysToVerjaardagWouter = daysUntil(10,30);

  if (moment().format('HH') < 12 || testMode) {
    logger("Goodmorning greet wordt uitgevoerd...","yellow");
    //console.log(counter);
    if (counter === 0 || testMode) {
      const greets = [
        "Good morning!",
        "Good day!",
        "Good morning and have a great day!",
        "Good morning, how are you today?",
        "Good morning, did you sleep okay?",
        "Hello! Have a great day!",
        "Wow, you look fantastic today!",
        "Good morning! I'm sure this will be a great day!",
        "Wow, it's only " + moment().format('HH:mm') + " and you're already up?!",
        "Good morning! The time is " + moment().format('HH:mm'),
        "Good day! The time is " + moment().format('HH:mm'),
        "Good day! Today will be great!",
        "Hello! Today is " + moment().format('dddd') + ", my favourite day of the week!",
        "Good morning! Wow, is it " + moment().format('MMMM Qo') + " already? Time flies!",
        "Hello! Today is the " + moment().format('DDDo') + " day of the year.",
        "Hi! Did you know it's only " + daysToVerjaardagLisan + " until Lisan her birthday?",
        "Hi! Did you know it's only " + daysToVerjaardagWouter + " until Wouter his birthday?"
      ];
      const dialects = ["en-AU","en-CA","en-GH","en-GB","en-IN","en-IE","en-KE","en-NZ","en-NG","en-PH","en-ZA","en-TZ","en-US"];
      notify(_.sample(greets), _.sample(dialects));
      counter++
      //return counter;
    } else {
      logger("Counter is niet 0, dus geen goedemorgen nodig","yellow");
    }
  } else {
    logger("Het is na 12-en, geen 'good morning' nodig.","yellow");
  }
}

function resetCounter () {
  counter = 0;
  logger("De counter reset function is uitgevoerd en de waarde van counter is nu: " + counter,"yellow");
}

function daysUntil (month, day) {
  month = month-1;
  var year = Number(moment().format('YYYY'));
  if (moment() > moment([year,month,day])) {
    //Dag is dit jaar al geweest, daarom aftellen tot volgend jaar.
    year++;
    return moment([year,month,day]).fromNow(true);
  } else {
    //Dag is dit jaar nog niet geweest. We kunnen gewoon aftellen.
    return moment([year,month,day]).fromNow(true);
  }
}

module.exports = {
  goodmorning: goodmorning,
  resetCounter: resetCounter,
  daysUntil: daysUntil
}
