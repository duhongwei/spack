const path = require('path')
const { isCss } = require('../lib/util')
const debug = require('debug')('hotpack/postcss')
const postcss = require('postcss')
module.exports = function (opts) {
  //从项目中获取postCSS
  /* let postcss = null
  try {
    const postCSSPath = path.resolve('node_modules/postcss')
    postcss = require(postCSSPath)
  }
  catch (e) {
    e.message = 'please install postcss plugin first. ', +e.message
    console.log(e)
    process.exit(1)
  } */
  return function (files, spack, done) {
    const pList = []
    spack.logger.log('run plugin postcss')
    for (let file in files) {
      if (!isCss(file)) {
        continue
      }
      debug(`post css ${file}`)
      if (!Array.isArray(opts)) {
        spack.logger.fatal('options of postcss must array')
        process.exit(1)

      }
      if (opts.length === 0) {
        done()
        return
      }
      pList.push(
        postcss(opts)
          .process(files[file].contents, { from: undefined })
          .then(result => {
            files[file].contents = result.css
          })
      )
    }
    Promise.all(pList).then(() => {
      //必须在done之前，否则会在执行完下一插件时再执行文本
      //if (pList.length > 0) {
      //  spack.logger.log('postcss done')
      //}
      done()
    })
  }
}