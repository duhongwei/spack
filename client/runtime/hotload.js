/*!
 * 
 * author: duhongwei
 * Released under the MIT license
 */
(function (global) {
  'use strict';
  var waitingMod = [];
  var readyMod = {};
  var hotloadKeys = []
  var logger = (function () {
    function log(msg) {
      if (global.console && global.console.log) {
        global.console.log(msg);
      }
    }

    return {
      log: log
    };
  })();
  //var onload = onreload = function () { }
  var event = {
    on: function (type, fun) {
      this._event = this._event || {};
      this._event[type] = this._event[type] || [];
      this._event[type].push(fun);
    },
    emit: function (type, data) {
      var v = true
      if (!this._event || !this._event[type]) { return v; }
      for (var i = 0, t = true; i < this._event[type].length; i++) {
        t = this._event[type][i].call(this, data);
        if (t === false) {
          v = false
        }
      }
      return v
    }
  };
  var lego = null;

  var run = (function () {
    var owner = {};
    return function (mod) {
      var thisOwner = owner[mod.key]
      var funed = map(mod.deps, function (key) {
        return readyMod[key].funed;
      })
      if (thisOwner && thisOwner.unload) {
        try {
          thisOwner.data = thisOwner.unload()
        }
        catch (e) {
          logger.log(e);
        }
      }
      mod.funed = mod.fun.apply(thisOwner || window, funed);
      setDepKeys(mod);

      if (thisOwner && thisOwner.load) {
        try {
          thisOwner.load(thisOwner.data)
        }
        catch (e) {
          logger.log(e);
        }
      }
      if (thisOwner) {
        thisOwner.isHot = true
        //只要有一个hander返回 false，就会返回false,否则返回 true
        return lego.emit('reload', mod)
      }
      else {
        owner[mod.key] = { isHot: false, data: {} }
        lego.emit('load', mod)
      }
      return true;
    }
  })();
  var dealSubDependence = (function () {
    var allDepKeys = [];
    function getAllDepKeys(mod) {
      each(mod.depKeys, function (key) {
        if (find(allDepKeys, key) === undefined) {
          allDepKeys.push(key);
        }
        getAllDepKeys(readyMod[key]);
      })
    }
    return function (mod) {
      mod.depKeys = readyMod[mod.key].depKeys;
      delete readyMod[mod.key];
      if (mod.type === 'require') {
        return;
      }
      allDepKeys = [];
      getAllDepKeys(mod);
      //logger.log('keys will update: ' + allDepKeys.join('\n'));
      each(allDepKeys, function (key) {
        var item = readyMod[key];
        delete readyMod[key];

        waitingMod.push(item);
      });
    }
  })();
  function find(arr, value) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === value) {
        return arr[i];
      }
    }
    return undefined;
  }
  function isArray(obj) {
    return Object.prototype.toString.call(obj) == "[object Array]";
  }
  function map(arr, cb) {
    var result = [];
    each(arr, function (item) {
      result.push(cb(item));
    });
    return result;
  }
  function each(obj, cb) {
    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        if (cb(obj[i]) === false) {
          return;
        }
      }
    }
    else {
      for (var key in obj) {
        if (readyMod.hasOwnProperty(key)) {
          if (cb(obj[key]) === false) {
            return;
          }
        }
      }
    }
  }
  function getLastScriptPath() {
    var path = document.scripts[document.scripts.length - 1].src.split(/[?#]/)[0];
    if (!path) {
      return false;
    }
    var pathMatch = path.match(/^https?:\/\/[^/]+\/(.+)\.js$/)
    if (pathMatch) {
      path = pathMatch[1] + '.js';
    }
    return path;
  }
  function setDepKeys(mod) {
    each(mod.deps, function (key) {
      var depKeys = readyMod[key].depKeys;
      if (find(depKeys, mod.key) === undefined) {
        depKeys.push(mod.key);
      }
    });
  }

  function checkReady(mod) {
    for (var i = 0, deps = mod.deps; i < deps.length; i++) {
      if (!deps[i]) {
        continue;
      }
      if (!(deps[i] in readyMod)) {
        return false;
      }
    }
    return true;
  }

  function fixKey(key, path) {
    if (!path) {
      return key;
    }
    if (!/^\./.test(key)) {
      return key;
    }
    var upDepth = 1;
    var regMatch = key.match(/^(\.\.\/)+(.+)$/);
    if (regMatch) {
      upDepth = regMatch[0].split('../').length;
      key = regMatch[2];
    }
    if (/^\.\//.test(key)) {
      key = key.replace('./', '');
    }
    path = path.split('/');
    path.length = path.length - upDepth;

    key = path.join('/') + '/' + key;
    return key;
  }
  function argHelper(key, deps, fun) {
    if (isArray(key)) {
      fun = deps;
      deps = key;
    }
    else if (typeof key === 'function') {
      fun = key;
      deps = [];
    }
    else if (typeof deps === 'function') {
      fun = deps;
      deps = [];
    }
    if (!isArray(deps)) {
      throw new Error('dependence must be array')
    }
    var path = getLastScriptPath();
    if (typeof key !== 'string') {

      key = path || getDefaultKey();
    }
    for (var i = 0; i < deps.length; i++) {
      deps[i] = path ? fixKey(deps[i], path) : deps[i];
    }
    return {
      deps: deps,
      fun: fun,
      key: key
    };
  }
  function dealWaiting() {
    var i = waitingMod.length;
    var mod = null;
    // eslint-disable-next-line
    while (mod = waitingMod[--i]) {
      if (checkReady(mod)) {

        dealReady(mod);
        waitingMod.splice(i, 1);
        if (mod.type === 'define') {
          i = waitingMod.length;
        }
      }
    }
  }
  function dealReady(mod) {
    var shouldDealSub = run(mod);
    if (mod.key in readyMod) {
      console && console.log(mod.key + ' loaded again')
      if (hotloadKeys.length > 20) {
        hotloadKeys = []
      }
      hotloadKeys.push(mod.key)
      shouldDealSub && dealSubDependence(mod);
    }
    else {
      setDepKeys(mod);
    }
    readyMod[mod.key] = mod;
    //for test
    readyMod.last = mod;
  }
  function excute(mod) {
    mod.depKeys = [];
    if (checkReady(mod)) {
      dealReady(mod);
      if (mod.type == 'define') {
        dealWaiting();
      }

    }
    else {
      waitingMod.push(mod);
    }

  }
  function require(key, deps, fun) {
    if (arguments.length === 1 && typeof key === 'string') {
      if (key in readyMod) {

        return readyMod[key].funed;
      }
      else {
        throw new Error(key + ' not found');
      }
    }
    var mod = argHelper(key, deps, fun);
    mod.type = 'require';
    excute(mod);
  }

  function define(key, deps, fun) {

    var mod = argHelper(key, deps, fun);
    mod.type = 'define';
    excute(mod);
  }
  function inspect() {
    return {
      waitingMod: waitingMod,
      readyMod: readyMod,
      hotloadKeys: hotloadKeys
    };
  }
  function reset() {
    waitingMod = [];
    readyMod = {};
    defineLegoMod();
  }
  function load(src, cb) {
    var script = document.createElement('script');
    script.src = src;
    if (cb) {
      script.onreadystatechange = function () {
        if (script.readyState == "loaded" || script.readyState == "complete") {
          cb();
        }
      }
      script.onload = function () {
        cb();
      }
    }
    document.body.appendChild(script);
  }
  var getDefaultKey = (function () {
    var index = 0;
    return function () {
      return 'k' + index++;
    }
  })();

  function has(filePath) {
    var key = filePath.replace('.js', '');
    return (key in readyMod);
  }

  lego = {
    version: '1.2.0',
    has: has,
    inspect: inspect,
    reset: reset,
    load: load,
    on: event.on,
    emit: event.emit
  };
  function defineLegoMod() {
    define('lego', function () {
      return lego
    });
  }
  defineLegoMod();
  global.define = define;
  //hotload.js并不是完全遵守amd
  //global.define.amd = {};
  global.require = require;
})(this);
