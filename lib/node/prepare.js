const Parser = require('@duhongwei/parser')
const { ToAmd } = require('../parser/toAmd')
const fs = require('fs')
const replace = require('../envify')
const { join, resolve } = require('path')

const debug = require('debug')('hotpack/node/prepare')

function prepare({ keys, source, logger, alias }) {
  //获取配置文件里的模块的版本号
  let wantedVersion = require(join(`${process.cwd()}/package.json`)).dependencies

  for (let key in wantedVersion) {
    let packageFile = resolve('node_modules', key, 'package.json')
    
    if (!fs.existsSync(packageFile)) {
      logger.fatal(`${packageFile} is not exsit\nmaybe you should run "npm install ${key} --save"`)
      process.exit(1)
    }
    let { version, name } = require(packageFile)

    if (wantedVersion[name] !== version) {
      logger.fatal(`node模块 ${name} 的安装版本 ${version},需要的版本是 ${wantedVersion[name]}`)
      process.exit(1)
    }
  }

  for (const key of keys) {
    //todo 处理系统模块
    let filePath = null
    const nodeKey = key.replace('node/', '').replace('.js', '')
    if (nodeKey.indexOf('/') > 0) {
      logger.fatal(`node module ${nodeKey} is not a top module`)
      process.exit(1)
    }


    //优先手动配置的 umd alias
    if (nodeKey in alias) {

      let nodeInfo = alias[nodeKey]

      filePath = join(process.cwd(), 'node_modules', nodeKey, nodeInfo.path)
      if (!fs.existsSync(filePath)) {
        logger.fatal(`maybe ${filePath} is not right\nmaybe you should run "npm install ${nodeKey} --save"`)
        process.exit(1)
      }
      let code = fs.readFileSync(filePath, 'utf8')
      let importInfo = []
      if (nodeInfo.deps && nodeInfo.deps.length > 0) {
        importInfo = nodeInfo.deps.map(item => {
          //let k = 0;
          return {
            type: 'js',
            file: item,
            token: [{ 'from': 'default', 'to': nodeInfo.publicKey ? nodeInfo.publicKey : item }]

          }
        })
      }
      let from = nodeInfo.publicKey || nodeKey
      let toAmd = new ToAmd({
        importInfo,
        exportInfo: [
          {
            from: `window['${from}']`,
            to: 'default'
          }
        ],
        code
      }, key)


      code = toAmd.toString()
      debug(`write file ${join(source, nodeKey + '.js')}`)
      fs.writeFileSync(join(source, nodeKey + '.js'), code)
      continue
    }

    
    let packageFile = resolve('node_modules', nodeKey, 'package.json')
    //读es6模块
    let modulePath = require(packageFile).module

    if (modulePath) {
      debug(`read es6 module for ${key}`)
      let code = fs.readFileSync(resolve('node_modules', nodeKey, modulePath), 'utf8')

      let parser = new Parser.Es6(code)

      let info = parser.parse()
      if (info.importInfo.length > 0) {
        logger.fatal(`esm file ${nodeKey} has dependences, can not resolve it. you have to add alias key ${nodeKey} to indicate where the umd file is `)
        process.exit(1)
      }
      let toAmd = new ToAmd(info, key)

      code = toAmd.toString()

      code = replace(code, [process.env])
      debug(`wirte file ${join(source, nodeKey + '.js')}`)
      fs.writeFileSync(join(source, nodeKey + '.js'), code)
      continue
    }
    logger.fatal(`node module ${nodeKey} has not esm module,please add alias config to indicate where the umd file is`)
    process.exit(1)
  }
}
module.exports = prepare