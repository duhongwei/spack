
const compiler = require('vue-template-compiler')
const debug = require('debug')('hotpack/vue')
function getHtml(file, files) {
  file = file.replace('.js', '.html')

  let result = files[file].contents
  delete files[file]
  return result
}
function replaceHtml(js, html, logger, file) {
  let compiled = compiler.compile(html)
  if (compiled.errors.length > 0) {
    console.log(compiled.errors)
    logger.fatal(`compile vue template ${file} error`)
    return false
  }

  let ok = `
    render:function(){${compiled.render}},
    staticRenderFns:[${compiled.staticRenderFns.map(item => `function(){${item}}`)}],
  `
  return js.replace(/__vue__:[^,]{34},/, ok)
}
module.exports = function () {
  return function (files, { logger, env }) {
    logger.log('run plugin compileVue')
    for (const file in files) {
      if (!/\.vue\.js$/.test(file)) {
        continue
      }
      debug(`compile vue file ${file}`)
      let html = getHtml(file, files)

      let jsContent = files[file].contents

      let replacedHtml = replaceHtml(jsContent, html, logger, file, env)

      if (replacedHtml) {
        files[file].contents = replacedHtml
      }
      else if (env === 'production') {
        process.exit(1)
      }
      else {
        //如果是开发环境，忽略这个错误，不处理这个文件
        delete files[file]
      }

    }
  }
}