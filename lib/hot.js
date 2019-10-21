const Wather = require('./watcher')
const Socket = require('./websocket')
const { path2key, isLess } = require('./util')
const { makeHotConfig } = require('./config')
const App = require('./app')
'use strict'
async function init(source, port, logger, folder) {
  const socket = new Socket(port, logger)
  await socket.init()

  new Wather(source).on('change', srcPath => {

    if (!/\.(css|js|vue|jsx|less|ts)$/.test(srcPath)) {
      socket.msg(null, 'refresh')
    }
    else {

      const config = makeHotConfig({
        logger,
        folder,
        env: 'dev'
      })
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
          if (isLess(file)) {
            file = `${file}.css`
          }
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
