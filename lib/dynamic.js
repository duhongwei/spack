const { writeFileSync, readFileSync, existsSync } = require('fs')

const { dirname } = require('path')
function read() {
  let result = []
  if (existsSync(this.file)) {
    result = JSON.parse(readFileSync(this.file))
  }
  return result
}

class Dynamic {
  constructor(file) {
    this.file = file
    this.data = read.call(this)
  }
  get() {
    return this.data
  }

  add(key) {
    if (this.data.includes(key)) {
      return
    }
    this.data.push(key)
  }
  write() {
    if (existsSync(dirname(this.file))) {
      writeFileSync(this.file, JSON.stringify(this.data, null, 2))
    }
  }
  toString() {
    return `\nfile is ${this.file}
    ${JSON.stringify(this.data, null, 2)}
    `
  }
}

module.exports = Dynamic