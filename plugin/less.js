/** 
 * 参数参见 https://github.com/less/less.js
 *
 */

const { isLess } = require('../lib/util')
const less = require('less')

module.exports = function () {

  return function (files, spack, done) {
    const pList = []
    spack.logger.log('run plugin less')
    for (let file in files) {
      if (!isLess(file)) {
        continue
      }
      pList.push(
        less.render(files[file].contents, {

        }, function (error, output) {
            if (error) {
            
            spack.logger.fatal(`error when compile ${file}\n ${error.message}`)
            process.exit(1)
          }
          delete files[file]

          files[file.replace(/\.less$/, '.css')] = {
            contents: output.css
          }
        })
      )
    }
    Promise.all(pList).then(() => {
      done()
    })
  }
}