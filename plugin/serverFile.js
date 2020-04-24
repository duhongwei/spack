
const serverFile = require('../lib/serverFile')
const { join } = require('path')

module.exports = function () {
  return function (files, spack, done) {
    spack.logger.log('run plugin serveFile')
    const node = new serverFile({
      logger: spack.logger,
      directory: process.cwd(),
      source: join(process.cwd(), 'server'),
      destination: spack.destination(),
      plugins: {
        ensureString: true,
        buble: {
          transform: {
            asyncAwait: false
          }
          ,
          omitFiles: function (file) {
            return !/component\//.test(file)
          }
        }
      }
    })
    return node.build().then(() => {
      done()
    })
  }
}
