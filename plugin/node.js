
const Node = require('../lib/node')
module.exports = function () {
  return function (files, spack, done) {
    spack.logger.log('run plugin node')
    const node = new Node({
      dynamic:spack.dynamic,
      alias: spack.alias,
      cdn: spack.cdn,
      dep: spack.dep,
      logger: spack.logger,
      directory: spack.destination(),
      version: spack.version
    })

    return node.build().then(() => {

      done()
    })
  }
}
