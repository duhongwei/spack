
const debug = require('debug')('hotpack/version')
const {isHtml, isText } = require('../lib/util')
const { basename } = require('path')
module.exports = function () {
  return function (files, spack) {
    spack.logger.log('run plugin version')

    for (let file in files) {
      if (isHtml(file)) {
        continue
      }
      //删除隐藏文件。
      if (/^\./.test(basename(file))) {
        delete files[file]
        continue
      }
      
      if (isText(file) && files[file].contents.trim() === '') {
        spack.logger.fatal(`${file} is empty`)
        if (spack.env == 'production') {
          process.exit(1)
        }
        else {
          delete files[file]
          continue
        }
      }

      if (spack.version.update(file, files[file].contents)) {
        debug(`${file} updated`)
      }
      else {
        debug(`rm file ${file}`)
        delete files[file]
      }
    }
  }
}