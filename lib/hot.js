const Wather = require('./watcher')
const Socket = require('./websocket')
const { run } = require('./app')
const { path2key } = require('./util')

const App = require('./app')
'use strict'
async function init(source, port, logger) {
  const socket = new Socket(port, logger)
  await socket.init()

  new Wather(source).on('change', srcPath => {

    if (!/\.(css|js|vue|jsx)$/.test(srcPath)) {
      socket.msg(null, 'refresh')
    }
    else {

      const config = {
        clean: false,
        runtime: [],
        logger,
        alias: {},
        nodePlugins: [],
        destination: "dev",
        "plugins": {
          ensureString: true,
          include: true,
          resolvePath: true,
          version: true,
          vue: true,
          postcss: true,
          buble: true,
          parser: true,
          compileVue: true

        },
      }
      const app = new App(config)
      app.build().then(files => {
        files = Object.keys(files).filter(file => {
          if (/\.html$/.test(file)) {
            return false
          }
          else {
            return true
          }
        })
        for (let file of files) { 
          socket.msg('/' + path2key(file))
          logger.log(`call client ${path2key(file)}`)
          logger.log('hot build end === \n')
        }
       
      })
        .catch(e => {
          socket.msg(e.message, 'error')
        })
    }
  })
}
module.exports = {
  init
}
