
const debug = require('debug')('hotpack/version')
const { isHtml, isText,isLess } = require('../lib/util')
module.exports = function () {
  return function (files, { version, logger }) {
    logger.log('run plugin version')

    for (let file in files) {
      if (isHtml(file)) {
        continue
      }
      if (isText(file) && files[file].contents.trim() === '') {
        logger.fatal(`${file} is empty`)
        process.exit(1)
      }
      
      if (version.update(file, files[file].contents)) {
        debug(`${file} updated`)
      }
      else {
        debug(`rm file ${file}`)
        delete files[file]
      }
    }
  }
}