'use strict'
Object.defineProperty(exports, '__esModule', {value: true})
exports.FName = void 0
class FName {
  #uasset
  #index
  #instance
  constructor(uasset, index, instance) {
    this.#uasset = uasset
    this.#index = index
    this.#instance = instance
  }
  get uasset() {
    return this.#uasset
  }
  get index() {
    return this.#index
  }
  get instance() {
    return this.#instance
  }
  toString() {
    return (
      this.uasset.names[this.index] +
      (this.instance === 0 ? '' : `_${this.instance - 1}`)
    )
  }
}
exports.FName = FName
