const {basename} = require('path')
const {ipcRenderer} = require('electron')
const {PropertyType} = require('../lib/uexport')
const txtRes = require('../lib/text-resource.json')
const pkg = require('../package.json')

/**
 * @typedef {{$tag: string} & Record<string, string | number | string[] | number[]>} SparseEntry
 */

/** @type {import('../lib/upackage').UPackage} */
let upackage

window.addEventListener('DOMContentLoaded', () => {
  try {
    setTitle()
    setupOpenAndSaveButtons()

    document
      .getElementById('show-txt-ids-checkbox')
      .addEventListener('change', event => {
        const entries = document.getElementById('entries')
        if (event.target.checked) {
          entries.classList.remove('txt-values')
          entries.classList.add('txt-ids')
        } else {
          entries.classList.remove('txt-ids')
          entries.classList.add('txt-values')
        }
      })

    setupFind()
  } catch (err) {
    ipcRenderer.send('error', err)
  }
})

function setTitle() {
  const nameAndVersion = `${pkg.description} v${pkg.version}`
  if (upackage != null) {
    document.title = `${basename(upackage.uasset.filename)} - ${nameAndVersion}`
  } else {
    document.title = nameAndVersion
  }
}

function setupOpenAndSaveButtons() {
  document
    .getElementById('open-file-button')
    .addEventListener('click', openUPackage)

  document
    .getElementById('save-file-button')
    .addEventListener('click', saveUPackage)
}

function openUPackage() {
  ipcRenderer.send('open-upackage')
}

ipcRenderer.on('upackage-opened', (event, json) => {
  loadUPackage(json)
})

/**
 * @param {string} json
 */
function loadUPackage(json) {
  try {
    upackage = JSON.parse(json)
    loadEntries(upackage.uexp.entries)
    setTitle()
    document.getElementById('save-file-button').disabled = false
  } catch (err) {
    ipcRenderer.send('error', err)
  }
}

/**
 * @param {SparseEntry[]} entries
 */
function loadEntries(entries) {
  try {
    const uexp = upackage.uexp
    const table = document.getElementById('entries')
    const thead = document.createElement('thead')
    const tr = document.createElement('tr')

    const indexTH = document.createElement('th')
    indexTH.innerText = '#'
    tr.appendChild(indexTH)

    const tagTH = document.createElement('th')
    tagTH.innerText = 'Tag'
    tr.appendChild(tagTH)

    for (const prop of uexp.props) {
      const th = document.createElement('th')
      th.innerText = prop.name
      tr.appendChild(th)
    }

    thead.appendChild(tr)

    const tbody = document.createElement('tbody')

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const originalEntry = uexp.entries[i]

      const tr = document.createElement('tr')

      const indexTH = document.createElement('th')
      indexTH.innerText = i
      tr.appendChild(indexTH)

      const tagTH = document.createElement('th')
      tagTH.innerText = entry.$tag
      tr.appendChild(tagTH)

      for (const prop of uexp.props) {
        const td = document.createElement('td')
        const value =
          entry[prop.name] != null ? entry[prop.name] : originalEntry[prop.name]
        const originalValue = String(originalEntry[prop.name])

        if (prop.name.endsWith('_Array')) {
          for (let j = 0; j < value.length; j++) {
            const element = value[j]
            const originalElement = String(originalEntry[prop.name][j])
            const span = document.createElement('span')
            span.classList.add('element')
            loadProperty(prop, element, originalElement, span, td)
            td.appendChild(span)

            if (j !== value.length - 1) {
              td.appendChild(document.createTextNode(', '))
            }
          }
        } else {
          loadProperty(prop, value, originalValue, td)
        }

        td.addEventListener('keydown', event => {
          if (event.key === 'ArrowDown' || event.key === 'Enter') {
            event.preventDefault()
            const nextTR = td.parentElement.nextElementSibling
            if (nextTR != null) {
              const nextTD = nextTR.cells.item(td.cellIndex)
              nextTD.focus()
              if (td.contentEditable === 'true') {
                getSelection().selectAllChildren(nextTD)
              }
            }
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            const prevTR = td.parentElement.previousElementSibling
            if (prevTR != null) {
              const prevTD = prevTR.cells.item(td.cellIndex)
              prevTD.focus()
              if (td.contentEditable === 'true') {
                getSelection().selectAllChildren(prevTD)
              }
            }
          }
        })

        tr.appendChild(td)
      }

      tbody.appendChild(tr)
    }

    table.replaceChildren(thead, tbody)
  } catch (err) {
    ipcRenderer.send('error', err)
  }
}

