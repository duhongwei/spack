

const { join } = require('path')
const { readFileSync } = require('fs')
module.exports = function () {
  return function (files, spack) {
    const { runtime, logger} = spack
    const srcPath = join(__dirname, '../client')
    logger.log('run plugin runtime')
    for (let file of runtime) {
      const filePath = join(srcPath, file)
      files[file] = {
        contents: readFileSync(filePath, 'utf8')
      }
      logger.log(`add runtime ${file}`)
    }
  }
}