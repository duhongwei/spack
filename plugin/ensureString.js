
const { isText } = require('../lib/util')
const debug=require('debug')('hotpack/enstrureString')
module.exports = function () {
  return function (files) {
    debug('run plugin enstrureString')
    for (let file in files) {
      if (isText(file)) {
        files[file].contents = files[file].contents.toString('utf8').replace(/\r\n/g,'\n')
      }
    }
  }
}