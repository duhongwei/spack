const FromEs6 = require('../../lib/parser/fromEs6')
const assert = require('assert')
describe('fromEs6', () => {
  describe('parse import', () => {
    it('import css', () => {
      let code = "import 'a.css'"
      const fromEs6 = new FromEs6(code)
      let from = fromEs6.parse().importInfo
      let to = [{ type: 'css', file: 'a.css', token: [] }]
      assert.deepEqual(from, to)
    })
    it('import default', () => {
      let code = "import a from 'a.js'"
      const fromEs6 = new FromEs6(code)
      let from = fromEs6.parse().importInfo
      let to = [{ type: 'js', file: 'a.js', token: [{ from: 'default', to: 'a' }] }]
      assert.deepEqual(from, to)
    })
    it('import *', () => {
      let code = "import * as a from 'a.js'"
      const fromEs6 = new FromEs6(code)
      let from = fromEs6.parse().importInfo
      let to = [{ type: 'js', file: 'a.js', token: [{ from: '*', to: 'a' }] }]
      assert.deepEqual(from, to)
    })
    it('import named key', () => {
      let code = "import {a,b} from 'a.js'"
      const fromEs6 = new FromEs6(code)
      let from = fromEs6.parse().importInfo
      let to = [{ type: 'js', file: 'a.js', token: [{ from: 'a', to: 'a' }, { from: 'b', to: 'b' }] }]
      assert.deepEqual(from, to)
    })
    it('import named(a as b) key', () => {
      let code = "import {a as b} from 'a.js'"
      const fromEs6 = new FromEs6(code)
      let from = fromEs6.parse().importInfo
      let to = [{ type: 'js', file: 'a.js', token: [{ from: 'a', to: 'b' }] }]
      assert.deepEqual(from, to)
    })
    it('import to run file only,throw.', () => {
      let code = "import 'a.js'"
      const fromEs6 = new FromEs6(code)
      assert.throws(() => {
        fromEs6.parse()
      })
    })
  })
  describe('parse export default', () => {
    it('export default a digital', () => {
      const fromEs6 = new FromEs6("export default 1")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: '_k_0', to: 'default' }],
        code: 'var _k_0=1'
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
    it('export default a class', () => {
      const fromEs6 = new FromEs6("export default class{}")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: '_k_0', to: 'default' }],
        code: 'var _k_0=class{}'
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
    it('export default a function', () => {
      const fromEs6 = new FromEs6("export default function(){}")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: '_k_0', to: 'default' }],
        code: 'var _k_0=function(){}'
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
    it('export default a variable', () => {
      const fromEs6 = new FromEs6("export default c")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: '_k_0', to: 'default' }],
        code: 'var _k_0=c'
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
  })
  describe('parse export named', () => {
    it('export a digital', () => {
      const fromEs6 = new FromEs6("export var a=1")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: 'a', to: 'a' }],
        code: ' var a=1'
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
    it('export a class', () => {
      const fromEs6 = new FromEs6("export class A{}")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: 'A', to: 'A' }],
        code: ' class A{}'
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
    it('export a function', () => {
      const fromEs6 = new FromEs6("export function a(){}")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: 'a', to: 'a' }],
        code: ' function a(){}'
      }
      assert.deepEqual(exportInfo, to.from)
      assert.deepEqual(code, to.code)
    })
    //"export c" 这种是错误的，不能直接导出一个变量,可以导出一个object
    it('export an object', () => {
      const fromEs6 = new FromEs6("export {a}")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: 'a', to: 'a' }],
        code: ''
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
    it('export an object(a as b)', () => {
      const fromEs6 = new FromEs6("export {a as b}")
      let { exportInfo, code } = fromEs6.parse()
      let to = {
        from: [{ from: 'a', to: 'b' }],
        code: ''
      }
      assert.deepEqual(exportInfo, to.from)
      assert.equal(code, to.code)
    })
  })
  describe('parse export from', () => {
    it('export named key', () => {
      const fromEs6 = new FromEs6("export {a} from 'a.js'")
      let { importInfo, exportInfo, code } = fromEs6.parse()
      let to = {
        importInfo: [{ type: 'js', file: 'a.js', token: [{ from: 'a', to: '_z_0' }] }],
        exportInfo: [{ from: '_z_0', to: 'a' }],
        code: ''
      }
      assert.deepEqual(importInfo, to.importInfo)
      assert.deepEqual(exportInfo, to.exportInfo)
      assert.equal(code, to.code)
    })
    it('export default key', () => {
      const fromEs6 = new FromEs6("export {default} from 'a.js'")
      let { importInfo, exportInfo, code } = fromEs6.parse()
      let to = {
        importInfo: [{ type: 'js', file: 'a.js', token: [{ from: 'default', to: '_z_0' }] }],
        exportInfo: [{ from: '_z_0', to: 'default' }],
        code: ''
      }
      assert.deepEqual(importInfo, to.importInfo)
      assert.deepEqual(exportInfo, to.exportInfo)
      assert.equal(code, to.code)
    })
    it('export a as b', () => {
      const fromEs6 = new FromEs6("export {a as b} from 'a.js'")
      let { importInfo, exportInfo, code } = fromEs6.parse()
      let to = {
        importInfo: [{ type: 'js', file: 'a.js', token: [{ from: 'a', to: '_z_0' }] }],
        exportInfo: [{ from: '_z_0', to: 'b' }],
        code: ''
      }
      assert.deepEqual(importInfo, to.importInfo)
      assert.deepEqual(exportInfo, to.exportInfo)
      assert.equal(code, to.code)
    })
    it('export * from,throw.', () => {
      const fromEs6 = new FromEs6('export * from "a.js"')
      assert.throws(() => {
        fromEs6.parse()
      })
    })
  })
})
