const { readFileSync, writeFileSync, existsSync, unlinkSync } = require('fs')
const { basename } = require('path')
const { path2key } = require('./util')
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

  get(key) {
    if (key) {
      key = path2key(key)
      if (this.has(key)) {
        if (!this.contents[key].url) {
          throw new Error(key + ' no url')
        }
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
  /**
   * 检查是否需要更新version,没有key或hash不一样，都需要更新
   * @param {string} key 
   * @param {string} hash 
   */
  shouldUpdate(key, hash) {
    if (arguments.length !== 2) {
      throw new Error('key ,hash required')
    }
    key = path2key(key)
    if (!this.contents || !this.contents[key] || this.contents[key].hash !== hash) {
      return true
    }
    return false
  }
  set(key, v) {
    if (!key || !v) {
      throw new Error('arguments error in version')
    }
    let validKey = ['hash', 'url']
    for (let vk in v) {
      if (!validKey.includes(vk)) {
        throw new Error('invalid key ' + vk)
      }
    }

    key = path2key(key)
    this.contents = this.contents || {}
    let item = this.contents[key] || {}
    if (v.hash) {
      item.hash = v.hash
    }
    if (v.url) {
      item.url = v.url
    }
    this.contents[key] = item;
  }
  remove(key) {
    key = path2key(key)
    if (key in this.contents) {
      logger.log('delete %s from version', key)
      delete this.contents[key]
    }
  }
  write() {
    if (this.contents && this.file) {
      let contents = this.contents
      contents = JSON.stringify(contents, null, 2)
      writeFileSync(this.file, contents)
    }
  }

  reset() {
    if (existsSync(this.file)) {
      unlinkSync(this.file)
    }

    this.contents = null
  }
}

module.exports = Version