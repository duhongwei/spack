
const replace = require('../lib/envify')
module.exports = function () {
  return function (files, metalsmith,done) {
    const { logger, nodeFolder } = metalsmith.metadata()
    logger.log('run plugin envify', 1)
    for (let file in files) {
      //只处理node_module中过来的文件
      if (new RegExp(`^${nodeFolder}/`).test(file)) {
        logger.log(`convert ${file}`)
        files[file].contents = replace(files[file].contents, [process.env])
      }
    }
    done()
  }
}