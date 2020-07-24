const pimaticApi = require('./api/pimatic_api.js')
const socket = pimaticApi.socket
const http = require('http')
const uuid = require('uuid/v4')
const notify = require('./home-notifier.js').notify
const logger = require('./logger.js')

function deurbel () {
  socket.on('deviceAttributeChanged', function (attrEvent) {
    if (attrEvent.deviceId === 'deurbel') {
      logger('===============================', 'blue')
      try {
        analyticsHit(attrEvent)
        notify('Er staat iemand voor de deur!', 'en-AU')
      } catch (error) {
        logger(`ERROR: Er ging iets mis met het versturen van de Analytics hit in contactsensor.js. ${err}`, 'red')
      }
    }
  })
}

function analyticsHit (attrEvent) {
  var cid = uuid()
  var hit = 'http://www.google-analytics.com/collect?v=1&t=event&tid=UA-2182368-7&cid=' + cid +
  '&ec=' + attrEvent.attributeName +
  '&ea=' + attrEvent.value +
  '&el=' + attrEvent.deviceId

  logger(hit, 'blue')

  http.get(hit, (res) => {
    // console.log(res);
    const { statusCode } = res
    var error
    if (statusCode !== 200) {
      error = 'Request Failed.\n' +
        `Status Code: ${statusCode}`
    }
    if (error) {
      logger(error, 'red')
      res.resume()
    }
  })
}

module.exports = {
  deurbel: deurbel
}