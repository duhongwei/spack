'use strict';
var WebSocket = require('ws');

module.exports = class {
  constructor(port, logger) {
    this.logger = logger
    this.port = port
    this.ws = null
  }
  init() {
    let wss = new WebSocket.Server({ port: this.port });
    this.logger.log('socket server run at ' + this.port)

    return new Promise(resolve => {
      wss.on('connection', newWs => {
        console.log()
        this.logger.log('socket server receive client call')
        if (this.ws) {
          this.ws.close()
          this.ws = newWs
        }
        else {
          this.ws = newWs
          resolve()
        }
        this.msg(`socket server ready at ${this.port}`, 'info')
      })
    })
  }
  msg(data, type = 'update') {
    if (!this.ws) {
      this.logger.log('socket not ready')
      return
    }
    if (this.ws.readyState !== WebSocket.OPEN) {
      this.logger.log('socket not opened')
      return
    }
    this.ws.send(JSON.stringify({
      type: type,
      data: data
    }))
  }
}