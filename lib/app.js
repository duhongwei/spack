const Spack = require('../lib/spack')
const Cdn = require('../lib/cdn.js')
const { resolve, join } = require('path')
const plugin = require('./plugin')
const Dep = require('./dep')
const Version = require('./version')
const debug = require('debug')('hotpack/app')

const Logger = require('./logger')
const Runtime = require('../lib/runtime')
const Dynamic = require('../lib/dynamic')

const rm = require('rimraf')
const { existsSync, mkdirSync } = require('fs')
const { makeConfig } = require('./config')
function transformPageKey(key) {
  let keys = key.split('/')
  if (keys.length <= 1) {
    return key
  }
  keys.shift()
  if (keys[keys.length - 1] === keys[keys.length - 2] + '.html') {
    keys.splice(keys.length - 2, 1)
  }
  let result = keys.join('/')

  return result
}
function getEntry(file) {
  return file.replace('.html', '.js')
}
module.exports = class {
  constructor(specialConfig) {
    let logger = new Logger()

    let config = makeConfig(specialConfig, logger)
    debug(`directory is ${config.directory}`)
    let spack = this.spack = new Spack(config.directory)

    spack.logger = logger

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
    if (config.ignore) spack.ignore(config.ignore)
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
      spack.cdn = new Cdn(spack.destination())

    }
    this.runtime = new Runtime({
      logger,
      cdn: spack.cdn,
      directory: resolve(__dirname, '..'),
      source: 'client',
      destination: join(spack.destination()),
      version: spack.version
    })

    spack.transformPageKey = config.transformPageKey || transformPageKey
    spack.getEntry = config.getEntry || getEntry
  }
  get() {
    return this.spack
  }
  build(config) {
    return this.runtime.build()
      .then(() => {
        this.spack.logger.success('=== build runtime complete ===')
        return this.spack.build(config)
      }).then(() => {
        this.spack.logger.success('=== build app complete ===')
      })
  }
}
