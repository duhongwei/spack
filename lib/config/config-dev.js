module.exports = {
  runtime: ['runtime/polyfill.js', 'runtime/hotload.js', 'runtime/import.js', 'runtime/debug.js', 'runtime/socket.js', 'runtime/hotapi-vue.js', 'runtime/hotload-vue.js'],
  "destination": "dev",
  "plugins": {
    ensureString: true,
    include: true,
    resolvePath: true,
    version: true,
    vue: true,
    postcss: true,
    buble: true,
    parser: true,
    compileVue: true,
    node: true,
    htmlDev: true,
    transformPath: true,
    debug: true
  },
  "runtimePlugins": {
    ensureString: true,
    version: true,
    buble: true,
  },
  "nodePlugins": {
    ensureString: true,
    version: true
  }
}
