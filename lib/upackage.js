'use strict'
Object.defineProperty(exports, '__esModule', {value: true})
exports.UPackage = void 0
const uasset_1 = require('./uasset')
class UPackage {
  #uasset
  constructor(filename) {
    this.#uasset = new uasset_1.UAsset(filename)
  }
  get uasset() {
    return this.#uasset
  }
  get uexp() {
    return this.#uasset
  }
  read() {
    this.#uasset.read()
  }
  toJSON() {
    return {
      uasset: this.#uasset.toJSON(),
      uexp: this.#uasset.toJSON(),
    }
  }
}
exports.UPackage = UPackage
