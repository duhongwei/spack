const parser = require('@duhongwei/parser')
const { ToAmd, pathToKey } = require('../lib/parser/toAmd')
const { isJs } = require('../lib/util')

const debug = require('debug')('hotpack/parser')

module.exports = function () {
  return function (files, { dep, logger, dynamic }) {
    logger.log('run plugin parser')
    for (const file in files) {
      if (!isJs(file)) {
        continue
      }
      debug(`parse ${file}`)
      const es6Parser = new parser.Es6(files[file].contents, {
        dynamicImportReplacer: `require('runtime/import.js').load`, dynamicImportKeyConvert: key => {
          return pathToKey(key)
        }
      })
      let info = es6Parser.parse()

      let len = info.importInfo.length
      while (len--) {
        let item = info.importInfo[len]

        if (item.type === 'djs') {

          dynamic.add(pathToKey(item.file))
          info.importInfo.splice(len, 1)
        }
      }
      const toAmd = new ToAmd(info, file)
      files[file].contents = toAmd.toString()

      dep.set(file, toAmd.getDeps())
    }
  }
}