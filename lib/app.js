
const Metalsmith = require('metalsmith')
const { unlinkSync, existsSync } = require('fs')
const Dep = require('./dep')
const plugin = require('./plugin')
const { basename } = require('path')
const config_ = require('./config')
const Version = require('./version')
const Logger = require('./logger')

let _commander = null
function setCommander(commander) {
  _commander = commander
}
function run(opts = {}) {
  const config = config_.get()
  const logger = new Logger()
  let noCache = _commander.noCache

  if (opts.noCache !== undefined) {
    noCache = opts.noCache
  }

  let resolve = null
  const promise = new Promise((_reslove) => {
    resolve = _reslove
  })
  logger.log(`pack ${process.cwd()}`, 1)
  //clean
  if (noCache) {
    if (existsSync(config.depFile)) {
      logger.log(`rm ${config.depFile}`)
      unlinkSync(config.depFile)
    }
    if (existsSync(config.versionFile)) {
      logger.log(`rm ${config.versionFile}`)
      unlinkSync(config.versionFile)
    }
  }

  let metadata = {
    imgFolder: config.imgFolder,
    fontFolder: config.fontFolder,
    runtimeFolder: config.runtimeFolder,
    nodeFolder:config.nodeFolder,
    dep: new Dep(config.depFile),
    runtimeFiles: config.runtimeFiles,
    prevVersion: new Version(config.versionFile),
    version: new Version(config.versionFile),
    cdn: config.cdn,
    logger,
    package: config.package
  }
  const metalsmith = Metalsmith(config.drectory)

  metalsmith.clean(noCache)
  metalsmith.destination(config.dist)

  metalsmith.metadata(metadata)
  metalsmith.ignore(file => {
    if (/^\./.test(basename(file))) {
      return true
    }
    else {
      return false
    }
  })
  const plugins = plugin.resolve(config.plugins)

  for (const plugin of plugins) {
    metalsmith.use(plugin)
  }
  metalsmith.build(function (err, files) {
    if (err) {
      //注意，不能这么写console.log(JSON.stringify(err))因为这样什么也不会显示，只会显示 {} 必须要throw，
      //console.log(Object.keys(err)) 打印[]
      //但是inspect 会打出错误。console.log(require('util').inspect(err))
      //先 throw 等有机会研究下
      throw err
    }
    const { dep, version } = metalsmith.metadata()
    dep && dep.write()
    version && version.write()
    resolve(config)
    logger.success('=== build ===')
  });
  return promise
}
module.exports = {
  run,
  setCommander
}