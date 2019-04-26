const buble = require('buble')
const { isJs } = require('../lib/util')
const debug = require('debug')('hotpack/buble')
module.exports = function ({ omitFiles = [] } = {}) {
  return function (files, { logger }, done) {
    logger.log('run plugin buble')
    for (let file in files) {
      if (!isJs(file)) {
        continue
      }

      if (omitFiles.includes(file)) {
        debug(`omit buble ${file}`)
        continue
      }
      debug(`buble ${file}`)
      const opts = {
        transforms: {
          modules: false
        }
      }
      //如果是服务端的js 8.0以上就可以了
      /* if (isServerJs(file)) {
        opts.target = {
          "node": 8
        }
      } */
      files[file].contents = buble.transform(files[file].contents, opts).code
    }
    done()
  }
}