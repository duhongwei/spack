const parser = require('@duhongwei/parser')
const { ToAmd, pathToKey } = require('../lib/parser/toAmd')
const { isJs } = require('../lib/util')

const debug = require('debug')('hotpack/parser')

module.exports = function () {
  return function (files, spack) {
    spack.logger.log('run plugin parser')
    for (const file in files) {

      if (!isJs(file)) {
        continue
      }
      debug(`parse ${file}`)
      const es6Parser = new parser.Es6(files[file].contents, {
        dynamicImportReplacer: `require('runtime/import.js').load`, dynamicImportKeyConvert: key => {
          return pathToKey(key, file, spack.source(), spack.version)
        }
      })
      let info = null
      try {
        info = es6Parser.parse()
      }
      catch (error) {
        //错误到止为止
        delete files[file]
        spack.logger.fatal(`error when compile ${file}\n ${error.message}`)
        if (spack.env == 'production') {
          process.exit(1)
        }
        else {

          continue
        }
      }

      let len = info.importInfo.length
      while (len--) {
        let item = info.importInfo[len]

        if (item.type === 'djs') {

          spack.dynamic.add(pathToKey(item.file, file, spack.source(), spack.version))
          info.importInfo.splice(len, 1)
        }
      }
      info.sourcePath = spack.source()
      info.version = spack.version

      const toAmd = new ToAmd(info, file)
      files[file].contents = toAmd.toString()

      spack.dep.set(file, toAmd.getDeps())
    }
  }
}