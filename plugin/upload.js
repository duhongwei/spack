/** 
 * upload css.js
 * TODO:处理内联js
 */
const { isJs, isCss } = require('../lib/util')
const { extname } = require('path')
const debug = require('debug')('hotpack/upload')
module.exports = function () {
  return function (files, { version, cdn, logger }, done) {
    logger.log('run plugin upload')
    const PromiseList = []
    for (let file in files) {
      if (!isJs(file) && !isCss(file)) {
        continue
      }
      PromiseList.push(cdn.upload(files[file].contents, extname(file), { file }).then(url => {
        debug(`upload ${file} =>  ${url}`)
        delete files[file]
        version.setUrl(file, url)
      }, (d) => {
        logger.fatal(`${file} , ${d.message}`)
        process.exit(1);
      }))
    }
    Promise.all(PromiseList).then(() => {
      done()
    })
  }
}