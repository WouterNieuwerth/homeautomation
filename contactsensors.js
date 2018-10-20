const pimaticApi = require('./api/pimatic_api.js')
const socket = pimaticApi.socket
const http = require('http')
const uuid = require('uuid/v4')
const goodmorning = require('./greeter.js').goodmorning
const logger = require('./logger.js')

function contactsensors () {
  socket.on('deviceAttributeChanged', function (attrEvent) {
    if (attrEvent.attributeName === 'contact') {
      logger('===============================', 'blue')
      analyticsHit(attrEvent)
      goodmorning(false)
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
  contactsensors: contactsensors
}
