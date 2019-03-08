const debug = require('debug')('hotpack/include')
const { join } = require('path')
const fs = require('fs')
module.exports = function ({ includeRoot }) {
  
  return function (files, spack) {
    includeRoot = includeRoot || join(spack.directory(), 'include')
    spack.logger.log('run plugin include')
    for (let file in files) {
      if (!/\.html$/.test(file)) {
        continue
      }
      let c = files[file].contents
      c = c.replace(/\binclude\(([^)]+)\)/g, (match, p1) => {
       
        let path = join(includeRoot, p1)
        debug(`include ${p1}: ${path} in ${file}`)
        return fs.readFileSync(path, 'utf8')
      })
      files[file].contents = c
    }
  }
}