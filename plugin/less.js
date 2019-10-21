/** 
 * 参数参见 https://github.com/less/less.js
 *
 */

const { isLess } = require('../lib/util')
const less = require('less')

module.exports = function () {

  return function (files, { version, logger }, done) {
    const pList = []
    logger.log('run plugin less')
    for (let file in files) {
      if (!isLess(file)) {
        continue
      }
      pList.push(
        less.render(files[file].contents, {

        }, function (error, output) {
          if (error) {

            logger.fatal(`error when compile ${file}\n ${error.message}`)
            if (spack.env == 'production') {
              process.exit(1)
            }
          }
          delete files[file]

          const newFile = `${file}.css`
          files[newFile] = {
            contents: output.css
          }
          version.update(newFile, output.css)
        })
      )
    }
    Promise.all(pList).then(() => {
      done()
    })
  }
}