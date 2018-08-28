const schedule      = require('node-schedule');
const pimatic_api   = require("./api/pimatic_api");
const socket        = pimatic_api.socket;
const logger        = require('./logger.js');


function boilerTimer (schemas) {

  logger("Boiler timer is gestart...","yellow");

  for (i in schemas.on) {

    var boilerOn = schedule.scheduleJob(schemas.on[i], function() {
      pimatic_api.callDeviceAction('boiler','boiler','turnOn');
      logger("Boiler ingeschakeld...","yellow");
    });
  }

  for (i in schemas.off) {

    var boilerOff = schedule.scheduleJob(schemas.off[i], function() {
      pimatic_api.callDeviceAction('boiler','boiler','turnOff');
      logger("Boiler uitgeschakeld...","yellow");
    });
  }

}

function greeterCounterReset (schemas,resetCounter, counterA) {

  logger("Greeter reset timer is gestart...","yellow");

  for (i in schemas.goodmorning) {

    var goodmorning = schedule.scheduleJob(schemas.goodmorning[i], function() {
      counterA = resetCounter(counterA);
      logger("Counter gereset...","yellow");
      return counterA;
    });

  }

  return counterA;

}

module.exports = {
  boilerTimer: boilerTimer,
  greeterCounterReset: greeterCounterReset
}
