module.exports = {
  clean: false,
  directory: process.cwd(),
  alias: {
    'axios': {
      path: 'dist/axios.js'
      //publicKey:axios,和key相同可以不写
    },
    'react-dom': {
      path: 'umd/react-dom.development.js',
      publicKey: 'ReactDOM',
      deps: ['react']
    },
    'react': {
      path: 'umd/react.development.js',
      publicKey: 'React'
    }
  },
}