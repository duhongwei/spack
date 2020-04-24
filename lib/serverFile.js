const Spack = require('./spack')
const debug = require('debug')('hotpack/serverFile')
const plugin =require('./plugin')
module.exports = class {
  constructor({ source, directory, destination, logger, plugins, webFolders }) {
    debug(`serverfile source is ${source}`)
    const spack = new Spack(directory)
    spack.source(source)
    spack.destination(destination)
    spack.logger = logger
    spack.metadata({
      webFolders
    })
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