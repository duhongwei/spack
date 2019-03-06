module.exports = {
  runtime: ['runtime/hotload.js', 'runtime/debug.js'],
  "destination": "dev",
  "plugins": {
    ensureString: true,
    version: true,
    vue: true,
    buble: true,
    parser: true,
    compileVue: true,
    node: true,
    htmlDev: true
  }
}
