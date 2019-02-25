

const { join } = require('path')
const { readFileSync } = require('fs')
module.exports = function () {
  return function (files, metalsmith) {
    const { runtimeFiles, logger} = metalsmith.metadata()
    const srcPath = join(__dirname, '../client')
    logger.log('run plugin runtime')
    for (let file in runtimeFiles) {
      const filePath = join(srcPath, runtimeFiles[file])
      files[file] = {
        contents: readFileSync(filePath, 'utf8')
      }
      logger.log(`add runtime ${file}`)
    }

  }
}