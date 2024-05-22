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
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }
  return newArray
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
export function param2Obj(url) {
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
 * 查询url上的参数
 * @param {string} name
 * @returns {String}
 */
export function queryUrlParams(name) {
  const urlParams = new URLSearchParams(location.search)
  return urlParams.get(name) || ''
}

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 获取站点ID
 * @returns {String}
 */
export function getMetaSpmA() {
  return document.head.querySelector('[name="spm-a"]')?.content || ''
}

/**
 * 获取页面ID
 * @returns {String}
 */
export function getSpmb() {
  return document.head.querySelector('[name="spm-b"]')?.content || ''
}

/**
 * 获取是否自动上报pv
 * @returns {Boolean}
 */
export function getMetaAutotrack() {
  return document.head.querySelector('[name="autotrack"]')?.content === 'true' || false
}

/**
 * 获取页面级别的itemcode
 * @returns {Boolean}
 */
export function getMetaItemcode() {
  return document.head.querySelector('[name="itemcode"]')?.content || ''
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
export const isClient = () => {
  return typeof window !== 'undefined'
}
