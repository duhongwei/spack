/** 
 * 参数参见 https://github.com/less/less.js
 *
 */

const { isLess } = require('../lib/util')
const less = require('less')
const debug = require('debug')('hotpack/less')
module.exports = function () {

  return function (files, spack, done) {
    const pList = []
   
    spack.logger.log('run plugin less')
    for (let file in files) {
      if (!isLess(file)) {
        continue
      }
      debug(`less ${file}`)
      pList.push(
        less.render(files[file].contents, {

        }, function (error, output) {
          if (error) {
            spack.logger.fatal(`error when compile ${file}\n ${error.message}`)
            if (spack.env == 'production') {
              process.exit(1)
            }
          }
          delete files[file]

          const newFile = `${file}.css`
          files[newFile] = {
            contents: output.css
          }
          spack.version.update(newFile, output.css)
        })
      )
    }
    Promise.all(pList).then(() => {
      done()
    })
  }
}