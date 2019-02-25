const { isImage, isText, isFont } = require('../lib/util')
const { extname, sep } = require('path')
const debug = require('debug')('hotpack/image')
module.exports = function () {
  return function (files, { version, cdn, logger, img, font }, done) {
    const PromiseList = []
    logger.log('run plugin image')
    let textFiles = {}
    for (let file in files) {
      if (isText(file)) {
        textFiles[file] = files[file]
      }
      if (!isImage(file) && !isFont(file)) {
        continue
      }

      if (!version.update(file, files[file].contents)) {

        delete files[file]
        continue
      }
      PromiseList.push(cdn.upload(files[file].contents, extname(file), { https: true }).then(url => {
        debug(`upload image ${file}=>${url}`)
        delete files[file]
        version.setUrl(file, url)
      }))
    }
    Promise.all(PromiseList).then(() => {
      for (let textFile in textFiles) {
        //.必须用 \\.
        textFiles[textFile].contents = textFiles[textFile].contents.replace(new RegExp(`${sep}${img}${sep}[^.]+\\.(jpg|jpeg|png|gif|webp|svg)`, 'ig'), path => {
          debug(`replace img ${textFile} ${path} => ${version.get(path).url}`)

          return version.get(path).url
        })

        textFiles[textFile].contents = textFiles[textFile].contents.replace(new RegExp(`${sep}${font}${sep}[^.]+\\.(eot|ttf|woff|woff2|etf|svg)`, 'ig'), path => {
          debug(`replace font ${textFile} ${path} => ${version.get(path).url}`)
      
          return version.get(path).url
        })
      }
      done()
    })
  }
}