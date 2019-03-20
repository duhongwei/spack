const { path2key } = require('./util')
const { extname } = require('path')


function doDynamic(common, dep, dynamic) {
  if (!dynamic || dynamic.length <= 0) {
    return false
  }
  let result = {}
  for (const key of dynamic) {
    let thisDeps = dep.getByEntry(key).filter(item => !common.includes(item))
    result[key] = thisDeps
  }
  // return JSON.stringify(result)
  return result
}
function getEntry(file) {
  return path2key(file).replace(/\.(html|tpl)$/, '.js')
}
/**
 * data=['a.js','b.js','c.css'],packages=[] => [ [a.js,b.js],[c.css] ]
 * data=['a.js','b.js','c.css'],packages=[[a.js,1.js]] => [ [a.js,1.js],[b.js],[c.css] ]
 * @param {*} data 
 * @param {*} packages 
 */
function doPackage(data, packages) {

  if (!Array.isArray(data) || data.length === 0) {
    return [[]]
  }

  let result = [];

  for (let item of packages) {
    if (data.some(d => item.includes(d)))
      result.push(item);
    data = data.filter(d => !item.includes(d))
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
    if (styles.length > 0) {
      result.push(styles)
    }
    if (scripts.length > 0) {
      result.push(scripts)
    }
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

module.exports = {

  doDynamic,
  getDynamicDeps,
  getUrl,
  render,
  doPackage,
  getEntry
}