const buble = require('buble')
const { isJs, isServerJs } = require('../lib/util')
module.exports = function () {
  return function (files, metalsmith, done) {
    const { logger, runtimeFolder } = metalsmith.metadata()
    logger.log('run plugin buble', 1)
    for (let file in files) {
      if (!isJs(file)) {
        continue
      }
      //如果是runtime，不用buble,一来是不用，二来是react-dom经buble后会有错误
      if (new RegExp(`^${runtimeFolder}/`).test(file)) {
        continue
      }
      //如果是node模块忽略
      if (/^node\//.test(file)) {
        continue
      }
      logger.log(`buble ${file}`)
      const opts = {
        transforms: {
          modules: false
        }
      }
      //如果是服务端的js 8.0以上就可以了
      if (isServerJs(file)) {
        opts.target = {
          "node": 8
        }
      }
      files[file].contents = buble.transform(files[file].contents, opts).code
    }
    done()
  }
}