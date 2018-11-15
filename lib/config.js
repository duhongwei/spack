const { join } = require('path')

const root = process.cwd()
const { existsSync, mkdirSync } = require('fs')
const settingFolder = join(root, '.spack')
if (!existsSync(settingFolder)) {
  mkdirSync(settingFolder)
}
const runtimeFolder = 'runtime'
const devConfig = {
  versionFile: join(settingFolder, 'dev_version.json'),
  depFile: join(settingFolder, 'dev_dep.json'),
  dist: join(root, 'dev'),
  runtimeFiles: {
    [`${runtimeFolder}/hotload.js`]: 'hotload.js'
  },
  plugins: {
    ensureString: true,
    runtime: true,
    slim: true,
    buble: true,
    parser: true,
    htmlDev: true
  }
}
const productConfig = {
  versionFile: join(settingFolder, 'pro_version.json'),
  depFile: join(settingFolder, 'pro_dep.json'),
  dist: join(root, 'build'),
  cacheRoot: join(settingFolder, 'cache'),
  //压缩版本比用开发版压缩小一半，可能是他们提供的压缩版去掉了提示之类的。自己压不去研究了，直接用好了
  //要注意react react-dom版本要保持一致，否则可能报错
  runtimeFiles: {
    [`${runtimeFolder}/hotload.js`]: 'hotload.js'
  },
  //一要写key,必须写 'rutime/react.js'
  package: [
    // [`${runtimeFolder}/hotload.js`, `node/react.js`, `node/react-dom.js`, `node/redux.js`, `node/react-redux.js`, `node/react-router-dom.js`]
    [`${runtimeFolder}/hotload.js`, `node/react.js`, `node/react-dom.js`, `node/react-router-dom.js`]
  ],
  plugins: {
    ensureString: true,
    envify: true,
    image: true,
    runtime: true,
    slim: true,
    buble: true,
    parser: true,
    upload: true,
    htmlPro: true
  }
}
function get() {
  let config = null
  if (process.env.NODE_ENV === 'development') {
    config = devConfig
  }
  else {
    config = productConfig
  }
  config.imgFolder = 'pic'
  config.fontFolder = 'font'
  config.nodeFolder = 'node'
  config.runtimeFolder = runtimeFolder

  config.port = 3001
  config.drectory = root

  setLocalCdn(config)
  return config
}

function setLocalCdn(config) {
  const LocalCdn = require('./cdn')

  const cdn = new LocalCdn(config.dist, config.cacheRoot)
  cdn.isLocal = true
  config.cdn = cdn
}
module.exports = {
  get
}