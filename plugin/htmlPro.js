/**
 * render html with resource
 */
const { getEntry, render, doPackage, doDynamic } = require('../lib/html')
const { isHtml } = require('../lib/util')
const { existsSync } = require('fs')
const { join } = require('path')
const { extname } = require('path')
const debug = require('debug')('hotpack/html')

function getCdnDeps({ packagedDeps, version, cdn }) {
  return packagedDeps.reduce((result, items) => {
    const hashs = items.map(item => {
      return version.get(item).url.split('/').pop().split('.')[0]
    })
    if (cdn.makeFile) {
      debug(`makefile ${items.join(',')}`)
      cdn.makeFile(hashs, extname(items[0]))
    }
    result.push(cdn.getUrl(hashs, extname(items[0])))
    return result
  }, [])
}

module.exports = function () {

  return function (files, spack, done) {
    let { dep, runtime, logger,  version, cdn, dynamic } = spack
    const src = spack.source()
    logger.log('run plugin html')

    for (let file in files) {

      if (!isHtml(file)) {
        continue
      }
      debug(`build html ${file}`)
      let entry = getEntry(file)
      if (!existsSync(join(src, entry))) {
        throw new Error(entry + ' not exist!')
      }
      //保证runtime在最前，这样打包的时候，runtime也会在前面
      let deps = runtime.concat(dep.getByEntry(entry))
      debug(`deps ars \n${JSON.stringify(deps, null, 2)}`)
      let packagedDeps = doPackage(deps, spack.package)
      debug(`packagedDeps ars \n${JSON.stringify(packagedDeps, null, 2)}`)
      let cdnDeps = getCdnDeps({ packagedDeps, version, cdn })
      debug(`cdnDeps are \n${JSON.stringify(cdnDeps, null, 2)}`)
      files[file].contents = render(files[file].contents, cdnDeps)

      let dynamicDeps = doDynamic(deps, dep, dynamic.get())
      debug(`dynamicDeps ars \n${JSON.stringify(dynamicDeps, null, 2)}`)
      if (dynamicDeps) {
        let packagedDynamicDeps = {}
        for (const key in dynamicDeps) {
          packagedDynamicDeps[key] = doPackage(dynamicDeps[key], [])
        }
        debug(`packagedDynamicDeps ars \n${JSON.stringify(packagedDynamicDeps, null, 2)}`)
        let cdnDynamicDeps = {}
        for (const key in packagedDynamicDeps) {
          cdnDynamicDeps[key] = getCdnDeps({ packagedDeps: packagedDynamicDeps[key], version, cdn })
        }
        debug(`cdnDynamicDeps are \n${JSON.stringify(cdnDynamicDeps, null, 2)}`)
        files[file].contents = files[file].contents.replace(`'<%deps%>'`, JSON.stringify(cdnDynamicDeps))
      }
    }
    done()
  }
}
