const schedule = require('node-schedule')
const pimaticApi = require('./api/pimatic_api')
const logger = require('./logger.js')

function boilerTimer (schemas) {
  logger('Boiler timer is gestart...', 'yellow')

  for (var i in schemas.on) {
    schedule.scheduleJob(schemas.on[i], function () {
      pimaticApi.callDeviceAction('boiler', 'boiler', 'turnOn')
      logger('Boiler ingeschakeld...', 'yellow')
    })
  }

  for (i in schemas.off) {
    schedule.scheduleJob(schemas.off[i], function () {
      pimaticApi.callDeviceAction('boiler', 'boiler', 'turnOff')
      logger('Boiler uitgeschakeld...', 'yellow')
    })
  }
}

function greeterCounterReset (schemas, resetCounter, counterA) {
  logger('Greeter reset timer is gestart...', 'yellow')

  for (var i in schemas.goodmorning) {
    schedule.scheduleJob(schemas.goodmorning[i], function () {
      counterA = resetCounter(counterA)
      logger('Counter gereset...', 'yellow')
      return counterA
    })
  }

  return counterA
}

module.exports = {
  boilerTimer: boilerTimer,
  greeterCounterReset: greeterCounterReset
}
