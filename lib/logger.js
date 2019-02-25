const chalk = require('chalk')

module.exports = class {
  constructor(opts = {}) {
    this.detail = opts.detail || 0
    this.prefix = ' spack.'
  }
  info(msg) {
    
    console.log(chalk.yellow(`\n${msg}\n`))
  }
  log(msg, detail = 0) {
    if (detail < this.detail) {
      return
    }
    if (detail > 0 && this.detail <= 0) {
      console.log()
    }
    if (detail === 0) {
      msg = '  ' + msg
    }
    console.log(chalk.blue(this.prefix + 'info'), msg)
  }
  fatal(msg) {
    console.log()
    console.log(chalk.red(this.prefix + 'fatal'), msg)
    console.log()
  }
  silent() {
    this.detail = -1
  }
  success(msg) {
    if (this.detail < 0) {
      return
    }
    console.log()
    console.log(chalk.yellow(this.prefix + 'success'), msg)
    console.log()
  }
}