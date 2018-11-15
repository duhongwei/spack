const FromEs6 = require('../../lib/parser/fromEs6')
const ToCmd = require('../../lib/parser/toCmd')
const assert = require('assert')
describe('toCmd', () => {
  describe('import to string', () => {
    it('import default key', () => {
      const fromEs6 = new FromEs6('import a from "a.js"')

      let src = fromEs6.parse()
      const toCmd = new ToCmd(src)
      let from = toCmd._importToString()
      let to = "const a = require('a.js')['default']"
      assert.equal(from, to)
    })
    it('import named key', () => {
      const fromEs6 = new FromEs6('import {a} from "a.js"')

      let src = fromEs6.parse()
      const toCmd = new ToCmd(src)
      let from = toCmd._importToString()
      let to = "const { a } = require('a.js')"
      assert.equal(from, to)
    })
    it('import named key(a as b)', () => {
      const fromEs6 = new FromEs6('import {a as b} from "a.js"')

      let src = fromEs6.parse()
      const toCmd = new ToCmd(src)
      let from = toCmd._importToString()
      let to = "const { a as b } = require('a.js')"
      assert.equal(from, to)
    })
    it('import * ', () => {
      const fromEs6 = new FromEs6('import * as a from "a.js"')

      let src = fromEs6.parse()
      const toCmd = new ToCmd(src)
      let from = toCmd._importToString()
      let to = "const a = require('a.js')"
      assert.equal(from, to)
    })
  })
  describe('export to string', () => {
    it('export default', () => {
      const fromEs6 = new FromEs6('export default 1')
      let src = fromEs6.parse()
      const toCmd = new ToCmd(src)
      let from = toCmd._exportToString()

      let to = "module.exports = {'default':_k_0}"
      assert.equal(from, to)
    })
    it('export object', () => {
      const fromEs6 = new FromEs6('export {a,b}')
      let src = fromEs6.parse()
      const toCmd = new ToCmd(src)
      let from = toCmd._exportToString()

      let to = "module.exports = {'a':a,'b':b}"
      assert.equal(from, to)
    })
  })
})