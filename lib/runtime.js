const Spack = require('./spack')
const plugin = require('./plugin')
const debug = require('debug')('hotpack/node')
module.exports = class {
  constructor({ cdn, source, directory, destination, version, logger,plugins }) {
    debug(`runtime source is ${source}`)
    const spack = new Spack(directory)
    spack.source(source)
    spack.destination(destination)
    spack.version = version
    spack.cdn = cdn
    spack.logger = logger

    plugins = plugin.resolve(plugins)

    for (const plugin of plugins) {
      spack.use(plugin)
    }
    this.spack = spack
  }
  build() {

    return this.spack.build()
  }
}