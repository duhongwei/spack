const Spack = require('../lib/spack')
const Cdn = require('../lib/cdn.js')
const { resolve, join } = require('path')
const plugin = require('./plugin')
const Dep = require('./dep')
const Version = require('./version')
const debug = require('debug')('hotpack/app')


const Runtime = require('../lib/runtime')
const Dynamic = require('../lib/dynamic')

const rm = require('rimraf')
const { existsSync, mkdirSync } = require('fs')


function getEntry(file) {
  return file.replace('.html', '.js')
}
module.exports = class {
  constructor(config) {
    debug(`directory is ${config.directory}`)
    const spack = this.spack = new Spack(config.directory)
   
    spack.env = config.env
    if (config.socketPort) {
      spack.socketPort = config.socketPort
    }
    const logger = config.logger
    spack.logger = config.logger
    if (config.publicPath) {
      spack.publicPath = config.publicPath
    }
    if (config.packages) {
      spack.packages = config.packages
    }
    else {
      spack.packages = []
    }

    spack.runtime = config.runtime

    if (config.source) spack.source(config.source)
    debug(`source is ${spack.source()}`)
    if (!existsSync(spack.source())) {
      logger.fatal(`${spack.source()} not exsit`)
      process.exit(1)
    }
    if (config.destination) spack.destination(config.destination)
    debug(`destination is ${spack.destination()}`)
    if (config.concurrency) spack.concurrency(config.concurrency)
    if (config.metadata) spack.metadata(config.metadata)

    if (config.frontmatter) spack.frontmatter(config.frontmatter)

    let ignoreReg = config.ignore || []
    //因为路径线可能是 \ 或 / 
    ignoreReg.unshift(/(\/|\\)include$/)
    //console.log(config.ignore)
    //process.exit()
    spack.ignore((file, stats) => {

      return ignoreReg.some(reg => {

        let r = reg.test(file)
        //console.log(r, file, reg)
        return r;
      })
    })
    spack.alias = config.alias
    const plugins = plugin.resolve(config.plugins)

    for (const plugin of plugins) {
      spack.use(plugin)
    }
    if (!existsSync(spack.destination())) {
      mkdirSync(spack.destination())
    }

    if (config.clean === true) {
      logger.info('clean up')
      rm.sync(join(spack.destination(), '*'), { glob: { dot: true } })
    }

    spack.dynamic = new Dynamic(join(spack.destination(), 'dynamic.json'))

    if (config.dep) {
      spack.dep = config.dep
    }
    else {
      let depFile = join(spack.destination(), 'dep.json')

      spack.dep = new Dep(depFile)
    }

    if (config.version) {
      spack.version = config.version
    }
    else {
      let versionFile = join(spack.destination(), 'version.json')

      spack.version = new Version(versionFile)

    }

    if (config.cdn) {
      spack.cdn = config.cdn
    }
    else {
      spack.cdn = new Cdn(spack.destination(), spack.publicPath)

    }

    this.runtime = new Runtime({
      logger,
      cdn: spack.cdn,
      directory: resolve(__dirname, '..'),
      source: 'client',
      destination: join(spack.destination()),
      version: spack.version,
      plugins: config.runtimePlugins
    })


    spack.getEntry = config.getEntry || getEntry
    spack.nodePlugins = config.nodePlugins
  }
  get() {
    return this.spack
  }
  build(config) {
    return this.runtime.build()
      .then(() => {
        this.spack.logger.success('=== build runtime complete ===')
        return this.spack.build(config)
      }).then(files => {
        this.spack.logger.success('=== build app complete ===')
        return files
      })
  }
}
