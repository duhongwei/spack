/**
 * render html with resource
 */
const { getEntry, render, doPackage } = require('../lib/html')
const { isHtmlOrTpl } = require('../lib/util')
const { existsSync } = require('fs')
const { join } = require('path')
const { extname } = require('path')
module.exports = function () {

  return function (files, metalsmith, done) {
    let { dep, runtimeFiles, logger, package, version, cdn } = metalsmith.metadata()
    const src = metalsmith.source()
    logger.log('run plugin html', 1)
    for (let file in files) {
      if (!isHtmlOrTpl(file)) {
        continue
      }
      logger.log(`build html ${file}`)

      let entry = getEntry(file)
      if (!existsSync(join(src, entry))) {
        throw new Error(entry + ' not exist!')
      }
      let deps = dep.getByEntry(entry)
      deps = Object.keys(runtimeFiles).concat(deps)
      const renderData = doPackage(deps, package).reduce((packageData, items) => {
        if (items.length === 0) {
          return packageData
        }
        //http://a/b/c.js ,只要c,得到c的数组
        const hashs = items.map(item => version.get(item).url.split('/').pop().split('.')[0])
        if (cdn.isLocal) {
          cdn.makeFile(hashs, extname(items[0]))
        }
        packageData.push(cdn.getUrl(hashs, extname(items[0])))
        return packageData
      }, [])
      files[file].contents = render(files[file].contents, renderData)
    }
    done()
  }
}
