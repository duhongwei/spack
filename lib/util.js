/**
 * 工具方法集
 */
const { basename, dirname } = require('path')
const path = require('path')
const crypto = require('crypto');

function md5(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex');
}
/**
 * 把es6模块的 url 处理成物理文件相对于deirectory的路径，不带 /
 * 
 * 在hotpack内部，用相对于 src 的文件路径来标识一个文件，用于version,dep,AMD key等地方
 * url是绝对url 以/开头或http开头 .js不能省略
 * 生成的文件路径是相对于 src 的相对路径，但不是能 ./ 或 ../ 开头的形式
 * 
 * 合法例子：
 *  resolveES6Path('a/b/c.js','/a.js')    => 'a.js'
 *  resolveES6Path('a/b/c.js','./a.js')   => 'a/b/a.js'
 *  resolveES6Path('a/b/c.js','../../a.js') => 'a.js'
 *  resolveES6Path('a/b/c.js','../../a.js') => 'a.js'
 *  resolveES6Path('a/b/c.js','./a')  => 'a/b/a.js'
 *  
 * @param {string} path1 
 * @param {string} path2 
 */
function resolveES6Path(path1, path2) {
  if (!path1.trim() || !path2.trim()) {
    throw new Error('不能为空')
  }
  if (!/^[a-zA-Z_]/.test(path1)) {
    throw new Error('非法 ' + path1)
  }

  //是相对或绝对路径的情况下，自动补全 .js 后缀名
  if (basename(path2).indexOf('.') < 0) {
    path2 += '.js'
  }
  if (/^http/.test(path2)) {
    throw new Error('暂时不处理网络路径 ' + path2)
  }
  //node modules,return eg: 'hotpack-node/vue.js'
  if (!/^(\/|\.)/.test(path2)) {
    throw new Error('invalid es6path')
  }

  if (basename(path1).indexOf('.') < 0) {
    throw new Error('no basename ' + path1)
  }
  // 绝对es6路径，去掉 / 
  if (/^\//.test(path2)) {
    return path2.substr(1)
  }

  path1 = dirname(path1)
  let p = path.join(path1, path2)

  if (/^\.\./.test(p)) {
    throw new Error('too much ...' + path2)
  }
  return p
}
function path2key(_path_) {
  let p = _path_.split(/[?#]/)[0]
  p = p.split(/\/|\\/).join('/')
  if (p[0] === '/') {
    p = p.substr(1)
  }
  return p
}

function isNode(key) {

  return /^node\//.test(key)

}
function isImage(file) {
  let ext = file.split('.').reverse()[0]
  return /^(gif|jpg|png|jpeg|svg)$/.test(ext)
}
function isVue(file) {
  let ext = file.split('.').reverse()[0]
  return /^vue$/.test(ext)
}
function isText(file) {
  let ext = file.split('.').reverse()[0]
  return /^(js|css|html|htm|tpl|vue|jsx|wxss|wxml|json|wxs)$/.test(ext)
}
///a.min.js
function isMin(file) {
  let f = file.split('.')
  f.pop()
  if (f.pop() === 'min') {
    return true
  }
  else {
    return false
  }
}
function isJs(file) {
  let ext = file.split('.').reverse()[0]
  return /^(js)$/.test(ext)
}

function isCss(file) {
  let ext = file.split('.').reverse()[0]
  return /^(css)$/.test(ext)
}
function isMedia(file) {
  let ext = file.split('.').reverse()[0]
  return /^(jpg|jpeg|png|gif|webp|svg|eot|ttf|woff|woff2|etf|mp3|mp4|mpeg)$/.test(ext)
}
function isHtml(file) {
  let ext = file.split('.').reverse()[0]
  return /^(html|htm)$/.test(ext)
}

/**
 * 需要忽略返回true
 * @param {string} file 文件名
 * @param {array} ignoreList 忽略文件特征
 */
function ignore(file, ignoreList) {
  if (!ignoreList) {
    return false
  }
  return ignoreList.some(item => file.startsWith(item))
}

/**
 * 简单字符串替换
 * 例子：
 *  format('{0}_{1}',1,2) => 1_2
 *  format({0}-{1}-[0},1,2]) => 1-2-1
 * @param {string} tpl 字符串模板
 * @param {array} data 数据
 */
function format(tpl, ...data) {
  return tpl.replace(/{(\d)}/g, function (match, index) {
    return data[index]
  });
}
function removeSpace(s) {
  return s.replace(/\s/g, '')
}
class PluginError extends Error {

}

module.exports = {
  path2key,
  removeSpace,
  resolveES6Path,
  isNode,
  isImage,
  isText,
  isMedia,
  isJs,
  isMin,
  isCss,
  md5,
  isHtml,
  ignore,

  isVue,
  format,
  PluginError
}