/**
 *
 * @param {import('../lib/uexport').Property} prop
 * @param {number | string} value
 * @param {string} originalValue
 * @param {HTMLElement} element
 * @param {HTMLElement} [parent]
 */
function loadProperty(prop, value, originalValue, element, parent) {
  if (parent == null) {
    parent = element
  }

  switch (prop.type) {
    case PropertyType.BOOLEAN:
    case PropertyType.BYTE:
    case PropertyType.INT8:
    case PropertyType.UINT16:
    case PropertyType.INT16:
    case PropertyType.UINT32:
    case PropertyType.INT32:
    case PropertyType.INT64:
    case PropertyType.FLOAT:
      element.innerText = String(value)
      element.contentEditable = 'true'
      validateProperty(prop.type, element, originalValue)

      element.addEventListener('focus', () => {
        getSelection().selectAllChildren(element)
      })

      element.addEventListener('blur', () => {
        validateProperty(prop.type, element, originalValue)
      })
      break

    case PropertyType.STRING:
      if (txtRes[value] != null) {
        const txtID = document.createElement('span')
        txtID.classList.add('txt-id')
        txtID.innerText = value
        txtID.title = txtRes[value]
        element.appendChild(txtID)

        const txtValue = document.createElement('span')
        txtValue.classList.add('txt-value')
        txtValue.innerText = txtRes[value]
        txtValue.title = value
        element.appendChild(txtValue)
      } else {
        element.innerText = value
      }

      parent.classList.add('disabled')
      break

    case PropertyType.NAME:
      if (txtRes[value] != null) {
        const txtID = document.createElement('span')
        txtID.classList.add('txt-id')
        txtID.innerText = value
        txtID.title = txtRes[value]
        element.appendChild(txtID)

        const txtValue = document.createElement('span')
        txtValue.classList.add('txt-value')
        txtValue.innerText = txtRes[value]
        txtValue.title = value
        element.appendChild(txtValue)
      } else {
        element.innerText = value
      }

      element.dataset.value = value
      break

    default:
      element.innerText = String(value)
      parent.classList.add('disabled')
  }
}

/**
 * @param {number} type
 */
function getPropertyRange(type) {
  let min
  let max
  switch (type) {
    case PropertyType.BOOLEAN:
      min = 0
      max = 1
      break
    case PropertyType.BYTE:
    case PropertyType.INT8:
      min = 0
      max = 0xff
      break
    case PropertyType.UINT16:
      min = 0
      max = 0xffff
      break
    case PropertyType.INT16:
      min = -(2 ** 15)
      max = 2 ** 15 - 1
      break
    case PropertyType.UINT32:
      min = 0
      max = 0xffffffff
      break
    case PropertyType.INT32:
      min = -(2 ** 31)
      max = 2 ** 31 - 1
      break
    case PropertyType.INT64:
      min = -(2n ** 63n)
      max = 2n ** 63n - 1n
      break
    case PropertyType.FLOAT:
      min = Number.MIN_VALUE
      max = Number.MAX_VALUE
      break
    default:
      return undefined
  }

  return {min, max}
}

/**
 * @param {number} type
 * @param {HTMLElement} element
 * @param {string} originalValue
 */
function validateProperty(type, element, originalValue) {
  if (element.innerText !== originalValue) {
    element.dataset.isDirty = ''

    let number
    const {min, max} = getPropertyRange(type)
    switch (type) {
      case PropertyType.BOOLEAN:
      case PropertyType.BYTE:
      case PropertyType.INT8:
      case PropertyType.UINT16:
      case PropertyType.INT16:
      case PropertyType.UINT32:
      case PropertyType.INT32:
      case PropertyType.FLOAT:
        number = Number(element.innerText)
        if (isNaN(number)) {
          element.classList.add('invalid')
          element.title = 'Value must be a number'
        } else if (number < min || number > max) {
          element.classList.add('invalid')
          element.title = `Value must be between ${min.toLocaleString()} and ${max.toLocaleString()}`
        } else {
          element.classList.remove('invalid')
          element.removeAttribute('title')
        }
        break
      case PropertyType.INT64:
        try {
          number = BigInt(element.innerText)
        } catch (err) {
          element.classList.add('invalid')
          element.title = 'Value must be a number'
        }

        if (number < min || number > max) {
          element.classList.add('invalid')
          element.title = `Value must be between ${min.toLocaleString()} and ${max.toLocaleString()}`
        } else {
          element.classList.remove('invalid')
          element.removeAttribute('title')
        }
        break
    }
  } else {
    delete element.dataset.isDirty
    element.classList.remove('invalid')
    element.removeAttribute('title')
  }
}

