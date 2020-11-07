const Gpio = require('onoff').Gpio
const express = require('express')
const router = express.Router()
const logger = require('../logger.js')

let pin_up, pin_down

if (Gpio.accessible) {
  pin_up = new Gpio(26, 'out')
  pin_down = new Gpio(13, 'out')
} else {
  pin_up = {
    write: value => {
      console.log('virtual shutter up now uses value: ' + value)
    }
  }
  pin_down = {
    write: value => {
      console.log('virtual shutter down now uses value: ' + value)
    }
  }
}

const delay = 100

router.get('/somfy_up', function (req, res) {
  move_shutters('up')
  res.redirect('/')
})

router.get('/somfy_down', function (req, res) {
  move_shutters('down')
  res.redirect('/')
})

function move_shutters (direction) {
  if (direction === 'up') {
    up(1)
    setTimeout(up, delay, 0)
    logger('Shutters going up...', 'green')
  } else if (direction === 'down') {
    down(1)
    setTimeout(down, delay, 0)
    logger('Shutters going down...', 'green')
  }
}

function up (s) {
  pin_up.write(s)
}

function down (s) {
  pin_down.write(s)
}

module.exports = {
  router: router,
  move_shutters: move_shutters
}
