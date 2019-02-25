/**
 * render html with resource
 */
const { getEntry, render, doDynamic } = require('../lib/html')
const { isHtml } = require('../lib/util')
const { existsSync } = require('fs')
const { join } = require('path')
const debug = require('debug')('hotpack/html')
module.exports = function () {
  return function (files, spack, done) {
    let { dep, runtime, logger, dynamic } = spack
    const src = spack.source()
    logger.log('run plugin html')
    for (let file in files) {
      if (!isHtml(file)) {
        continue
      }
      debug(`build ${file}`)

      let entry = getEntry(file)
      if (!existsSync(join(src, entry))) {
        throw new Error(entry + ' not exist!')
      }
      let deps = dep.getByEntry(entry)
      let dynamicDeps = doDynamic(deps, dep, dynamic.get())
      debug(`dynamicDeps are \n${JSON.stringify(dynamicDeps, null, 2)}`)

      deps = runtime.concat(deps)
      debug(`deps are \n${JSON.stringify(deps, null, 2)}`)
      const renderData = deps.map(item => `/${item}`)
      if (dynamicDeps) {
        files[file].contents = files[file].contents.replace(`'<%deps%>'`, JSON.stringify(dynamicDeps))
      }
      files[file].contents = render(files[file].contents, renderData)
    }
    done()
  }
}
