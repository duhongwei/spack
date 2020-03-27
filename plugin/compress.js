const compress = require('../lib/compress.js')
module.exports = function (opts) {

  return function (files, { logger }, done) {
    logger.log('run plugin compress')
    for (let file in files) {

      files[file].contents = compress(file, files[file].contents, opts)
  }
  done()
}
}