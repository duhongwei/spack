const autoprefixer = require('autoprefixer')
module.exports = {
  runtime: ['runtime/hotload.js', 'runtime/import.js'],
  destination: "dist",
  plugins: {
    ensureString: true,
    image: true,
    version: true,
    vue: true,
    //参数参见 https://github.com/postcss/postcss/blob/master/README-cn.md https://github.com/postcss/autoprefixer,https://github.com/browserslist/browserslist-example
    //https://github.com/browserslist/browserslist
    //package.json配置了Chrome 42,因为42还需要 -webkit-animation，为了安全，正好让它加上前缀。移动端只考虑webkit核心就够了。
    postcss: [autoprefixer],
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
