const { unlinkSync, writeFileSync, readFileSync, existsSync } = require('fs')

const { dirname } = require('path')
const { path2key, isNode } = require('./util')
function read() {
  let result = {}
  if (existsSync(this.file)) {
    result = JSON.parse(readFileSync(this.file))
  }
  return result
}

class Dep {
  constructor(file) {
    this.file = file
    this.data = read.call(this)
  }
  [Symbol.iterator]() {
    let data = this.data
    let keys = Object.keys(data)
    let index = -1
    return {
      next: function () {
        index++
        if (index < keys.length) {
          return {
            value: keys[index],
            done: false
          };
        }
        else {
          return {
            value: undefined,
            done: true
          };
        }
      }
    };
  }
  getByEntry(entry) {
    let data = this.data
    
    function getDep(entry) {
      let result = [];
    
      result.push(entry)
      let deps = data[entry]
      if (deps) {
        for (let dep of deps) {
          result = result.concat(getDep(dep))
        }
      }
      return result
    }
    let deps = getDep(entry);
    return [...new Set(deps)]
  }
  getNode() {
    let result = []
    for (const key in this.data) {
      //node模块的依赖，忽略，这里要的不是node模块依赖的node模块。
      if (isNode(key)) {
        continue
      }
      for (const item of this.data[key]) {
        if (isNode(item)) {
          result.push(item)
        }
      }
    }
    return [...new Set(result)]
  }
  get(key) {
    if (key) {
      return this.data[key]
    }
    else {
      return this.data
    }
  }
  remove(key) {
    if (key in this.data) {

      delete this.data[key]
    }
  }

  set(key, value) {
    if (arguments.length != 2) {
      throw new Error('arguments error')
    }
    if (!Array.isArray(value)) {
      value = [value]
    }
    value = value.map(item => path2key(item))
    this.data = this.data || {}
    this.data[path2key(key)] = value
  }

  reset() {
    if (existsSync(this.file)) {
      unlinkSync(this.file)
    }
    this.data = {}
  }
  write() {

    if (existsSync(dirname(this.file))) {

      writeFileSync(this.file, JSON.stringify(this.data, null, 2))
    }
  }
  toString() {
    return `\nfile is ${this.file}
    ${JSON.stringify(this.data, null, 2)}
    `
  }
}

module.exports = Dep