const { isText, isMedia, resolveES6Path } = require('../lib/util')
const { extname, } = require('path')
const debug = require('debug')('hotpack/image')
module.exports = function () {
  return function (files, { version, cdn, logger }, done) {
    const PromiseList = []
    logger.log('run plugin image')
    let textFiles = {}
    for (let file in files) {
      if (isText(file)) {
        textFiles[file] = files[file]
      }
      if (!isMedia(file)) {
        continue
      }

      if (!version.update(file, files[file].contents)) {
        debug(`remove ${file} `)
        delete files[file]
        continue
      }
   
      PromiseList.push(cdn.upload(files[file].contents, extname(file), { https: true }).then(url => {
      
        debug(`upload media ${file}=>${url}`)
        delete files[file]
        version.setUrl(file, url)
      }))
    }
    //warring: 如果在路径的名称中有 . 这个正则就失败了，先不考虑这个。非严谨匹配，为了简化
    //匹配 ../../image ../image ./image /image /pages/开头的，.jpg等图片格式结尾的地址,这样式匹配不能匹配所有路径，是一种简化，写码的时候需要遵守一定规则。就是开头提到的 5种写法
    let reg = /(\.\.\/\.\.\/\.\.\/image|\.\.\/\.\.\/image|\.{0,2}\/image|\/pages)\/[-/\\0-9a-zA-Z]+\.(jpg|jpeg|png|gif|webp|svg|eot|ttf|woff|woff2|etf|mp3|mp4|mpeg)/ig

    Promise.all(PromiseList).then(() => {

      for (let textFile in textFiles) {
        // .必须用 \\. 不然无法匹配到 .
        //公共的静态资源 在 /image目录中 路径是绝对路径，必须以 /images 开头
        textFiles[textFile].contents = textFiles[textFile].contents.replace(reg, path => {
          //必须转一下，因为这里的path可能不是绝对路径，但是server.setUrl时File是绝对的。为了一致，而且 只能用绝对，保证不冲突
         
          path = resolveES6Path(textFile, path)
          if (!version.has(path)) {
            logger.fatal(`${path} of ${textFile} not exist in version`)
            process.exit(1)
          }
          debug(`replace img of ${textFile} | ${path} => ${version.get(path).url}`)
          return version.get(path).url
        })
      }
      done()
    })
  }
}