const clone = require('clone')
const { extname } = require('path')
module.exports = class {
  constructor({ importInfo, exportInfo, code }) {
    this.importInfo = clone(importInfo)
    this.exportInfo = clone(exportInfo)
    this.code = code
  }
  toString() {
    const importString = this._importToString()
    const exportString = this._exportToString()
    return `${importString}\n${this.code}\n${exportString}`
  }

  _importToNodeString(item) {
    if (item.token[0].from === 'default' || item.token[0].from === '*') {
      return `const ${item.token[0].to} = require('${item.file}')`
    }
    else {
      const tokenString = this._tokensToString(item.token)
      return `const { ${tokenString} } = require('${item.file}')`
    }
  }
  //自定义模块
  _importToCustomString(item) {  
    
    let key=this._getCustomKey(item.file)
    if (item.token[0].from === 'default') {
      return `const ${item.token[0].to} = require('${key}')['default']`
    }
    else {
      const tokenString = this._tokensToString(item.token)
      return `const { ${tokenString} } = require('${key}')`
    }
  }
  _getCustomKey(file) {
    //自动实例 .js ，但不能实例 /index.js,因为那样得检查文件，浪费性能。
    let key = file
    if (!extname(file)) {
      key += '.js'
    }
    //对于内部模块，都是以.server.js结尾，所以加 .server 即可
    key = key.replace(/\.js$/, '')
    key += '.server.js'
    return key
  }
  _importToString() {
    const result = []
    for (let item of this.importInfo) {
      if (item.type !== 'js') {
        continue
      }
      if (!/^(\.|\/)/.test(item.file)) {
        result.push(this._importToNodeString(item))
      }
      else {
        result.push(this._importToCustomString(item))
      }
    }
    return result.join('\n')
  }
  _tokensToString(tokens) {
    let info = []
    for (const token of tokens) {
      let { from, to } = token
      if (from === to) {
        info.push(from)
      }
      else {
        info.push(`${from} as ${to}`)
      }
    }

    return info.join(',')
  }
  _exportToString() {
    const tokens = []
    for (const item of this.exportInfo) {
      const { from, to } = item
      tokens.push(`'${to}':${from}`)
    }
    return `module.exports = {${tokens.join(',')}}`
  }
}