/**
 * @typedef GetEntriesOptions
 * @property {boolean} dirtyOnly
 */

/**
 * @param {GetEntriesOptions} options
 */
function getEntries({dirtyOnly} = {dirtyOnly: true}) {
  /** @type {SparseEntry[]} */
  const entries = []
  /** @type {HTMLTableElement} */
  const table = document.getElementById('entries')
  const tbody = table.tBodies.item(0)
  for (let i = 0; i < tbody.rows.length; i++) {
    const tr = tbody.rows.item(i)
    const tagTD = tr.cells.item(1)
    const entry = {$tag: tagTD.innerText}
    for (let j = 2; j < tr.cells.length; j++) {
      const td = tr.cells.item(j)
      const prop = upackage.uexp.props[j - 2]
      if (
        !prop.name.endsWith('_Array') &&
        (!dirtyOnly || td.dataset.isDirty != null)
      ) {
        let value
        let txtID
        switch (prop.type) {
          case PropertyType.BOOLEAN:
          case PropertyType.BYTE:
          case PropertyType.INT8:
          case PropertyType.UINT16:
          case PropertyType.INT16:
          case PropertyType.UINT32:
          case PropertyType.INT32:
          case PropertyType.FLOAT:
            value = Number(td.innerText)
            break
          case PropertyType.INT64:
            value = BigInt(td.innerText)
            break
          case PropertyType.STRING:
            txtID = td.querySelector('.txt-id')
            if (txtID != null) {
              value = txtID.innerText
            } else {
              value = td.innerText
            }
            break
          case PropertyType.NAME:
            value = td.dataset.value
            break
          default:
            value = td.innerText
        }

        entry[prop.name] = value
      } else {
        const spans = td.querySelectorAll('.element')
        let array = dirtyOnly ? undefined : []
        for (let k = 0; k < spans.length; k++) {
          const span = spans.item(k)
          if (!dirtyOnly || span.dataset.isDirty != null) {
            if (array == null) {
              array = Array(upackage.uexp.entries[i][prop.name].length)
            }

            let element
            let txtID
            switch (prop.type) {
              case PropertyType.BOOLEAN:
              case PropertyType.BYTE:
              case PropertyType.INT8:
              case PropertyType.UINT16:
              case PropertyType.INT16:
              case PropertyType.UINT32:
              case PropertyType.INT32:
              case PropertyType.FLOAT:
                value = Number(td.innerText)
                break
              case PropertyType.INT64:
                value = BigInt(td.innerText)
                break
              case PropertyType.STRING:
                txtID = span.querySelector('.txt-id')
                if (txtID != null) {
                  element = txtID.innerText
                } else {
                  element = td.innerText
                }
                break
              case PropertyType.NAME:
                element = span.dataset.value
                break
              default:
                element = span.innerText
            }

            array[k] = element
          }
        }

        entry[prop.name] = array
      }
    }

    entries.push(entry)
  }

  return entries
}

ipcRenderer.on('save-upackage', saveUPackage)

function saveUPackage() {
  try {
    // Focus away from entries to ensure they are saved.
    document.getElementById('save-file-button').focus()
    const entries = getEntries()
    ipcRenderer.send('upackage-saved', entries)
  } catch (err) {
    ipcRenderer.send('error', err)
  }
}

ipcRenderer.on('csv-imported', (event, entries) => {
  csvImported(entries)
})

function csvImported(entries) {
  loadEntries(entries)
}

ipcRenderer.on('export-csv', exportCSV)

function exportCSV() {
  try {
    // Focus away from entries to ensure they are saved.
    document.getElementById('save-file-button').focus()
    const entries = getEntries({dirtyOnly: false})
    ipcRenderer.send('csv-exported', entries)
  } catch (err) {
    ipcRenderer.send('error', err)
  }
}

