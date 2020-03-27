let jsProvider = require('uglify-es')
let cssProvider = require('clean-css')
const { isMin } = require('../lib/util')
const { extname } = require('path')
const debug = require('debug')('hotpack/lib/compress')
var minify = require('html-minifier').minify;

module.exports = function (file, content, { js = {}, css = {}, html = {} } = {}) {
  let result = ''
  if (isMin(file)) {
    return content
  }
  switch (extname(file)) {
    case '.js':
      debug(`compress ${file}`)
      result = jsProvider.minify(content, js)
      if (!result.code) {
        throw result.error
      }
      result = result.code
      break;
    case '.css':
      debug(`compress ${file}`)
      //todo record error
      result = new cssProvider({ compatibility: 'ie9' }).minify(content)
      result = result.styles
      break
    case '.html':
      debug(`compress ${file}`)
      result = minify(content, {
        removeAttributeQuotes: true,
        collapseWhitespace: true
      });
    //console.log(result)
    default:
      break
  }
  return result
}
