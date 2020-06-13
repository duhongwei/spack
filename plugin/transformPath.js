
const { isHtml } = require('../lib/util')
const debug = require('debug')('hotpack/tranformPath')
const {sep} =require('path')
function defaultTransformPageKey(key) {
  let keys = key.split(sep)
  if (keys.length <= 1) {
    return key
  }
  keys.shift()
  if (keys[keys.length - 1] === keys[keys.length - 2] + '.html') {
    keys.splice(keys.length - 2, 1)
  }

  let result = keys.join(sep)

  return result
}
function dealPublicPath(publicPath, files, file) {
  if (!publicPath) return
  let f = files[file]
  delete files[file]
  files[`${publicPath}/${file}`] = f
}
module.exports = function ({ transformPageKey = defaultTransformPageKey } = {}) {

  return function (files, { logger, publicPath }) {
    logger.log('run plugin transform')
    for (let file in files) {
      if (!isHtml(file)) {
        continue
      }

      let renderFile = transformPageKey(file)
      debug(`transform ${file} => ${renderFile}`)
 
      files[renderFile] = files[file]
      if (file !== renderFile) {
        delete files[file]
      }
      dealPublicPath(publicPath, files, renderFile)
    }

  }
}
