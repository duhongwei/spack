const Metalsmith = require('metalsmith')
const Deffer = require('./deffer')

const assert = require('assert')

const isObject = function (o) { return typeof o === 'object' }
const isNumber = function (o) { return typeof o === 'number' }
const isFunction = function (o) { return typeof o === 'function' }
const isString = function (o) { return typeof o === 'string' }
const debug = require('debug')('hotpack/spack')
const debugJson = require('debug')('hotpack-json/spack')
module.exports = class extends Metalsmith {
  constructor(dir = '.') {
    debug(`init spack ,director is ${dir}`)
    super(dir)
    this.clean(false)
  }
 /*  get themes() {
    if (!this._themes) {
      throw new Error('invalid themes')
    }
    return this._themes

  }
  set themes(_themes_) {
    assert(isObject(_themes_), 'you must pass an object')
    this._themes = _themes_
  } */
  get env() {
    if (!this._env) {
      throw new Error('invalid env')
    }
    return this._env
  }
  set env(_env_) {
    assert(isString(_env_), 'you must pass a string')
    this._env = _env_
  }
  get socketPort() {
    return this._socketPort ? this._socketPort : false
  }
  set socketPort(port) {
    assert(isNumber(port), 'you must pass a number')
    this._socketPort = port
  }

  get getEntry() {
    return this._getEntry
  }
  set getEntry(entry) {
    assert(isFunction(entry), 'you must pass a function')
    this._getEntry = entry
  }

  get runtime() {
    return this._runtime
  }

  set runtime(runtime) {

    assert(isObject(runtime), 'You must pass an object.')
    this._runtime = runtime
  }
  get prePath() {
    return this._prePath
  }

  set prePath(prePath) {
    assert(isString(prePath), 'You must pass an string.')
    this._prePath = prePath
  }
  get publicPath() {
    return this._publicPath
  }

  set publicPath(publicPath) {
    assert(isString(publicPath), 'You must pass an string.')
    this._publicPath = publicPath
  }
  get dynamic() {
    return this._dynamic
  }
  set dynamic(dynamic) {
    assert(isObject(dynamic), 'You must pass an object.')
    this._dynamic = dynamic
  }
  get alias() {
    return this._alias
  }
  set alias(alias) {

    assert(isObject(alias), 'You must pass an object.')
    this._alias = alias
  }
  get logger() {
    return this._logger
  }
  set logger(logger) {

    assert(isObject(logger), 'You must pass an object.')
    this._logger = logger
  }
  get nodePlugins() {
    return this._nodePlugins || []
  }
  set nodePlugins(p) {
    assert(isObject(p), 'You must pass an object.')
    this._nodePlugins = p
  }


  get packages() {
    return this._packages || []
  }
  set packages(p) {
    assert(isObject(p), 'You must pass an object.')
    this._packages = p
  }
  get dep() {
    return this._dep
  }
  set dep(dep) {
    assert(isObject(dep), 'You must pass a dep object.')
    this._dep = dep
  }
  get img() {
    return 'image'
  }

  get version() {
    return this._version
  }
  set version(version) {
    assert(isObject(version), 'You must pass a version object.')
    this._version = version
  }
  get cdn() {
    return this._cdn
  }
  set cdn(cdn) {
    assert(isObject(cdn), 'You must pass a cdn object.')
    assert('upload' in cdn, 'upload method is required')
    assert('getUrl' in cdn, 'getUrl method is required')
    this._cdn = cdn
  }

  build() {
    let d = new Deffer()
    super.build((err, files) => {
      if (err) {
        console.error(err)
        return
      }
      if (this.version) {
        debugJson(`write version,${this.version}`)
        this.version.write()
      }
      if (this.dep) {
        debugJson(`write dep,${this.dep}`)
        this.dep.write()
      }
      if (this.dynamic) {
        debugJson(`write dynamic,${this.dynamic}`)
        this.dynamic.write()
      }

      d.resolve(files)
    })
    return d.p
  }
}