
const { isHtml } = require('../lib/util')
const debug = require('debug')('hotpack/tranformPath')

function defaultTransformPageKey(key) {
  let keys = key.split('/')
  if (keys.length <= 1) {
    return key
  }
  keys.shift()
  if (keys[keys.length - 1] === keys[keys.length - 2] + '.html') {
    keys.splice(keys.length - 2, 1)
  }

  let result = keys.join('/')
 
  return result
}

module.exports = function ({ transformPageKey = defaultTransformPageKey } = {}) {

  return function (files, { logger }) {
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
    }
  
  }
}
