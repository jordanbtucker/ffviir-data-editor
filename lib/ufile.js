'use strict'
Object.defineProperty(exports, '__esModule', {value: true})
exports.UFile = void 0
const fs_1 = require('fs')
class UFile {
  #filename
  #data
  #pos = 0
  constructor(filename) {
    this.#filename = filename
    this.#data = (0, fs_1.readFileSync)(filename)
  }
  get filename() {
    return this.#filename
  }
  get data() {
    return this.#data
  }
  get pos() {
    return this.#pos
  }
  set pos(value) {
    this.#pos = value
  }
  read() {
    this.#pos = 0
  }
  readBytes(length) {
    const value = this.#data.subarray(this.#pos, this.#pos + length)
    this.#pos += length
    return value
  }
  readByte() {
    const value = this.#data.readUint8(this.#pos)
    this.#pos++
    return value
  }
  readUint16() {
    const value = this.#data.readUint16LE(this.#pos)
    this.#pos += 2
    return value
  }
  readInt16() {
    const value = this.#data.readInt16LE(this.#pos)
    this.#pos += 2
    return value
  }
  readUint32() {
    const value = this.#data.readUint32LE(this.#pos)
    this.#pos += 4
    return value
  }
  readInt32() {
    const value = this.#data.readInt32LE(this.#pos)
    this.#pos += 4
    return value
  }
  readUint64() {
    const value = this.#data.readBigUint64LE(this.#pos)
    this.#pos += 8
    return value
  }
  readInt64() {
    const value = this.#data.readBigInt64LE(this.#pos)
    this.#pos += 8
    return value
  }
  readFloat() {
    const value = this.#data.readFloatLE(this.#pos)
    this.#pos += 4
    return value
  }
  readFString() {
    const b1 = this.readByte()
    const b2 = this.readByte()
    const isUTF16LE = (b1 & 0x80) !== 0
    const length = ((b1 & 0x7f) << 8) | b2
    let value
    if (isUTF16LE) {
      this.align(2)
      const utf16LELength = length * 2
      value = this.#data.toString(
        'utf-16le',
        this.#pos,
        this.#pos + utf16LELength,
      )
      this.#pos += utf16LELength
    } else {
      value = this.#data.toString('utf-8', this.#pos, this.#pos + length)
      this.#pos += length
    }
    return value.replace(/\0$/, '')
  }
  align(alignment) {
    this.#pos = (this.#pos + alignment - 1) & ~(alignment - 1)
  }
  write(filename = this.#filename) {
    ;(0, fs_1.writeFileSync)(filename, this.#data)
  }
  writeByte(value) {
    this.#data.writeInt8(value, this.#pos++)
  }
  writeUint16(value) {
    this.#data.writeUint16LE(value, this.#pos)
    this.#pos += 2
  }
  writeInt16(value) {
    this.#data.writeInt16LE(value, this.#pos)
    this.#pos += 2
  }
  writeUint32(value) {
    this.#data.writeUint32LE(value, this.#pos)
    this.#pos += 4
  }
  writeInt32(value) {
    this.#data.writeInt32LE(value, this.#pos)
    this.#pos += 4
  }
  writeInt64(value) {
    this.#data.writeBigInt64LE(value, this.#pos)
    this.#pos += 8
  }
  writeFloat(value) {
    this.#data.writeFloatLE(value, this.#pos)
    this.#pos += 4
  }
}
exports.UFile = UFile
