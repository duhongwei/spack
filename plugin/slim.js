/** 
 * slim css,js
 */
const { md5, isJs, isCss } = require('../lib/util')
module.exports = function (info) {
  return function (files, metalsmith) {
    const { prevVersion, version, logger } = metalsmith.metadata()
    logger.log('run plugin slim', 1)
    for (let file in files) {
      if (!isJs(file) && !isCss(file)) {
        continue
      }
      let hash = md5(files[file].contents)
      if (!prevVersion.shouldUpdate(file, hash)) {
        logger.log(`rm ${file}`)
        delete files[file]
      }
      else {
        version.set(file, { hash })
      }
    }
  }
}