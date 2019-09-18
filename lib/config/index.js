const { existsSync } = require('fs')
const { resolve } = require('path')
const debug = require('debug')('hotpack/conifg')
const debugJSon = require('debug')('hotpack-json/conifg')
const { inspect } = require('util')
function readConfig(configDir, logger) {
  let envFile = null
  if (process.env.NODE_ENV === 'development') {
    envFile = 'config-dev.js'
  }
  else {
    envFile = 'config-pro.js'
  }
  let configBase = null
  let configEnv = null
  let config = {}
  try {
    configBase = resolve(configDir, 'config-index.js')
    configEnv = resolve(configDir, envFile)
    debug(`config base file is ${configBase}`)
    if (existsSync(configBase)) {

      configBase = require(configBase)

    }
    else {
      configBase = {}
    }
    debug(`config env file is ${configEnv}`)
    if (existsSync(configEnv)) {

      configEnv = require(configEnv)

    }
    else {
      configEnv = {}
    }
    //不能用JSON.strinify因为，不是一个合法的json
    debugJSon(`configEnv is ${inspect(configEnv)}\n`)
    debugJSon(`configBase is ${inspect(configBase)}\n`)

    Object.assign(config, configBase, configEnv)
    //inspect 可以输出object详细信息,console.log只输出 object object,如果是一个json,都可以详细输出，但这是一个对象
    debugJSon(`config is ${inspect(config)}\n`)
  }
  catch (e) {
    debug(e)
    logger.fatal('读配置文件失败!')
    process.exit(1)
  }
  return config
}

module.exports = {
  makeConfig: function (specialConifg) {
    const logger = specialConifg.logger
    debug('read base config')
    let baseConfig = readConfig(__dirname, logger)
    let folder = specialConifg.folder
    if (folder === true) {
      logger.fatal(`必须指定配置文件夹`)
      process.exit(1)
    }
    debug(`read env config folder ${folder}`)
    let f = null
    if (folder) {

      f = resolve(process.cwd(), folder)
      if (!existsSync(f)) {
        logger.fatal(`你指定的配置文件夹 ${f} 不存在`)
        process.exit(1)
      }
    }
    else {
      f = resolve(process.cwd(), '.spack')
    }
    let clientConfig = readConfig(f, logger)
    let config = {
      alias: {}
    }

    debugJSon(`configSpecial is ${inspect(specialConifg)}\n`)
    Object.assign(config, baseConfig, clientConfig, specialConifg)
    config.logger = logger
    return config
  }
}