const { readFileSync, writeFileSync, existsSync, unlinkSync } = require('fs')
const { path2key, md5 } = require('./util')
'use strict'
function read() {
  let result = null
  if (existsSync(this.file)) {
    //avoid cache ,do not use require
    result = JSON.parse(readFileSync(this.file))
  }
  return result
}
class Version {
  constructor(file) {

    this.file = file
    this.contents = read.call(this)
  }

  [Symbol.iterator]() {
    let contents = this.contents
    let keys = Object.keys(contents || {})
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

  has(key) {
    key = path2key(key)
    if (!this.contents || !this.contents[key]) {
      return false
    }
    return true
  }
  setUrl(keyOrPath, url) {
    this.get(keyOrPath).url = url

  }
  setUpdate(keyOrPath) {
    this.get(keyOrPath).update = true
  }
  get(keyOrPath) {
    if (keyOrPath) {
      let key = path2key(keyOrPath)
      if (this.has(key)) {
        return this.contents[key]
      }
      else {
        throw new Error(key + ' not exist in version')
      }
    }
    else {
      return this.contents;
    }
  }

  update(key, content) {
    if (!key || !content) {
      throw new Error(`arguments error in version key is ${key} ,content is ${content}`)
    }
    key = path2key(key)
    this.contents = this.contents || {}
    let item = this.contents[key] || {}
    let hash = md5(content)
    if (item.hash === hash) {
      return false
    }
    item.hash = hash
    item.update = true
    this.contents[key] = item;
    return item.update
  }

  write() {
    if (this.contents && this.file) {
      let contents = this.contents
      for (const key in contents) {
        delete contents[key].update
      }
      contents = JSON.stringify(contents, null, 2)
      writeFileSync(this.file, contents)
    }
  }
  toString() {
    return `\nfile is ${this.file}
    ${JSON.stringify(this.contents, null, 2)}
    `
  }
  reset() {
    if (existsSync(this.file)) {
      unlinkSync(this.file)
    }

    this.contents = null
  }
}

module.exports = Version