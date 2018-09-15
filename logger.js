const chalk = require('chalk')
const moment = require('moment')

function logger (message, color) {
  if (!color) {
    console.log(chalk.cyan(moment().format('YYYY-MM-DD HH:mm:ss (dddd): ')) + message)
  } else {
    switch (color) {
      case 'red':
        console.log(chalk.cyan(moment().format('YYYY-MM-DD HH:mm:ss (dddd): ')) + chalk.red(message))
        break
      case 'yellow':
        console.log(chalk.cyan(moment().format('YYYY-MM-DD HH:mm:ss (dddd): ')) + chalk.yellow(message))
        break
      case 'green':
        console.log(chalk.cyan(moment().format('YYYY-MM-DD HH:mm:ss (dddd): ')) + chalk.green(message))
        break
      case 'blue':
        console.log(chalk.cyan(moment().format('YYYY-MM-DD HH:mm:ss (dddd): ')) + chalk.blue(message))
        break
      default:
        console.log(chalk.cyan(moment().format('YYYY-MM-DD HH:mm:ss (dddd): ')) + message)
    }
  }
}

module.exports = logger
