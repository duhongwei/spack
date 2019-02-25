
const replace = require('../lib/envify')
const debug=require('debug')('hotpack/envify')
module.exports = function () {
  return function (files, { logger }) {
    logger.log('run plugin envify')
    for (let file in files) {
      debug(`convert ${file}`)
      files[file].contents = replace(files[file].contents, [process.env])
    }

  }
}