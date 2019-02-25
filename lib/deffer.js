module.exports = class {
  constructor() {
    this.p = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}
