const request = require('request')
const privateStuff = require('../../private/private.js')
const logger = require('../logger.js')

let apiKey = privateStuff.weatherApiKey
let locationId = 2759887

function current (callback) {
  let url = `http://api.openweathermap.org/data/2.5/weather?id=${locationId}&units=metric&appid=${apiKey}`

  request(url, function (err, response, body) {
    if (err) {
      logger(`error: ${err}`, 'red')
    } else {
      try {
        let weather = JSON.parse(body)
        let message = `It's ${weather.main.temp} degrees in ${weather.name}!`
        logger(message, 'white')
        callback(err, weather)
      } catch (err) {
        logger(`error met current(): ${err}`, 'red')
      }
    }
  })
}

function forecast (callback) {
  let url = `http://api.openweathermap.org/data/2.5/weather?id=${locationId}&units=metric&appid=${apiKey}`

  request(url, function (err, response, body) {
    if (err) {
      console.log('error:', err)
    } else {
      try {
        let weather = JSON.parse(body)
        callback(err, weather)
      } catch (err) {
        logger(`error met forecast(): ${err}`, 'red')
      }
    }
  })
}

module.exports = {
  current: current,
  forecast: forecast
}
