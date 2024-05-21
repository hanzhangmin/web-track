import BuryingPoint from './trace/BuryingPoint'
import { getAttribute } from './trace/dom'
import { getSpmb, isClient } from './trace/utils'

function checkOptions({ baseUrl = [], spma = '' }) {
  if (baseUrl && baseUrl.length === 0) {
    throw new Error('baseUrl is required')
  }
  if (spma === '') {
    throw new Error('spma is required')
  }
  return true
}

// pv埋点
export function pageView({ baseUrl = [], spma = '' }) {
  if (!checkOptions({ baseUrl, spma })) {
    return false
  }
  if (!isClient()) {
    return false
  }
  let spmb = getSpmb()
  const locale = getLocale()
  if (spmb === '') {
    throw new Error('spmb is required')
  }
  new BuryingPoint({
    module: 'page',
    baseUrl,
    spm_a: `${spma}${locale}`,
    spm_b: spmb,
  }).pageview()
}

// 点击埋点
export function clickTrack({ baseUrl = [], spma = '', spmc = '', spmd = '', module = document.body }) {
  if (!checkOptions({ baseUrl, spma })) {
    return false
  }
  let spmb = getSpmb()
  const locale = getLocale()
  new BuryingPoint({
    baseUrl,
    module: module, // element dom
    spm_a: `${spma}${locale}`,
    spm_b: spmb,
    moduleName: spmc, // spm_c
  }).click({
    moduleIndex: spmd,
  })
}

// 曝光埋点
export function exposeTrack({ baseUrl = [], spma = '', spmc = '', spmd = '', module = document.body }) {
  if (!checkOptions({ baseUrl, spma })) {
    return false
  }
  let spmb = getSpmb()
  const locale = getLocale()
  new BuryingPoint({
    baseUrl,
    module: module, // element dom
    spm_a: `${spma}${locale}`,
    spm_b: spmb,
    moduleName: spmc, // spm_c
  }).expose({
    moduleIndex: spmd,
  })
}

/**
 * @description 点击事件埋点
 */
function listenerTraceClickHandler(event) {
  // 获取埋点元素信息
  const target = event.target
  const spmc = getAttribute(event, 'spm-c')
  if (spmc) {
    const spmIndex = getAttribute(event, 'spm-index') || '1'
    this.click({
      spmc,
      spmd: spmIndex,
      module: target,
    })
  }
}

/**
 * @description 自动埋点元素
 */
export function autoTrack(attr) {
  if (!checkOptions(attr)) {
    return false
  }
  if (!isClient()) {
    return false
  }
  pageView(attr)
  window.addEventListener('click', listenerTraceClickHandler, false)
  // 网页关闭之前取消监听
  let observer = null
  window.addEventListener('beforeunload', function (e) {
    if (observer) observer.disconnect()
  })

  // 曝光自动监听
  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver
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
          traceExpose({
            spmc,
            spmd,
            module: element,
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
