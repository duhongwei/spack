const { isHtml } = require('../lib/util')
const { join } = require('path')
const { writeFileSync } = require('fs')
module.exports = function () {
  return function (files, metalsmith, done) {
    const { logger, } = metalsmith.metadata()
    logger.log('run plugin runder', 1)
    for (let file in files) {
      if (!isHtml(file)) {
        continue
      }
      logger.log(`render ${file}`)
      let contents = files[file].contents
      const key = htmlKey.replace(/(\.html|\.htm)$/, '.server.js')
      const renderFile = join(process.cwd(), key)
      writeFileSync(renderFile, files[key].contents, 'utf8')
      delete files[key]
      const render = require(renderFile)
      contents = render(contents)
      files[file].contents = contents
    }
    done()
  }
}