const debug = require('debug')('hotpack/include')
const { join, dirname } = require('path')
const { isText } = require('../lib/util')
const fs = require('fs')
const compress = require('../lib/compress.js')
module.exports = function () {

  return function (files, spack) {

    spack.logger.log('run plugin include')
    for (let file in files) {
      if (!isText(file)) {
        continue
      }
      let c = files[file].contents
      c = c.replace(/\binclude\(['"]?([^)'"]+)['"]?\)/g, (match, p1) => {
        let path = null

        if (p1.startsWith('/')) {
          path = join(spack.source(), p1.substr(1))
        }
        else {
          path = join(spack.source(), dirname(file), p1)
        }
        debug(`include ${p1}: ${path} in ${file}`)
        let c = fs.readFileSync(path, 'utf8')
        if (spack.env == 'production') {
           c=compress(path,c)
        }
        return c
      })

      files[file].contents = c
    }
  }
}