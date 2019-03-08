
const { extname } = require('path')
const {isMin}=require('../lib/util')
const debug = require('debug')('hotpack/compress')
module.exports = function () {
  let jsProvider = require('uglify-es')
  let cssProvider = require('clean-css')
  return function (files, { logger }, done) {
    logger.log('run plugin compress')
    for (let file in files) {
      let result = ''
      if (isMin(file)) {
        continue
      }
      switch (extname(file)) {
        case '.js':
          debug(`compress ${file}`)
          result = jsProvider.minify(files[file].contents)
          if (!result.code) {
            throw result.error 
          }
          files[file].contents = result.code
          break;
        case '.css':
          debug(`compress ${file}`)
          //todo record error
          result = new cssProvider({ compatibility: 'ie9' }).minify(files[file].contents)
          files[file].contents = result.styles
          break
        default:
          break
      }
    }
    done()
  }
}