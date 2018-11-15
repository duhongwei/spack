const FromEs6 = require('../../lib/parser/fromEs6')
const ToAmd = require('../../lib/parser/toAmd')
const assert = require('assert')
describe('toAmd', () => {
  describe('path to key', () => {
    it('all forms of path to key', () => {
      //本测试与这里的语句 'import a from "a.js"' 无关
      const fromEs6 = new FromEs6('import a from "a.js"')
      let src = fromEs6.parse()
      const toAmd = new ToAmd(src, 'a/c.js')
      //测试 path 参数
      let from = toAmd._pathToKey('a.js')
      let to = 'node/a.js'
      assert.equal(from, to)
      from = toAmd._pathToKey('a')
      to = 'node/a.js'
      assert.equal(from, to)
      from = toAmd._pathToKey('./b.js')
      to = 'a/b.js'
      assert.equal(from, to)
      from = toAmd._pathToKey('/b.js')
      to = 'b.js'
      assert.equal(from, to)
      from = toAmd._pathToKey('../b.js')
      to = 'b.js'
      assert.equal(from, to)
      assert.throws(() => {
        toAmd._pathToKey('../../b.js')
      })
    })
  })
  describe('import to token', () => {
    it('import default', () => {
      const fromEs6 = new FromEs6('import a from "/a.js"')
      let src = fromEs6.parse()
      const toAmd = new ToAmd(src)
      let from = toAmd._importToToken()
      let to = {
        deps: '"a.js"',
        token: '_k_0',
        subtoken: 'var a=_k_0["default"];'
      }
      assert.deepEqual(from, to)
    })
    it('import named key', () => {
      const fromEs6 = new FromEs6('import {a} from "/a.js"')
      let src = fromEs6.parse()
      const toAmd = new ToAmd(src)
      let from = toAmd._importToToken()
      let to = {
        deps: '"a.js"',
        token: '_k_0',
        subtoken: 'var a=_k_0["a"];'
      }
      assert.deepEqual(from, to)
    })
    it('import named key(a as b)', () => {
      const fromEs6 = new FromEs6('import {a as b} from "/a.js"')
      let src = fromEs6.parse()
      const toAmd = new ToAmd(src)
      let from = toAmd._importToToken()
      let to = {
        deps: '"a.js"',
        token: '_k_0',
        subtoken: 'var b=_k_0["a"];'
      }
      assert.deepEqual(from, to)
    })
    it('import * ', () => {
      const fromEs6 = new FromEs6('import * as a from "/a.js"')
      let src = fromEs6.parse()
      const toAmd = new ToAmd(src)
      let from = toAmd._importToToken()
      let to = {
        deps: '"a.js"',
        token: '_k_0',
        subtoken: 'var a=_k_0;'
      }
      assert.deepEqual(from, to)
    })
    it('imports', () => {
      const fromEs6 = new FromEs6('import a from "/a.js";import b from "/b.js"')
      let src = fromEs6.parse()
      const toAmd = new ToAmd(src)
      let from = toAmd._importToToken()
      let to = {
        deps: '"a.js","b.js"',
        token: '_k_0,_k_1',
        subtoken: 'var a=_k_0["default"];var b=_k_1["default"];'
      }
      assert.deepEqual(from, to)
    })
  })
  describe('export to string', () => {
    it('export default', () => {
      const fromEs6 = new FromEs6('export default 1')
      let src = fromEs6.parse()
      const toAmd = new ToAmd(src)
      let from = toAmd._exportToString()
      let to = "return {default:_k_0};"
      assert.equal(from, to)
    })
    it('export object', () => {
      const fromEs6 = new FromEs6('export {a,b}')
      let src = fromEs6.parse()
      const toAmd = new ToAmd(src)
      let from = toAmd._exportToString()
      let to = "return {a:a,b:b};"
      assert.equal(from, to)
    })
  })
})