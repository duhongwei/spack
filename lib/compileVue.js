
const compiler = require('vue-template-compiler')
const debug = require('debug')('hotpack/vue')
function getHtml(file, files) {
  file = file.replace('.js', '.html')

  let result = files[file].contents
  delete files[file]
  
  return result
}
function compileHtml(html) {
  let compiled = compiler.compile(html)
  return {
    render: `function () { ${compiled.render} }`,
    staticRenderFns: `[${compiled.staticRenderFns.map(item => `function(){${item}}`)}]`
  }
}
module.exports = function (files, file, code) {

  debug(`parse vue file ${file}`)
  let html = getHtml(file, files)
  let compiled = compileHtml(html)
  return `${code};_k_0.render=${compiled.render};_k_0.staticRenderFns=${compiled.staticRenderFns}`
}