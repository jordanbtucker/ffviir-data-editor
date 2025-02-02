const BIGINT_REGEX = /^(\d+)n$/

function stringify(value) {
  return JSON.stringify(value, (key, value) => {
    if (typeof value === 'bigint') {
      return String(value) + 'n'
    } else {
      return value
    }
  })
}

function parse(text) {
  return JSON.parse(text, (key, value) => {
    if (typeof value === 'string') {
      const match = BIGINT_REGEX.exec(value)
      if (match) {
        return BigInt(match[1])
      }
    }

    return value
  })
}

exports.parse = parse
exports.stringify = stringify
