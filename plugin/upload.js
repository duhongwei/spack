/** 
 * upload css.js
 * TODO:处理内联js
 */
const { isJs, isCss } = require('../lib/util')
const { extname } = require('path')
const { isServerJs } = require('../lib/util')
module.exports = function () {
  return function (files, metalsmith, done) {
    const { prevVersion, version, cdn, logger } = metalsmith.metadata()
    logger.log('run plugin upload', 1)
    const PromiseList = []
    for (let file in files) {
      if (!(isJs(file) || isCss(file))) {
        continue
      }
      //如果是服务端的脚本，忽略
      if (isServerJs(file)) {
        continue
      }
      PromiseList.push(cdn.upload(files[file].contents, extname(file), { https: true }).then(url => {
        logger.log(`upload ${file} =>  ${url}`)
        delete files[file]
        version.set(file, { url })
      }, (d) => {
        throw new Error(file + ',' + d.message)
      }))
    }
    Promise.all(PromiseList).then(() => {
      done()
    })
  }
}