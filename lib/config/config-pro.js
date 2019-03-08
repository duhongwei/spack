module.exports = {
  runtime: ['runtime/hotload.js', 'runtime/import.js'],
  destination: "dist",
  plugins: {
    ensureString: true,
    image: true,
    version: true,
    vue: true,
    buble: true,
    parser: true,
    compileVue: true,
    node: true,
    compress: true,
    upload: true,
    include: true,
    htmlPro: true
  },
  packages: []
}
