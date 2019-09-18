var chokidar = require('chokidar');
var EventEmitter = require('events');

class Watcher extends EventEmitter {
  constructor(root) {
    super()
    let watcher = chokidar.watch(root, { ignored: /(^|[/\\])\../ });
    watcher.on('change', path => {
      if (this.handler) {
        clearTimeout(this.handler)
      }
      this.handler = setTimeout(() => {
        this.emit('change', path);
        this.handler = null
      }, 200)
    });
    watcher.on('error', error => console.log(error));
  }
}

module.exports = Watcher