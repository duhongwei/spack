//https://www.npmjs.com/package/vue-template-compiler
'use strict'
let _content = '';
let { basename } = require('path')
const { md5 } = require('./util')
function getHtml() {
  let result = false

  _content = _content.replace(/<template>([^]+)<\/template>/, function (match, v) {
    //result = v.trim().replace(/[\r\n]/g, '').replace(/\s+/g, ' ').replace(/'/g, "\\'")
    result = v
    return ''
  })
  return result
}
function getStyle() {
let result = { type: 'css', content: '' }
  var reg = /<style>([^]+)<\/style>/;

  //只有style有lang属性，所以简单判断所有内容是否有lang属性
  let styleLang = _content.match(/\s+lang\s*=['"](\w+)['"]/)
  if (styleLang && styleLang[1]) {
    result.type = styleLang[1]
  }

  _content = _content.replace(reg, function (match, v) {
    result.content = v.trim()
    return ''
  })
  return result
}
function getJs() {
  let result = false
  _content = _content.replace(/<script>([^]+)<\/script>/, function (match, v) {
    result = v.trim()
    return ''
  })
  return result
}

function parse(file, content) {

  _content = content.toString()

  let [html, style, js] = [getHtml(), getStyle(), getJs()]

  if (!html) {
    throw new Error(file + ': html template required!')
  }

  if (!js) {
    js = "export default { }"
  }

  if (/export\s+default\s*/.test(js)) {
    js = js.replace(/export\s+default\s*\{/, function (match) {
      //md5是为了体现变化
      return `${match}\n__vue__:'${md5(html)}',`
    })
  }
  else {
    throw new Error(`${file} has vue 语法错误，必须有一个export default`)
  }


  if (style.content) {
    js = 'import "./' + basename(file) + `.${style.type}";` + js
  }
  let v = {}
  v[file + '.html'] = { contents: html }
  v[file + '.js'] = {
    contents: js
  }
  if (style.content) {
    v[file + `.${style.type}`] = {
      contents: style.content
    }
  }
  return v
}
module.exports = {
  parse
}