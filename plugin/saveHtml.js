const { isHtml } = require('../lib/util')
const { writeFileSync } = require('fs')
const {join}=require('path')
module.exports = function () {
  return function (files, spack) {
    spack.logger.log('run plugin saveHtml')
    let list=[]
    for (let file in files) {
      if (!isHtml(file)) continue
      list.push({
        file,
        content:files[file].contents
      })
    }
    let c = JSON.stringify(list, null, 2)
    let path=join(spack.destination(),'html.json')
    writeFileSync(path,c)
  }
}
