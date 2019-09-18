
//deps必须写成数组
require(['lego', 'node/vue.js', 'runtime/hotapi-vue.js'], function (lego, k) {
  var vue = k['default']
  lego.on('load', function (mod) {
    if (/\.vue\.js$/.test(mod.key)) {
      window.hotApi.createRecord(mod.key, mod.funed.default)
    }
  })
  lego.on('reload', function (mod) {
    if (/\.vue\.js$/.test(mod.key)) {
      if (mod.funed.default && 'template' in mod.funed.default) {
        var compiled = vue.compile(mod.funed.default.template);
        mod.funed.default.render = compiled.render
        mod.funed.default.staticRenderFns = compiled.staticRenderFns
      }
      window.hotApi.reload(mod.key, mod.funed.default)
      return false;
    }
    return true
  })
})