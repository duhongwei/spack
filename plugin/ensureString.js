
const { isText } = require('../lib/util')
module.exports = function () {
  
  return function (files,metalsmith) {
    const { logger } = metalsmith.metadata()
    logger.log('run plugin enstrureString',1)
    for (let file in files) {
      if (isText(file)) {
        files[file].contents = files[file].contents.toString('utf8')
      }
    }
  }
}