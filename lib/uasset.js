'use strict'
Object.defineProperty(exports, '__esModule', {value: true})
exports.UAsset = void 0
const fname_1 = require('./fname')
const ufile_1 = require('./ufile')
const PROP_TYPE_BOOLEAN = 1
const PROP_TYPE_BYTE = 2
const PROP_TYPE_INT8 = 3
const PROP_TYPE_UINT16 = 4
const PROP_TYPE_INT16 = 5
const PROP_TYPE_UINT32 = 6
const PROP_TYPE_INT32 = 7
const PROP_TYPE_INT64 = 8
const PROP_TYPE_FLOAT = 9
const PROP_TYPE_STRING = 10
const PROP_TYPE_NAME = 11
class UAsset extends ufile_1.UFile {
  #names = []
  #exports = []
  #dataOffset = 0
  #namesByOffset = {}
  #entries = []
  #props = []
  #offsets = []
  constructor(filename) {
    super(filename)
  }
  get names() {
    return this.#names
  }
  get exports() {
    return this.#exports
  }
  get props() {
    return this.#props
  }
  get offsets() {
    return this.#offsets
  }
  read() {
    super.read()
    this.readFName() // name
    this.readFName() // sourceName
    this.readUint32() // packageFlags
    this.readUint32() // cookedHeaderSize
    const namesOffset = this.readUint32()
    const namesSize = this.readUint32()
    this.readUint32() // namesHashesOffset
    this.readUint32() // namesHashesSize
    this.readUint32() // importsOffset
    const exportsOffset = this.readUint32()
    const exportsBundlesOffset = this.readUint32()
    const graphDataOffset = this.readUint32()
    const graphDataSize = this.readUint32()
    const headerSize = graphDataOffset + graphDataSize
    this.#names = []
    for (this.pos = namesOffset; this.pos < namesOffset + namesSize; ) {
      this.#names.push(this.readFString())
    }
    this.#exports = []
    let offset = headerSize
    for (this.pos = exportsOffset; this.pos < exportsBundlesOffset; ) {
      this.readUint64() // cookedSerialOffset
      const size = Number(this.readUint64())
      this.readUint64() // objectName (FMappedName)
      this.readUint64() // outerIndex
      this.readUint64() // classIndex
      this.readUint64() // superIndex
      this.readUint64() // templateIndex
      this.readUint64() // globalImportIndex
      this.readUint32() // objectFlags
      this.readByte() // filterFlags
      this.readBytes(3) // padding
      this.#exports.push({offset, size})
      offset += size
    }
    if (this.#exports.length !== 1) {
      throw new Error(`Expected 1 export, but found ${this.#exports.length}`)
    }
    this.pos = this.#exports[0].offset
    const name = this.readFName().toString()
    if (name !== 'None') {
      throw new Error(
        `Found DataObject that does not start with None: ${this.filename}:${
          this.pos - 8
        }`,
      )
    }
    const hasGUID = this.readUint32()
    if (hasGUID > 0) {
      throw new Error(
        `Found DataObject that has GUID: ${this.filename}:${this.pos - 4}`,
      )
    }
    const dataSize = this.readUint32()
    this.readBytes(16) // Unknown
    this.#dataOffset = this.pos
    this.pos += dataSize
    const vTableCount = this.readUint32()
    if (vTableCount > 0) {
      throw new Error(
        `Found DataObject with vTables: ${this.filename}:${this.pos - 4}`,
      )
    }
    const scriptNameCount = this.readUint32()
    if (scriptNameCount > 0) {
      throw new Error(
        `Found DataObject with scriptNames: ${this.filename}:${this.pos - 4}`,
      )
    }
    const mappedNamesCount = this.readUint32()
    this.#namesByOffset = {}
    const mappedNames = []
    for (let i = 0; i < mappedNamesCount; i++) {
      const name = this.readFName().toString()
      mappedNames.push(name)
      const patchCount = this.readUint32()
      for (let j = 0; j < patchCount; j++) {
        const offset = this.readUint32()
        this.#namesByOffset[offset] = name
      }
    }
    this.pos = this.#dataOffset
    const keys = this.readArray(() => {
      const name = this.readMappedName()
      this.pos += 12
      return name
    })
    this.pos += 40
    this.#props = this.readArray(() => ({
      name: this.readMappedName(),
      type: this.readUint32(),
    }))
    const values = this.readArray(() => {
      const positionedValues = []
      for (const prop of this.#props) {
        if (prop.name.endsWith('_Array')) {
          this.align(8)
          let alignment
          switch (prop.type) {
            case PROP_TYPE_BOOLEAN:
            case PROP_TYPE_BYTE:
            case PROP_TYPE_INT8:
              alignment = 1
              break
            case PROP_TYPE_UINT16:
            case PROP_TYPE_INT16:
              alignment = 2
              break
            default:
              alignment = 4
          }
          positionedValues.push(
            this.readArray(() => this.readPropValue(prop.type), alignment),
          )
        } else {
          positionedValues.push(this.readPropValue(prop.type))
        }
      }
      return positionedValues
    })
    this.#entries = []
    this.#offsets = []
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const positionedValues = values[i]
      const entry = {$tag: key}
      const offsetData = {}
      for (let j = 0; j < this.#props.length; j++) {
        const prop = this.#props[j]
        const value = positionedValues[j]
        if (prop.name.endsWith('_Array')) {
          entry[prop.name] = value.map(([, value]) => value)
          offsetData[prop.name] = value.map(([pos]) => pos)
        } else {
          entry[prop.name] = value[1]
          offsetData[prop.name] = value[0]
        }
      }
      this.#entries.push(entry)
      this.#offsets.push(offsetData)
    }
  }
  readFName() {
    return new fname_1.FName(this, this.readUint32(), this.readUint32())
  }
  readMappedName() {
    const name = this.#namesByOffset[this.pos - this.#dataOffset] ?? ''
    this.pos += 8
    return name
  }
  readMappedString() {
    return this.readArray(() => this.readBytes(2).toString('utf-16le'))
      .join('')
      .replace(/\0$/, '')
  }
  readArray(readElement, alignment) {
    const initialPos = this.pos
    const pack = this.readUint64()
    const offset = Number(pack >> 1n)
    const elementCount = this.readUint32()
    const elementCountMax = this.readUint32()
    if (elementCount !== elementCountMax) {
      throw new Error(
        `Found DataObject with mismatched array num and max: ${this.filename}:${
          this.pos - 8
        }`,
      )
    }
    if (elementCount === 0) {
      return []
    }
    const continuePos = this.pos
    const elementsPos = initialPos + offset
    this.pos = elementsPos
    const elements = []
    for (let i = 0; i < elementCount; i++) {
      elements.push(readElement())
      if (alignment != null) {
        this.align(alignment)
      }
    }
    this.pos = continuePos
    return elements
  }
  readPropValue(type) {
    switch (type) {
      case PROP_TYPE_BOOLEAN:
      case PROP_TYPE_BYTE:
      case PROP_TYPE_INT8:
        return [this.pos, this.readByte()]
      case PROP_TYPE_UINT16:
        return [this.pos, this.readUint16()]
      case PROP_TYPE_INT16:
        return [this.pos, this.readInt16()]
      case PROP_TYPE_UINT32:
        this.align(4)
        return [this.pos, this.readUint32()]
      case PROP_TYPE_INT32:
        this.align(4)
        return [this.pos, this.readInt32()]
      case PROP_TYPE_INT64:
        return [this.pos, this.readInt64()]
      case PROP_TYPE_FLOAT:
        this.align(4)
        return [this.pos, this.readFloat()]
      case PROP_TYPE_STRING:
        this.align(8)
        return [this.pos, this.readMappedString()]
      case PROP_TYPE_NAME:
        this.align(4)
        return [this.pos, this.readMappedName()]
      default:
        throw new Error(`Unknown property type ${type}`)
    }
  }
  toJSON() {
    return {
      filename: this.filename,
      names: this.#names,
      exports: this.#exports,
      props: this.#props,
      entries: this.#entries,
    }
  }
}
exports.UAsset = UAsset
