/**
 * 处理流程
 * 1. 忽略非 js 文件，runtime文件，客户端的node模块的文件
 * 2. 如果是 entry （入口）文件，客户端转amd,服务端转 cmd
 * 3. 模块文件，js 文件同时生成　amd,cmd 两个文件
 */

const { FromEs6, ToAmd, ToCmd } = require('../lib/parser/index')
const { isServerJs } = require('../lib/util')
const { extname } = require('path')
module.exports = function () {

  return function (files, metalsmith) {
    const { dep, logger, runtimeFolder } = metalsmith.metadata()
    logger.log('run plugin parser', 1)
    for (let file in files) {
      if (!file.endsWith('.js')) {
        continue
      }
      //如果是runtime，不用解析，因为模块已经预先处理好
      if (new RegExp(`^${runtimeFolder}/`).test(file)) {
        continue
      }
      //如果是客户端node模块忽略
      if (/^node\//.test(file)) {
        continue
      }
      logger.log(`parseJs ${file}`)
      const fromEs6 = new FromEs6(files[file].contents)
      const info = fromEs6.parse()
      const toCmd = new ToCmd(info)
      const toAmd = new ToAmd(info, file)
      
      //入口文件
      if (/^entry\//.test(file)) {
        //如果是服务端脚本，转成cmd
        if (isServerJs(file)) {
          files[file].contents = toCmd.toString()
        }
        else {
          files[file].contents = toAmd.toString()
          dep.set(file, toAmd.getDeps())
        }
        continue
      }

      //======模块文件生成两份===
      //一份是amd文件
      files[file].contents = toAmd.toString()
      dep.set(file, toAmd.getDeps())
      let cmdFile = file
      cmdFile = file.replace('.js', '.server.js')
      //一份是cmd文件
      files[cmdFile] = {
        contents: toCmd.toString()
      }

    }
  }
}