const http = require('http')
const uuid = require('uuid/v4')
const logger = require('./logger.js')

const cid = uuid()

function analyticsEvent (category, action, label) {

  var hit = 'http://www.google-analytics.com/collect?v=1&t=event&tid=UA-2182368-7&cid=' + cid +
    '&ec=' + category +
    '&ea=' + action +
    '&el=' + label

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
  analyticsEvent: analyticsEvent
}