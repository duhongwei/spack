const ts = require('typescript')
const { isTs } = require('../lib/util')
const debug = require('debug')('hotpack/buble')
module.exports = function () {
  return function (files, spack, done) {
    spack.logger.log('run plugin ts')
    for (let file in files) {
     
      if (!isTs(file)) {
        continue
      }

      debug(`ts ${file}`)
      const opts = {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext }
      }
      try {
        let newFile = file.replace(/\.ts$/, '.js')
        
        let c = ts.transpileModule(files[file].contents, opts).outputText
        if (newFile in files) {
          spack.logger.fatal(`${newFile} exist!`)
        }
        files[newFile] = { contents: c }
        spack.version.update(newFile,c)
        delete files[file]
      }
      catch (error) {
        //错误到止为止
        delete files[file]
        spack.logger.fatal(`error when ts ${file}\n ${error.message}`)

        if (spack.env == 'production') {

          process.exit(1)
        }

      }
    }

    done()
  }
}