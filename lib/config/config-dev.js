module.exports = {
  runtime: ['runtime/hotload.js', 'runtime/import.js', 'runtime/debug.js'],
  "destination": "dev",
  "plugins": {
    ensureString: true,
    version: true,
    vue: true,
    buble: true,
    parser: true,
    compileVue: true,
    node: true,
    include: true,
    htmlDev: true
  },
  "runtimePlugins": {
    ensureString: true,
    version: true
  },
  "nodePlugins": {
    ensureString: true,
    version: true
  }
}
