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
  //只有style有lang属性，所以简单判断所有内容是否有lang属性
  var reg = /<style\s*(lang\s*=\s*['"](\w+)['"])?\s*>([^]+)<\/style>/;

  _content = _content.replace(reg, function (match, langMath, lang, v) {

    if (lang) {
      result.type = lang
    }
    result.content = v.trim()
    return ''
  })

  return result
}
function getJs() {
  let result = { type: 'js', content: '' }
  var reg = /<script\s*(lang\s*=\s*['"](\w+)['"])?\s*>([^]+)<\/script>/;
  _content = _content.replace(reg, function (match, langMath, lang, v) {
    if (lang) {

      result.type = lang
    }
    result.content = v.trim()
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

  if (!js.content) {
    js.content = "export default { }"
  }

  if (/export\s+default\s*/.test(js.content)) {
    js.content = js.content.replace(/export\s+default\s*\{/, function (match) {
      //md5是为了体现变化
      return `${match}\n__vue__:'${md5(html)}',`
    })
  }
  else {
    throw new Error(`${file} has vue 语法错误，必须有一个export default`)
  }


  if (style.content) {
    js.content = `import "./${basename(file)}.${style.type}";${js.content}`
  }
  let v = {}

  v[file + '.html'] = { contents: html }

  v[`${file}.${js.type}`] = {
    contents: js.content
  }
  if (style.content) {
    v[`${file}.${style.type}`] = {
      contents: style.content
    }
  }

  return v
}
module.exports = {
  parse
}