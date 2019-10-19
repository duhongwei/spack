
const debug = require('debug')('hotpack/version')
const { isHtml, isText,isLess } = require('../lib/util')
module.exports = function () {
  return function (files, { version, logger }) {
    logger.log('run plugin version')

    for (let file in files) {
      if (isHtml(file)) {
        continue
      }
      if (isText(file) && files[file].contents.trim() === '') {
        logger.fatal(`${file} is empty`)
        process.exit(1)
      }
      let versionKey=file
      if (isLess(file)) { 
        //最终不会存在less文件，只有css文件，所以直接存最终的文件名
        versionKey=file.replace(/\.less$/,'.css')
      }
      if (version.update(versionKey, files[file].contents)) {
        debug(`${file} updated`)
      }
      else {
        debug(`rm file ${file}`)
        delete files[file]
      }
    }
  }
}