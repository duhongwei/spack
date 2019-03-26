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
    // "browserslist": ["Chrome >= 28"]在项目里需要标明，因为chrome 28刚好需要 flex加　-webkit- 在项目的根目录 用npx browserlist来查看设置有没有生效
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
