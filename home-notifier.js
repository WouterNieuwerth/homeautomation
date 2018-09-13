const Client = require('castv2-client').Client
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver
const discoverChromecasts = require('discover-chromecasts')
const googleTTS = require('google-tts-api')
const logger = require('./logger.js')

// Het IP-adres van de Google Home.
// 2aea44fd-db4e-f1ea-85be-dc72b2dc594b.local is de Home.
var address = '192.168.2.5'

// Toont alle gevonden chromecasts in het netwerk.
// To do: address vullen met output van deze functie als input voor notify().
//    daarvoor moet de Home wel een vast adres hebben eerst.
function discover () {
  discoverChromecasts({ timeout: 5000 })
    .then(chromecasts => {
      logger('Deze chromecasts zijn gevonden:', 'yellow')
      chromecasts.forEach(chromecast => {
        logger(JSON.stringify(chromecast))

        // De Google Home zit niet altijd op hetzelfde IP-adres.
        // Het if-statement hieronder regelt dat address overschreven wordt.
        if (chromecast.name === '2aea44fd-db4e-f1ea-85be-dc72b2dc594b.local') {
          logger('Google Home gevonden!', 'yellow')
          address = chromecast.data
        }
      })
    }).catch(err => {
      console.error(err.message)
    })
}

function notify (message, dialect) {
  googleTTS(message, dialect, 1) // Dialecten: nl-NL, en-GB of en-US https://cloud.google.com/speech/docs/languages
    .then(function (url) {
      logger(url, 'yellow')
      var client = new Client()
      client.connect(address, function () {
        client.launch(DefaultMediaReceiver, function (err, player) {
          var media = {
            contentId: url,
            contentType: 'audio/mp3',
            streamType: 'BUFFERED'
          }
          player.load(media, {
            autoplay: true
          }, function (err, status) {
            player.on('status', function (status) {
              if (status.playerState === 'IDLE') {
                player.stop()
                client.close()
              // process.exit(0);
              }
            })
          })
        })
      })
    })
}

module.exports = {
  discover: discover,
  notify: notify
}
