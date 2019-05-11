const Spack = require('../spack')
const plugin = require('../plugin')
const { existsSync, mkdirSync } = require('fs')
const debug = require('debug')('hotpack/node')
const prepare = require('./prepare')
const { join } = require('path')
const { isNode } = require('../util')

module.exports = class {
  constructor({ cdn, directory, dep, version, logger, alias, dynamic,plugins }) {
    let nodeDeps = dep.getNode()

    //因为只有入口的动态dep没有记录到dep中，所以，只把把dynamic中的node dep,和dep中的node dep合起来就是全部的node dep了
    dynamic.get().forEach(item => {
      if (isNode(item) && !nodeDeps.includes(item)) {
        nodeDeps.push(item)
      }
    })
    if (nodeDeps.length === 0) {
      debug(`no node deps`)
      this.noFile = true
      return
    }
    const source = 'node_raw'
    const destination = '.'
    debug(`node directory is ${directory}`)
    debug(`node source is ${source}`)
    debug(`node destination is ${destination}`)

    const spack = new Spack(directory)
    spack.source(source)
    spack.destination(destination)
    spack.dep = dep
    spack.version = version
    spack.logger = logger
    spack.cdn = cdn
   
    
    plugins = plugin.resolve(plugins)
    for (const plugin of plugins) {
      spack.use(plugin)
    }
    this.spack = spack
    debug(`node modules ${nodeDeps}`)
    const src = spack.source()
    if (!existsSync(src)) {
      mkdirSync(src)

    }
    //文件都存在 join(src, 'node')
    const prepareSource = join(src, 'node')
    if (!existsSync(prepareSource)) {
      mkdirSync(prepareSource)
    }
    prepare({
      keys: nodeDeps,
      alias,
      source: prepareSource,
      version,
      dep,
      logger
    })

  }
  build() {
    if (this.noFile) {
      return Promise.resolve()
    }
    return this.spack.build()
  }
}