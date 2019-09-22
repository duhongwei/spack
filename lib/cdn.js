const { md5, isMedia } = require('./util')
const { join } = require('path')
const { writeFileSync, writeFile, existsSync, readFileSync, mkdirSync } = require('fs')
const { promisify } = require('util')
const writeFileAsync = promisify(writeFile)

module.exports = class {
  constructor(dist, publicPath = '/', prePath = null) {

    if (!publicPath.endsWith('/')) {
      publicPath += '/'
    }
    if (!publicPath.startsWith('/')) {
      publicPath = '/' + publicPath
    }
    this.prePath = prePath ? `/${prePath}` : ''
    this.webFolder = `${publicPath}__cdn__`
    this.fileRoot = join(dist, this.webFolder)
    this.cacheRoot = join(dist, 'cache')
    this._ensure(dist, publicPath)
  }
  _ensure(dist, publicPath) {
    publicPath = join(dist, publicPath)
    if (!existsSync(publicPath)) {
      mkdirSync(publicPath)
    }
    if (!existsSync(this.fileRoot)) {
      mkdirSync(this.fileRoot)
    }
    if (!existsSync(this.cacheRoot)) {
      mkdirSync(this.cacheRoot)
    }
  }
  async upload(content, extname) {

    let hash = md5(content).slice(6, 22)
    let fileName = hash + extname

    if (isMedia(extname)) {
      await writeFileAsync(join(this.fileRoot, fileName), content, 'binary')
    }
    else {
      await writeFileAsync(join(this.cacheRoot, fileName), content)
    }
    return this.getUrl(hash, extname)
  }
  makeFile(hashList, extname) {

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

    return `${this.prePath}${this.webFolder}/${hash}${extname}`
  }
}
