/** 
 * must run at project root path
*/
const { existsSync } = require('fs')
const path = require('path')

function normalize(obj) {
  if (obj instanceof Array) return obj;
  let ret = [];

  for (let key in obj) {
    let plugin = {};
    plugin[key] = obj[key];
    ret.push(plugin);
  }

  return ret;
}
function resolve(plugins) {
  let result = []
  plugins = normalize(plugins)

  for (let plugin of plugins) {
    for (let name in plugin) {
      let opts = plugin[name];
      if (typeof opts === 'function') {
        result.push(opts)
        continue
      }
      //内置
      let pluginPath = path.resolve(__dirname, '..', 'plugin', name + '.js')

      if (existsSync(pluginPath)) {
        if (opts === true) {
          opts = {}
        }
        let fun = require(pluginPath)
        fun = fun(opts)
        result.push(fun)
      }
      else {
        throw new Error('can not resolve plugins ' + pluginPath)
      }
    }
  }

  return result
}

module.exports = {
  resolve,
  normalize
}