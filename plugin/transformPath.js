
const { isHtml } = require('../lib/util')
const debug = require('debug')('hotpack/tranformPath')
module.exports = function () {
  return function (files, { logger, transformPageKey }) {
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
