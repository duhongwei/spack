/**
 * 在prepre.js会判断是否更新，并记录版本。没更新不会准备，所以不需要version插件了。
 */
const Spack = require('../spack')
const plugin = require('../plugin')
const { existsSync, mkdirSync } = require('fs')
const debug = require('debug')('hotpack/node')
const prepare = require('./prepare')
const { join } = require('path')
module.exports = class {
  constructor({ cdn, directory, dep, version, logger,alias }) {
    let nodeDeps = dep.getNode()
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
    let plugins = null
    if (process.env.NODE_ENV === 'development') {
      plugins = {
        ensureString: true,
        version:true,
      }
    }
    else {
      plugins = {
        ensureString: true,
        version:true,
        compress: true,
        upload: true
      }
    }
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