const { md5, isImage, isText } = require('../lib/util')
const { extname, sep } = require('path')
module.exports = function () {
  return function (files, metalsmith, done) {
    const { prevVersion, version, cdn, logger, imgFolder } = metalsmith.metadata()
    const PromiseList = []
    logger.log('run plugin image', 1)

    let textFiles = {}
    for (let file in files) {
      if (!isImage(file)) {
        if (isText(file)) {
          textFiles[file] = files[file]
        }
        continue
      }
      let hash = md5(files[file].contents)
      if (!prevVersion.shouldUpdate(file, hash)) {
        logger.log(`skip to upload image ${file}`)
        delete files[file]
        continue
      }
      PromiseList.push(cdn.upload(files[file].contents, extname(file), { https: true }).then(url => {
        logger.log(`upload image ${file}=>${url}`)
        delete files[file]
        version.set(file, { hash, url })
      }))

    }

    Promise.all(PromiseList).then(() => {
      for (let textFile in textFiles) {
        textFiles[textFile].contents = textFiles[textFile].contents.replace(new RegExp(`${sep}${imgFolder}${sep}[^.]+\.(jpg|jpeg|png|gif|webp|svg)`, 'ig'), path => {
          logger.log(`replace ${textFile} ${path} => ${version.get(path).url}`)
          if (version.has(path)) {
            return version.get(path).url
          }
          else {
            throw new Error(`${path} not exist`)
          }
        })
      }
      done()
    })

  }
}