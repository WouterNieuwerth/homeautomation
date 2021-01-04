const pimaticApi = require('./api/pimatic_api.js')
const socket = pimaticApi.socket
const goodmorning = require('./greeter.js').goodmorning
const logger = require('./logger.js')
const analyticsEvent = require('./analytics.js').analyticsEvent

function contactsensors () {
  socket.on('deviceAttributeChanged', function (attrEvent) {
    if (attrEvent.attributeName === 'contact') {
      logger('===============================', 'blue')
      try {
        analyticsEvent(attrEvent.attributeName, attrEvent.value, attrEvent.deviceId)
        goodmorning(false)
      } catch (error) {
        logger(`ERROR: Er ging iets mis met het versturen van de Analytics hit in contactsensor.js. ${err}`, 'red')
      }
    }
  })
}

module.exports = {
  contactsensors: contactsensors
}
