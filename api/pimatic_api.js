const io      = require("socket.io-client");
const logger  = require('../logger.js');
const private = require('../../private/private.js');

const host = "192.168.2.11";
const port = 8080;
const u = encodeURIComponent(private.pimatic_user);
const p = encodeURIComponent(private.pimatic_ww);
var socket = io("http://" + host + ":" + port + "/?username=" + u + "&password=" + p, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 3000,
  timeout: 20000,
  forceNew: true
});

function on () {
  socket.on('connect', function() {
    logger("connected","green");
  });

  socket.on('event', function(data) {
    logger(`event: ${JSON.stringify(data)}`,"green");
  });

  socket.on('disconnect', function(data) {
    logger("disconnected","green");
  });

  socket.on('devices', function(devices) {
    logger(`devices: ${JSON.stringify(devices)}`,"green");
  });

  socket.on('rules', function(rules) {
    logger(`rules: ${JSON.stringify(rules)}`,"green");
  });

  socket.on('variables', function(variables) {
    logger(`variables: ${JSON.stringify(variables)}`,"green");
  });

  socket.on('pages', function(pages) {
    logger(`pages: ${JSON.stringify(pages)}`,"green");
  });

  socket.on('groups', function(groups) {
    logger(`groups: ${JSON.stringify(groups)}`,"green");
  });

  socket.on('deviceAttributeChanged', function(attrEvent) {
    if (attrEvent.deviceId != "smartmeter2" &&
    attrEvent.deviceId != "show_actual_electricity" &&
    attrEvent.deviceId != "show_total_gas" &&
    attrEvent.deviceId != "show_total_electricity") {
      logger(`deviceAttributeChanged: ${JSON.stringify(attrEvent)}`,"green");
    }
  });
}

function callDeviceAction (id, device, action) {

  socket.emit('call', {
    id: id,
    action: 'callDeviceAction',
    params: {
      deviceId: device,
      actionName: action
    }
  });

  socket.on(id, function(msg) {
    if (msg.id === id) {
      logger(`callDeviceAction: ${JSON.stringify(result)}`,"green");
    }
  });

}

module.exports = {
  socket: socket,
  on: on,
  callDeviceAction: callDeviceAction
}
