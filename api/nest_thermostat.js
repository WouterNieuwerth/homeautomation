/* eslint-disable camelcase */
const https = require('https')
const logger = require('../logger.js')
const express = require('express')
const router = express.Router()
const body = require('body/form')
const secrets = require('../../private/private.js')

const login_url = 'https://nestservices.google.com/partnerconnections/' + secrets.nest_project_id + '/auth?redirect_uri=' + secrets.nest_redirect_uri + '&access_type=offline&prompt=consent&client_id=' + secrets.nest_client_id + '&response_type=code&scope=https://www.googleapis.com/auth/sdm.service'
var code, access_token, refresh_token, device_0_name

router.get('/', function (req, res) {
  res.render('nest_thermostat', {
    title: 'Thermostaat',
    login_url: login_url,
    access_token: access_token
  })
})

router.get('/code', function (req, res) {
  code = req.query.code
  logger(`Nest API code: ${code}`, 'green')
  const post_data = JSON.stringify({
    client_id: secrets.nest_client_id,
    client_secret: secrets.nest_client_secret,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: secrets.nest_redirect_uri
  })
  get_token(post_data, function (token) {
    logger(`Nest API tokens: ${token}`, 'green')
    token = JSON.parse(token)
    access_token = token.access_token
    refresh_token = token.refresh_token
    const post_data = JSON.stringify({
      client_id: secrets.nest_client_id,
      client_secret: secrets.nest_client_secret,
      refresh_token: refresh_token,
      grant_type: 'refresh_token'
    })
    setInterval(get_token, 30000, post_data, function(response) {
      access_token = JSON.parse(response).access_token
      logger(`Nest API access token refreshed: ${access_token}`,'green')
    })
    res.redirect('/thermostat/getdevices')
  })
})

router.get('/refresh', function (req, res) {
  const post_data = JSON.stringify({
    client_id: secrets.nest_client_id,
    client_secret: secrets.nest_client_secret,
    refresh_token: refresh_token,
    grant_type: 'refresh_token'
  })
  get_token(post_data, function (response) {
    logger(`Nest API response: ${response}`, 'green')
    response = JSON.parse(response)
    access_token = response.access_token
    res.redirect('/thermostat')
  })
})

router.get('/getdevices', function (req, res) {
  get_devices(function (devices) {
    logger(`Nest API devices: ${devices}`, 'green')
    devices = JSON.parse(devices)
    device_0_name = devices.devices[0].name
    res.redirect('/thermostat')
  })
})

router.get('/getdevice0', function (req, res) {
  get_device_0(function (device_0) {
    logger(`Nest API device_0: ${device_0}`, 'green')
    device_0 = JSON.parse(device_0)
    res.redirect('/thermostat')
  })
})

router.post('/settemperature', function (req, res) {
  body(req, res, function (err, post) {
    if (err) logger('There was an error: ' + err, 'red')
    logger (`POST ontvangen: ${JSON.stringify(post)}`, 'yellow')
    const post_data = JSON.stringify({
      command: 'sdm.devices.commands.ThermostatTemperatureSetpoint.SetHeat',
      params: {heatCelsius: Number(post.temperature)} 
    })
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + access_token,
    }
    logger(`POST data: ${post_data}`,'blue')
    set_temperature (post_data, headers, function (response) {
      logger (`set_temperature response: ${response}`, 'green')
      res.redirect('/thermostat')
    })
  })
})

function get_token (post_data, callback) {
  const hostname = 'www.googleapis.com'
  const path = '/oauth2/v4/token'
  post (post_data, hostname, path, undefined, callback)
}

function get_devices (callback) {
  const hostname = 'smartdevicemanagement.googleapis.com'
  const path = '/v1/enterprises/' + secrets.nest_project_id + '/devices'
  get (hostname, path, callback)
}

function get_device_0 (callback) {
  const hostname = 'smartdevicemanagement.googleapis.com'
  const path = '/v1/' + device_0_name
  get (hostname, path, callback)
}

function set_temperature (post_data, headers, callback) {
  const hostname = 'smartdevicemanagement.googleapis.com'
  const path = '/v1/' + device_0_name + ':executeCommand'
  post (post_data, hostname, path, headers, callback)
}

function expose_nest_tokens () {
  return {
    access_token: access_token
  }
}

function post (post_data, hostname, path, headers=undefined, callback) {
  let options
  if (typeof headers === 'undefined') {
    options = {
      hostname: hostname,
      path: path,
      method: 'POST'
    }
  } else {
    options = {
      hostname: hostname,
      path: path,
      method: 'POST',
      headers: headers
    }
  }
  try {
    const req = https.request(options, (res) => {
      let data
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        if (typeof data === 'undefined') {
          data = chunk
        } else {
          data += chunk
        }
      })
      res.on('end', () => {
        callback(data)
        logger('No more data in response', 'yellow')
      })
    })
    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`)
    })
    req.end(post_data)
  } catch (error) {
    logger(error, 'red')
  }
}

function get (hostname, path, callback) {
  const options = {
    hostname: hostname,
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    }
  }
  try {
    const req = https.request(options, (res) => {
      let data
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        if (typeof data === 'undefined') {
          data = chunk
        } else {
          data += chunk
        }
      })
      res.on('end', () => {
        callback(data)
        logger('No more data in response', 'yellow')
      })
    })
    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`)
    })
    req.end()
  } catch (error) {
    logger(error, 'red')
  }
}

module.exports = {
  router: router,
  expose_nest_tokens: expose_nest_tokens,
  set_temperature: set_temperature
}