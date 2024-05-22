import BuryingPoint from './BuryingPoint'
import { spmBaseUrl } from './config'
import { getAttribute } from './dom'
import { getMetaSpmA, getSpmb, isClient, getMetaAutotrack, getMetaItemcode } from './utils'

// 处理应用初始化传递的optios参数
const mergeInitOptionsHandler = (options = {}) => {
  const baseUrl = options?.baseUrl || spmBaseUrl // 上报地址
  const spm_a = options?.spm_a || getMetaSpmA() // 站点ID
  const spm_b = options?.spm_b || getSpmb() // 页面ID
  const userIdCacheKey = options?.userIdCacheKey // 站点用户ID缓存key
  const autotrack = options?.autotrack || getMetaAutotrack() || false // 是否自动上报pv
  return {
    baseUrl,
    spm_a,
    spm_b,
    userIdCacheKey,
    autotrack,
  }
}

// 暴露pageview事件
export const pageView = ({ eventCode, other, itemcode, options = {} }) => {
  if (!isClient()) {
    return false
  }
  // 处理传参
  const mergeOptions = mergeInitOptionsHandler(options)
  const { baseUrl, spm_a, spm_b, userIdCacheKey } = mergeOptions
  const _itemcode = itemcode || getMetaItemcode()
  new BuryingPoint({
    baseUrl,
    spm_a,
    module: 'page',
    spm_b,
    event_code: eventCode,
    other,
    userIdCacheKey,
  }).pageview({
    itemcode: _itemcode,
  })
}

// 暴露click事件
export const traceClick = ({ spmc, spmd, module = document.body, eventCode, other, options, itemcode }) => {
  // 处理传参
  const mergeOptions = mergeInitOptionsHandler(options)
  const { baseUrl, spm_a, spm_b, userIdCacheKey } = mergeOptions
  new BuryingPoint({
    baseUrl,
    spm_a,
    module, // element dom
    spm_b,
    moduleName: spmc, // spm_c
    other,
    userIdCacheKey,
  }).click({
    moduleIndex: spmd,
    itemcode,
  })
}
// 暴露expose事件
export const traceExpose = ({ spmc, spmd, module = document.body, eventCode, other, options }) => {
  // 处理传参
  const mergeOptions = mergeInitOptionsHandler(options)
  const { baseUrl, spm_a, spm_b, userIdCacheKey } = mergeOptions
  new BuryingPoint({
    baseUrl,
    spm_a,
    module, // element dom
    spm_b,
    moduleName: spmc, // spm_c
    other,
    userIdCacheKey,
  }).expose({
    moduleIndex: spmd,
  })
}

/**
 * @description 点击事件埋点
 */
export const listenerTraceClickHandler = (event, options) => {
  // 获取埋点元素信息
  const target = event.target
  const spmc = getAttribute(event, 'spm-c')
  const eventCode = getAttribute(event, 'event-code')
  const other = getAttribute(event, 'other')
  if (spmc) {
    const spmIndex = getAttribute(event, 'spm-index') || '1'
    const itemcode = getAttribute(event, 'itemcode') || ''
    traceClick({
      spmc,
      spmd: spmIndex,
      module: target,
      other,
      options,
      itemcode,
    })
  }
}
/**
 * history事件绑定
 */
const bindHistoryEventListener = (type) => {
  const historyEvent = window.history[type]
  return function () {
    const newEvent = historyEvent.apply(this, arguments)
    const e = new Event(type)
    e.arguments = arguments
    window.dispatchEvent(e)
    return newEvent
  }
}

/**
 * 页面堆变化
 */
const onPageChange = (event, options) => {
  pageView({ options })
}

/**
 * @description 自动埋点元素
 */
export function autoTrack(attr) {
  if (!isClient()) {
    return false
  }
  // 处理传参
  const mergeOptions = mergeInitOptionsHandler(options)

  // 自动pv监听
  if (mergeOptions.autotrack) {
    pageView({
      options: mergeOptions,
    })
    // 针对vue react等单页应用路由重新绑定History相关事件
    window.history.pushState = bindHistoryEventListener('pushState')
    window.history.replaceState = bindHistoryEventListener('replaceState')
    window.addEventListener(
      'popstate',
      function (e) {
        onPageChange(e, mergeOptions)
      },
      false
    )
    window.addEventListener(
      'pushState',
      function (e) {
        onPageChange(e, mergeOptions)
      },
      false
    )
    window.addEventListener(
      'replaceState',
      function (e) {
        onPageChange(e, mergeOptions)
      },
      false
    )
  }

  // 点击事件监听
  window.addEventListener(
    'click',
    function (e) {
      listenerTraceClickHandler(e, mergeOptions)
    },
    false
  )
  // 曝光自动监听
  let observer = null
  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver

  // 网页关闭之前取消监听
  window.addEventListener('beforeunload', function (e) {
    if (observer) observer.disconnect()
  })

  // 监听dom变化
  function checkDomReady() {
    // 检查指定节点是否有匹配
    let elements = [].slice.call(document.querySelectorAll('[event-type=expose]')).filter((item) => !item.ready)
    const changeTotal = elements.length
    if (changeTotal > 0) {
      for (var index = 0; index < changeTotal; index++) {
        const element = elements[index]
        // 确保只会对该元素调用一次
        if (!element.ready) {
          element.ready = true
          // 对节点调用曝光监听
          const spmc = element.getAttribute('spm-c') || ''
          const spmd = element.getAttribute('spm-index') || '1'
          const other = element.getAttribute('other') || {}
          traceExpose({
            spmc,
            spmd,
            module: element,
            other,
            options: mergeOptions,
          })
        }
      }
    }
  }
  // 对document.body监听元素变化
  function observerEleReady() {
    if (!observer) {
      // 监听document变化
      observer = new MutationObserver(checkDomReady)
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    }
    // 检查该节点是否已经在DOM中
    checkDomReady()
  }
  observerEleReady()
}
