const { path2key } = require('./util')
const { extname, join, dirname } = require('path')
const { existsSync } = require('fs')
/**
 * 检查两个数组数据是否有交集
 * @param {array} a1 
 * @param {array} a2 
 */
function intersection(a1, a2) {
  return a1.some(item => {
    return a2.includes(item)
  })
}
/**
 * 把 removeData 数据从 data 中去除
 * [1,2,3],[2,3]=>[1]
 * [1,2,3],[1,2]=>[3]
 * @param {array} data 
 * @param {array} removeData 
 */
function filter(data, removeData) {
  return data.filter(item => {
    return !removeData.includes(item)
  })

}

function getEntry(file) {
  return path2key(file).replace(/\.(html|tpl)$/, '.js')
}
//packages中的必须是key,而不仅仅是一个文件名
function doPackage(data, packages) {

  if (!Array.isArray(data) || data.length === 0) {
    return [[]]
  }

  let result = [];

  for (let package of packages) {

    if (intersection(data, package)) {
      result.push(package);
      data = filter(data, package)
    }
  }
  if (data.length > 0) {
    let scripts = []
    let styles = []
    for (const item of data) {
      if (extname(item) === '.js') {
        scripts.push(item)
      }
      if (extname(item) === '.css') {
        styles.push(item)
      }
    }
    result.push(styles)
    result.push(scripts)
  }
  return result
}

//data like [...]
function render(html, data) {
  let scripts = []
  let styles = []
  for (const item of data) {
    if (extname(item) === '.js') {
      scripts.push(`<script src="${item}"></script>`)
    }
    if (extname(item) === '.css') {
      styles.push(`<link rel="stylesheet" href="${item}">`)
    }
  }
  return html.replace('</body>', `${scripts.join('\n')}\n</body>`).replace('</head>', `${styles.join('\n')}\n</head>`)
}

function appendScript(html, script) {
  script = `<script>${script}</script>\n`
  return html.replace('</body>', script + '</body>')
}
function prependScript(content, script) {
  script = `<script>${script}</script>\n`
  return content.replace('</head>', script + '</head>')
}

/**
 * 
 * @param {object} dep dep instance
 * @param {array} dynamicDep this html file 's dynamic deps
 * 
 * reutrn array
 */
function getDynamicDeps(dep, dynamicDep) {
  const result = {}
  if (dynamicDep.length === 0) {
    return result
  }
  for (const key of dynamicDep) {
    let deps = dep.getByEntry(key)
    //sepereate css,js
    let styles = []
    let scripts = []
    for (const dep of deps) {
      if (extname(dep) === '.css') {
        styles.push(dep)
      }
      if (extname(dep) === '.js') {
        scripts.push(dep)
      }
    }
    result[key] = [styles, scripts]
  }
  return result
}
//data like [[],[]]
function makeFile(data, version, cdn) {

  if (cdn.isLocal()) {
    for (const item of data) {
      let hashs = item.map(key => {
        return version.get(key).svpath
      })
      cdn.get().makeFile(hashs, extname(item[0]))
    }
  }
}

function getUrl(data, version = null, cdn = null) {
  return data.reduce((prev, current) => {
    if (current.length === 0) return prev
    let hashs = current.map(key => {
      return version.get(key).svpath
    })

    prev.push(cdn.getUrl(hashs, extname(current[0])))

    return prev
  }, [])
}
function getPageConfig(srcPath, file) {
  let filePath = join(srcPath, dirname(file), 'config.js')
  let config = {}
  if (existsSync(filePath)) {
    config = require(filePath)
  }
  return config
}
module.exports = {
  getPageConfig,
  makeFile,
  getDynamicDeps,
  getUrl,
  render,
  doPackage,
  getEntry,
  appendScript,
  prependScript
}