ipcRenderer.on('csv-exported', (event, filename) => {
  csvExported(filename)
})

function csvExported(filename) {
  showToast(`${basename(filename)} has been saved.`)
}

ipcRenderer.on('upackage-saved', (event, filename) => {
  upackageSaved(filename)
})

/**
 * @param {string} filename
 */
function upackageSaved(filename) {
  showToast(`${basename(filename)} has been saved.`)
}

/**
 * @param {string} message
 */
function showToast(message) {
  try {
    const toast = document.getElementById('toast')
    const toastBody = toast.querySelector('.toast-body')
    toastBody.innerText = message
    toast.classList.add('show')

    const closeButton = toast.querySelector('.btn-close')
    closeButton.addEventListener('click', () => {
      toast.classList.remove('show')
    })
  } catch (err) {
    ipcRenderer.send('error', err)
  }
}

function setupFind() {
  const found = []
  let foundIndex = 0
  /** @type {HTMLTableElement} */
  const entries = document.getElementById('entries')
  const form = document.getElementById('find-form')
  const textbox = document.getElementById('find-textbox')
  const indexSpan = document.getElementById('find-index')
  const totalSpan = document.getElementById('find-total')
  const prevButton = document.getElementById('find-prev-button')
  const closeButton = document.getElementById('find-close-button')

  function findAll() {
    const regexp = new RegExp(escapeRegExp(textbox.value), 'i')
    found.length = 0
    for (const row of entries.rows) {
      for (const cell of row.cells) {
        cell.classList.remove('current')
        const isFound = textbox.value.length > 0 && regexp.test(cell.innerText)
        if (isFound) {
          cell.classList.add('found')
          found.push(cell)
        } else {
          cell.classList.remove('found')
        }
      }

      totalSpan.innerText = String(found.length)

      if (found.length > 0) {
        setFound()
      } else {
        indexSpan.innerText = String(0)
      }
    }
  }

  function findNext() {
    if (found.length > 1) {
      found[foundIndex].classList.remove('current')
      if (++foundIndex === found.length) {
        foundIndex = 0
      }

      setFound()
    }
  }

  function findPrev() {
    if (found.length > 1) {
      found[foundIndex].classList.remove('current')
      if (--foundIndex < 0) {
        foundIndex = found.length - 1
      }

      setFound()
    }
  }

  function setFound() {
    indexSpan.innerText = String(foundIndex + 1)
    const current = found[foundIndex]
    current.classList.add('current')
    setImmediate(() => {
      current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      })
    })
  }

  function close() {
    const tbody = entries.tBodies.item(0)
    if (tbody != null) {
      for (let i = 0; i < tbody.rows.length; i++) {
        const row = tbody.rows.item(i)
        for (let j = 0; j < row.cells.length; j++) {
          const cell = row.cells.item(j)
          cell.classList.remove('current')
          cell.classList.remove('found')
        }
      }
    }

    form.classList.remove('d-flex')
    form.classList.add('d-none')
  }

  ipcRenderer.on('find', () => {
    form.classList.remove('d-none')
    form.classList.add('d-flex')
    findAll()
    textbox.focus()
    textbox.select()
  })

  form.addEventListener('submit', event => {
    event.preventDefault()
    findNext()
  })

  form.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      close()
    }
  })

  form.addEventListener('focusout', () => {
    setImmediate(() => {
      if (
        !form.contains(document.activeElement) &&
        (document.activeElement.contentEditable === 'true' ||
          document.activeElement.tagName === 'SELECT')
      ) {
        close()
      }
    })
  })

  textbox.addEventListener('input', () => {
    foundIndex = 0
    findAll()
  })

  textbox.addEventListener('keydown', event => {
    if (event.shiftKey) {
      if (event.key === 'Enter') {
        event.preventDefault()
        findPrev()
      } else if (event.key === 'Tab') {
        event.preventDefault()
        closeButton.focus()
      }
    }
  })

  prevButton.addEventListener('click', findPrev)

  closeButton.addEventListener('click', close)

  closeButton.addEventListener('keydown', event => {
    if (!event.shiftKey && event.key === 'Tab') {
      event.preventDefault()
      textbox.focus()
    }
  })
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$0')
}
