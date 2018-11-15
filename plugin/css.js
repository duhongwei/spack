/** 
 * 处理javascript，目前只处理js文件中的js
 * TODO:处理内联js
 */
const { md5, isCss } = require('../lib/util')
module.exports = function () {
  return function (files, metalsmith) {
    const { prevVersion, version, cdn, logger } = metalsmith.metadata()
    logger.log('run plugin css', 1)
    if (process.env.NODE_ENV === 'development') {
      return
    }
    for (let file of files) {
      if (!isCss(file)) {
        continue
      }
      let hash = md5(files[file].contents)
      if (!prevVersion.shouldUpdate(file, hash)) {
        logger.log(`skip to upload css ${file}`)
        delete files[file]
        continue
      }
      PromiseList.push(cdn.content(files[file].contents, extname(file), { https: true }).then(url => {
        logger.log(`upload css ${file}=>${url}`)
        delete files[file]
        version.set(file, { hash, url })
      }))
    }
    Promise.all(PromiseList).then(() => {
      done()
    })
  }
}