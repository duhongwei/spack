const { md5, isImage, isFont } = require('../util')

const { join } = require('path')
const { writeFileSync, writeFile, existsSync, readFileSync, mkdirSync } = require('fs')
const { promisify } = require('util')

const writeFileAsync = promisify(writeFile)

module.exports = class {
  constructor(dist, cacheRoot) {
    this.webFolder = 'cdn'
    this.fileRoot = join(dist, this.webFolder)
    this.cacheRoot = cacheRoot
    if (!existsSync(dist)) {
      mkdirSync(dist)
    }
  }
  _ensure() {
    if (!existsSync(this.fileRoot)) {
      mkdirSync(this.fileRoot)
    }
    if (!existsSync(this.cacheRoot)) {
      mkdirSync(this.cacheRoot)
    }
  }
  async upload(content, extname) {
    this._ensure()
    let hash = md5(content).slice(6, 22)
    let fileName = hash + extname

    if (isImage(extname) || isFont(extname)) {
      await writeFileAsync(join(this.fileRoot, fileName), content, 'binary')
    }
    else {
      await writeFileAsync(join(this.cacheRoot, fileName), content)
    }
    return this.getUrl(hash, extname)
  }
  makeFile(hashList, extname) {
    this._ensure()
    let hash = ''
    if (typeof hashList === 'string' || hashList.length === 1) {
      hash = hashList
    }
    else {
      hash = md5(hashList.join(''))
    }
    let distFile = join(this.fileRoot, hash + extname)
    if (existsSync(distFile)) {
      return
    }
    let dataList = []
    for (let hash of hashList) {
      dataList.push(readFileSync(join(this.cacheRoot, hash + extname)))
    }
    writeFileSync(distFile, Buffer.concat(dataList))
  }
  getUrl(hashList, extname) {
    let hash = ''
    if (typeof hashList === 'string' || hashList.length === 1) {
      hash = hashList
    }
    else {
      hash = md5(hashList.join(''))
    }

    return `/${this.webFolder}/${hash}${extname}`
  }
}
