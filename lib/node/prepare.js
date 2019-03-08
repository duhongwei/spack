const Parser = require('@duhongwei/parser')
const { ToAmd } = require('../parser/toAmd')
const fs = require('fs')
const replace = require('../envify')
const { join, resolve } = require('path')

const debug = require('debug')('hotpack/node/prepare')

function prepare({ keys, source, logger, alias }) {

  for (const key of keys) {
    //todo 处理系统模块
    let filePath = null
    const nodeKey = key.replace('node/', '').replace('.js', '')
    if (nodeKey.indexOf('/') > 0) {
      logger.fatal(`node module ${nodeKey} is not a top module`)
      process.exit(1)
    }
    //如果目标文件存在，不处理
    if (fs.existsSync(join(source, nodeKey + '.js'))) {
      debug(`node module ${nodeKey} exist omit`)
      continue
    }
    let packageFile = resolve('node_modules', nodeKey, 'package.json')

    if (!fs.existsSync(packageFile)) {
      logger.fatal(`${packageFile} is not exsit\nmaybe you should run "npm install ${nodeKey} --save"`)
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
    /* try {
      filePath = require.resolve(nodeKey, { paths: [process.cwd()] })
    }
    catch (e) {
      logger.info(e.message)
      logger.fatal(`maybe you should run "npm install ${nodeKey} --save"`)
      process.exit(1)
    }

    let code = fs.readFileSync(filePath, 'utf8')

    logger.log(`prepare node ${nodeKey}`)
    debug(`deal node module ${nodeKey}`)
    code = replace(code, [process.env])
    let parser = new Parser.Cmd(code)
    let info = parser.parse()

    if (info.link) {

      filePath = join(dirname(filePath), info.link)
      debug(`read node link file ${filePath}`)
      code = fs.readFileSync(filePath, 'utf8')
      code = replace(code, [process.env])
      parser = new Parser.Cmd(code)
      info = parser.parse()

    }

    let toAmd = new ToAmd(info, key)
    code = toAmd.toString()
    dep.set(key, toAmd.getDeps())
    debug(`wirte file ${join(source, nodeKey + '.js')}`)
    fs.writeFileSync(join(source, nodeKey + '.js'), code)
    let nodeKeys = filterDep(info.importInfo, logger)
    prepare({ keys: nodeKeys, source, version, dep }) */
  }
}
/* function filterDep(importInfo, logger) {
  let result = []
  for (let { file } of importInfo) {
    //如果是引用内部文件，说明导出的不是一个单独的文件
    if (/^[./]/.test(file)) {
      logger.fatal(`${file} 引用内部文件，暂时不能处理`)
      process.exit(1)
    }
    //如果是内部文件也直接报错
    if (['fs', 'http', 'path'].includes(file)) {
      logger.fatal(`${file} 引用系统模块，暂时不能处理`)
      process.exit(1)
    }
    result.push(file)
  }
  return result
} */
//把转好的es6文件放在source文件夹
module.exports = prepare