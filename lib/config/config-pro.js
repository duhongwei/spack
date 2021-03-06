module.exports = {
  runtime: ['runtime/polyfill.js', 'runtime/hotload.js', 'runtime/import.js'],
  destination: "dist",
  plugins: {
    ensureString: true,
    include: true,
    resolvePath: true,
    image: true,
    version: true,
    vue: true,
    postcss: true,
    buble: true,
    parser: true,
    compileVue: true,
    node: true,
    compress: true,
    upload: true,
    htmlPro: true,
    transformPath: true
  },
  packages: [],
  runtimePlugins: {
    ensureString: true,
    version: true,
    buble: true,
    compress: true,
    upload: true

  },
  nodePlugins: {
    ensureString: true,
    version: true,
    compress: true,
    upload: true
  }
}
