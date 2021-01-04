const pimaticApi = require('./api/pimatic_api.js')
const socket = pimaticApi.socket
const notify = require('./home-notifier.js').notify
const logger = require('./logger.js')
const analyticsEvent = require('./analytics.js').analyticsEvent

function deurbel () {
  socket.on('deviceAttributeChanged', function (attrEvent) {
    if (attrEvent.deviceId === 'deurbel') {
      logger('===============================', 'blue')
      try {
        analyticsEvent(attrEvent.attributeName, attrEvent.value, attrEvent.deviceId)
        notify('Er staat iemand voor de deur!', 'nl-NL')
      } catch (error) {
        logger(`ERROR: Er ging iets mis met het versturen van de Analytics hit in contactsensor.js. ${err}`, 'red')
      }
    }
  })
}

module.exports = {
  deurbel: deurbel
}