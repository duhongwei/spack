const buble = require('buble')
const { isJs } = require('../lib/util')
const debug = require('debug')('hotpack/buble')
module.exports = function ({ omitFiles = [], transform = {} } = {}) {
  return function (files, spack, done) {
    spack.logger.log('run plugin buble')
    for (let file in files) {
      if (!isJs(file)) {
        continue
      }
      if (Array.isArray(omitFiles) && omitFiles.includes(file)) {
        debug(`omit buble ${file}`)
        continue
      }
      if (typeof omitFiles == 'function') {
        if (omitFiles(file)) {
          debug(`omit buble ${file}`)
          continue
        }
      }
      debug(`buble ${file}`)
      
      const opts = {
        transforms: Object.assign(transform, {
          modules: false
        })
      }
      
      try {

        files[file].contents = buble.transform(files[file].contents, opts).code
      }
      catch (error) {
        //错误到止为止
        delete files[file]
        spack.logger.fatal(`error when compile ${file}\n ${error.message}`)

        if (spack.env == 'production') {

          process.exit(1)
        }
      }
    }
    done()
  }
}