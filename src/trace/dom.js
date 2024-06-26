/* istanbul ignore next */
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g
const MOZ_HACK_REGEXP = /^moz([A-Z])/
const ieVersion = typeof window !== 'undefined' && document.documentMode

/* istanbul ignore next */
const trim = function (string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
}
/* istanbul ignore next */
const camelCase = function (name) {
  return name
    .replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter
    })
    .replace(MOZ_HACK_REGEXP, 'Moz$1')
}

/* istanbul ignore next */
export const on = (function () {
  if (typeof window === 'undefined') return false
  if (document.addEventListener) {
    return function (element, event, handler, passive) {
      if (element && event && handler) {
        element.addEventListener(event, handler, passive)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

/* istanbul ignore next */
export const off = (function () {
  if (typeof window === 'undefined') return false
  if (document.removeEventListener) {
    return function (element, event, handler, passive) {
      if (element && event) {
        element.removeEventListener(event, handler, passive)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()

/* istanbul ignore next */
export const once = function (el, event, fn) {
  var listener = function () {
    if (fn) {
      fn.apply(this, arguments)
    }
    off(el, event, listener)
  }
  on(el, event, listener)
}

/* istanbul ignore next */
export function hasClass(el, cls) {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}

/* istanbul ignore next */
export function addClass(el, cls) {
  if (!el) return
  var curClass = el.className
  var classes = (cls || '').split(' ')

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.add(clsName)
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
}

/* istanbul ignore next */
export function removeClass(el, cls) {
  if (!el || !cls) return
  var classes = cls.split(' ')
  var curClass = ' ' + el.className + ' '

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.remove(clsName)
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ')
    }
  }
  if (!el.classList) {
    el.className = trim(curClass)
  }
}

/* istanbul ignore next */
export const getStyle =
  ieVersion < 9
    ? function (element, styleName) {
        if (!element || !styleName) return null
        styleName = camelCase(styleName)
        if (styleName === 'float') {
          styleName = 'styleFloat'
        }
        try {
          switch (styleName) {
            case 'opacity':
              try {
                return element.filters.item('alpha').opacity / 100
              } catch (e) {
                return 1.0
              }
            default:
              return element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null
          }
        } catch (e) {
          return element.style[styleName]
        }
      }
    : function (element, styleName) {
        if (!element || !styleName) return null
        styleName = camelCase(styleName)
        if (styleName === 'float') {
          styleName = 'cssFloat'
        }
        try {
          var computed = document.defaultView.getComputedStyle(element, '')
          return element.style[styleName] || computed ? computed[styleName] : null
        } catch (e) {
          return element.style[styleName]
        }
      }

/* istanbul ignore next */
export function setStyle(element, styleName, value) {
  if (!element || !styleName) return

  if (typeof styleName === 'object') {
    for (var prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        setStyle(element, prop, styleName[prop])
      }
    }
  } else {
    styleName = camelCase(styleName)
    if (styleName === 'opacity' && ieVersion < 9) {
      element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')'
    } else {
      element.style[styleName] = value
    }
  }
}

export const isScroll = (el, vertical) => {
  const determinedDirection = vertical !== null || vertical !== undefined
  const overflow = determinedDirection
    ? vertical
      ? getStyle(el, 'overflow-y')
      : getStyle(el, 'overflow-x')
    : getStyle(el, 'overflow')

  return overflow.match(/(scroll|auto)/)
}

export const getScrollContainer = (el, vertical) => {
  let parent = el
  while (parent) {
    if ([window, document, document.documentElement].includes(parent)) {
      return window
    }
    if (isScroll(parent, vertical)) {
      return parent
    }
    parent = parent.parentNode
  }

  return parent
}

export const isInContainer = (el, container) => {
  if (!el || !container) return false

  const elRect = el.getBoundingClientRect()
  let containerRect

  if ([window, document, document.documentElement, null, undefined].includes(container)) {
    containerRect = {
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      left: 0,
    }
  } else {
    containerRect = container.getBoundingClientRect()
  }

  return (
    elRect.top < containerRect.bottom &&
    elRect.bottom > containerRect.top &&
    elRect.right > containerRect.left &&
    elRect.left < containerRect.right
  )
}

/**
 *
 * @param {事件event} event
 * @param {获取的属性名称} attribute
 * @param {当前绑定事件的元素} el
 * @returns 属性值
 * @description 获取属性值
 */
export const getAttribute = (event, attribute, el) => {
  const target = event.target
  const paths = event.path || (event.composedPath && event.composedPath()) // ios只支持10以上版本
  const pathsNum = paths.length
  if (target.getAttribute(attribute)) return target.getAttribute(attribute)
  let res = null
  for (let index = 0; index < pathsNum; index++) {
    const element = paths[index]
    try {
      res = element.getAttribute(attribute)
    } catch (error) {}
    if (element === el || res) break
  }
  return res
}
