const acorn = require('acorn')
const walk = require('acorn-walk')

module.exports = class {
  constructor(code) {
    this.ast = acorn.parse(code, { sourceType: 'module' })
    this.code = code
    this.delPosition = []
  }
  parse() {
    const importInfo = this._parseImport()
   
    let exportInfo = this._parseExport()
    const mergeInfo = this._parseExportFromImport()

    const code = this._delCode()

    //转换复合写法,其实 复合写法只可能有一条数据，有时间优化一下
    for (const item of mergeInfo) {
      importInfo.push({
        type: 'js',
        file: item.file,
        token: item.importToken
      })
      exportInfo = exportInfo.concat(item.exportToken)
    }
    return {
      importInfo,
      exportInfo,
      code
    }
  }
  //================
  _delCode() {
    let code = ''
    let start = 0
    let end = 0

    const delPosition = this.delPosition.sort((a, b) => {
      if (a[0] > b[1]) {
        return 1
      }
      else {
        return -1
      }
    })
    for (const item of delPosition) {
      end = item[0]
      code += this.code.slice(start, end)
      start = item[1]
      if (item[2]) {
        code += item[2]
      }

    }

    code += this.code.slice(start)
    return code

  }
  _parseImport() {
    var importInfo = []
    var that = this
    walk.simple(this.ast, {
      ImportDeclaration(node) {
        let file = node.source.value
        let type = 'js'
        let token = that._parseSpecifiers(node.specifiers)
        if (node.specifiers.length === 0) {
          if (file.endsWith('.css')) {
            type = 'css'
          }
        }
        if (type === 'js' && token.length === 0) {
          throw new Error('no support "import module"')
        }
        importInfo.push({
          type,
          file,
          token
        })

        that.delPosition.push([node.start, node.end])
      }
    })
    return importInfo
  }
  _parseExport() {
    let exportList = []
    var getKey = (function () {
      var index = 0;
      return function () {
        return '_k_' + index++
      }
    })()
    const that = this

    walk.simple(this.ast, {
      ExportDefaultDeclaration(node) {

        let delStart = node.start
        let delEnd = node.declaration.start
        let key = getKey()
        that.delPosition.push([delStart, delEnd, `var ${key}=`])
        exportList.push({
          from: key,
          to: 'default'
        })
      },
      ExportNamedDeclaration(node) {
        let delStart = node.start
        let delEnd = node.end
        //形如 export var a=1
        if (node.specifiers.length === 0) {
          delEnd = delStart + 6
        }
        let result = that._parseNamedDeclarationNode(node)
        if (result) {
          that.delPosition.push([delStart, delEnd])
          exportList = exportList.concat(result)
        }
      }
    })
    return exportList
  }
  _parseSpecifiers(specifiers) {
    let token = []
    for (const item of specifiers) {
      switch (item.type) {
        case 'ImportDefaultSpecifier':
          token = [{ from: 'default', to: item.local.name }]
          break
        case 'ImportSpecifier':
          token.push({
            from: item.imported ? item.imported.name : item.local.name,
            to: item.local.name
          })
          break;
        case 'ImportNamespaceSpecifier':
          token.push({
            from: '*',
            to: item.local.name
          })
          break;
        case 'ExportSpecifier':
          token.push({
            from: item.local.name,
            to: item.exported.name
          })
          break
        default:
          throw new Error('不支持 ' + item.type)
      }
    }
    return token
  }
  _parseNamedDeclarationNode(node) {
    let result = []
    //import export复合写法在 parseExportFromImport 中处理
    if (node.source) {
      return false
    }
    if (node.declaration) {
      let id = null
      switch (node.declaration.type) {
        case 'VariableDeclaration':
          id = node.declaration.declarations[0].id.name
          break;
        case 'FunctionDeclaration':
        case 'ClassDeclaration':
          id = node.declaration.id.name
          break
        default:
          break
      }
      result.push({ from: id, to: id })
    }
    else if (node.specifiers.length > 0) {
      for (const item of node.specifiers) {
        result.push({
          from: item.local.name,
          to: item.exported.name
        })
      }
    }
    return result
  }
  _parseExportFromImport() {
    const mergeList = []
    //国为default不能做变量名，所以加一个中间变量做中转，为了保持一致，简化程序，其它的情况也统一加中转
    var getKey = (function () {
      var index = 0;
      return function () {
        return '_z_' + index++
      }
    })()
    const that = this
    walk.simple(this.ast, {
      ExportNamedDeclaration(node) {
        //判断是不是复合写法
        if (!node.source) {
          return
        }
        let delStart = node.start
        let delEnd = node.end
        let token = that._parseSpecifiers(node.specifiers)

        let importToken = []
        let exportToken = []
        for (let item of token) {
          let key = getKey()
          importToken.push({
            from: item.from,
            to: key
          })
          exportToken.push({
            from: key,
            to: item.to
          })
        }
        mergeList.push({
          file: node.source.value,
          importToken: importToken,
          exportToken: exportToken
        })
        that.delPosition.push([delStart, delEnd])
      },
      ExportAllDeclaration() {
        throw new Error('不支持导出全部的复合写法')
      }
    })
    return mergeList
  }

}
