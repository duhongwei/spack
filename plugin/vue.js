
const { isVue } = require('../lib/util')
const { parse } = require('../lib/vue')

const debug = require('debug')('hotpack/vue')
module.exports = function () {
  return function (files, { logger, version }) {
    logger.log('run plugin vue')
    for (const file in files) {
      if (!isVue(file)) {
        continue
      }
      if (!version.get(file).update) {
        delete files[file]
        continue
      }
      debug(`parse vue file ${file}`)
      let parsedVue = parse(file, files[file].contents)
      for (const file in parsedVue) {
        debug(`add file ${file}`)
        files[file] = parsedVue[file]
        
        version.update(file, parsedVue[file].contents)
      }
      delete files[file]
    }
  }
}