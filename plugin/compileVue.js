
const compiler = require('vue-template-compiler')
const debug = require('debug')('hotpack/vue')
function getHtml(file, files) {
  file = file.replace('.js', '.html')

  let result = files[file].contents
  delete files[file]
  return result
}
function replaceHtml(js, html,logger) {
  let compiled = compiler.compile(html)
  if (compiled.errors.length>0) {
    console.log(compiled.errors)
    logger.fatal('compile vue template error')
    process.exit(1)
  }

  let ok = `
    render:function(){${compiled.render}},
    staticRenderFns:[${compiled.staticRenderFns.map(item => `function(){${item}}`)}],
  `
  return js.replace(/__vue__:[^,]{34},/, ok)
}
module.exports = function () {
  return function (files, { logger }) {
    logger.log('run plugin compileVue')
    for (const file in files) {
      if (!/\.vue\.js$/.test(file)) {
        continue
      }
      debug(`compile vue file ${file}`)
      let html = getHtml(file, files)

      let jsContent = files[file].contents

      files[file].contents = replaceHtml(jsContent, html,logger)
      //console.log(files[file].contents)
    }
  }
}