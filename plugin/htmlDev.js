/**
 * render html with resource
 */
const { getEntry, render } = require('../lib/html')
const { isHtmlOrTpl } = require('../lib/util')
const { existsSync } = require('fs')
const { join } = require('path')
const vm = require('vm');

module.exports = function () {

  return function (files, metalsmith, done) {
    let { dep, runtimeFiles, logger } = metalsmith.metadata()
    const src = metalsmith.source()
    logger.log('run plugin html', 1)
    for (let file in files) {
      if (!isHtmlOrTpl(file)) {
        continue
      }
      logger.log(`build ${file}`)

      let entry = getEntry(file)
      if (!existsSync(join(src, entry))) {
        throw new Error(entry + ' not exist!')
      }
      let deps = dep.getByEntry(entry)
   
      deps = Object.keys(runtimeFiles).concat(deps)
      const renderData = deps.map(item => `/${item}`)
      files[file].contents = render(files[file].contents, renderData)

    }
    done()
  }
}
