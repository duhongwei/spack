// const Logger = require('../../lib/logger')
require(['lego', 'runtime/debug.js'], function (lego, debug) {
  'use strict';
  function format(tpl) {
    var args = arguments;
    return tpl.replace(/{(\d)}/g, function () {
      return args[+arguments[1] + 1].toString();
    });
  }
  var handler = {
    js: function (path) {
      path = path + '?t=' + new Date().getTime();
      lego.load(path, function () {
        debug.run()
      });
    },
    css: function (path) {
      var linkNode = document.createElement('link');
      linkNode.rel = 'stylesheet';
      linkNode.href = path + '?t=' + Date.now();
      var links = document.getElementsByTagName('link');
      for (let i = 0; i < links.length; i++) {
        if (links[i].href.indexOf(path) > -1) {
          links[i].parentNode.replaceChild(linkNode, links[i])
          break
        }
      }
    }
  };
  function deal(filePath) {
    var match = filePath.match(/\.(\w+)$/);
    if (!match) {
      return false;
    }
    var subfix = match[1];

    window.setTimeout(function () {
      if (subfix in handler) {
        handler[subfix](filePath);
      }
      else {
        window.location.href = window.location.href
      }

    }, 200);
  }
  function run(uri) {
    if (!window.WebSocket) {
      console.log('WebSocket no supported!');
      return;
    }
    var ws = new WebSocket(uri);
    ws.onopen = function (e) {
      console.log("connection open ...");
      ws.send('ready');
    };
    ws.onmessage = function (e) {
      var data = JSON.parse(e.data);
      var message = '';
      var timeString = new Date().toTimeString().split(/\s+/)[0];
      if (data.type === 'refresh') {
        window.location.href = window.location.href
      }
      if (data.type !== 'update') {
        console.log(format('[{0}]\t{1}', data.type, data.data));
        return;
      }
      var filePath = data.data;
      if (!(/\.(js|css|html|htm)$/.test(filePath))) {
        return;
      }
      message = format('[apply]\t{0}\t{1}', filePath, timeString);

      deal(filePath);

      console.log(message);
    };
    ws.onclose = function (e) {
      console.log('connection closed');
      if (e.data) {
        console.log(e.data)
      }
    };
  }
  window._socketPort_ && run('ws://' + window.location.hostname + ':' + window._socketPort_);
});