const debug = require('debug')('hotpack/resolvePath')

const { resolveES6Path, isText } = require('../lib/util')
module.exports = function () {
  return function (files, spack) {
    spack.logger.log('run plugin resolvePath')
    for (let file in files) {
      if (!isText(file)) {
        continue
      }
      let c = files[file].contents
      c = c.replace(/\bresolvePath\(([^)]+)\)/g, (match, p1) => {
        let quote = ''
        if (/['"]/.test(p1[0])) {
          quote = p1[0]
        }
        p1 = p1.replace(/['"]/g, '')
        if (!/^[/.]/.test(p1)) {
          throw new Error(`page path ${p1} must start with . or /`)
        }
        let path = resolveES6Path(file, p1)
        debug(`resolvePath ${p1} => ${path} in ${file}`)
        return `${quote}/${path}${quote}`
      })
      files[file].contents = c
    }
  }
}