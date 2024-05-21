import Cookies from 'js-cookie'

/**
 * @param {string} object
 * @returns {Boolean}
 */
export function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target, source) {
  if (!isObject(target)) {
    target = {}
  }
  if (Array.isArray(source)) {
    return source.slice()
  }
  Object.keys(source).forEach((property) => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      target[property] = sourceProperty
    }
  })
  return target
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray(actual) {
  return actual.filter((val) => val)
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json) {
  if (!json) return ''
  return cleanArray(
    Object.keys(json).map((key) => {
      if (json[key] === undefined) return ''
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    })
  ).join('&')
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url = '') {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach((v) => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path = '') {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @returns {String}
 */
export function getMetaSpmA() {
  return document.head.querySelector('[name="spm-a"]')?.content || ''
}

/**
 * @returns {String}
 */
export function getSpmb() {
  return document.head.querySelector('[name="spm-b"]')?.content || ''
}

/**
 * @descriptin 获取当前语种
 * @returns {Array}
 */
export const getLocale = () => {
  return Cookies.get('language') || 'en'
}

/**
 * @descriptin 是否客户端
 * @returns {Boolean}
 */
export function isClient() {
  return typeof window !== 'undefined'
}
