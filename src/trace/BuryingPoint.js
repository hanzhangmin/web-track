import { objectMerge, param2Obj } from './utils'
import Cookies from 'js-cookie'
let g__randomString = null // 全局的pvid的定义是：sdk加载时（pageview事件）（在发送日志之前）生成一个随机id，由数字和大小写字母组成
class BuryingPoint {
  constructor(options = {}) {
    // 配置对象初始化
    this.baseUrl = options.baseUrl || '/' // 接口路径
    this.spm_a = options.spm_a || '' // 当前站点，对应spmA
    this.spm_b = options.spm_b // 当前页面， 对应spmB
    this.module = options.module // 当前模块
    this.moduleName = options.moduleName // 模块名称,对应spmC
    this.moduleIndex = options.moduleIndex || '1' // 模块索引，对应spmD
    this.resource = options.resource || '' // 来源id
    this.title = options.title || '' // 标题
    this.event_body = options.event_body // 事件body
    this.callback = options.callback || null // 回调
    this.domain = options.domain || location.hostname // 当前domian
    // 处理时间维度
    this.SESSION_EXPIRE_TIME = options.sessionExpireTime || 30 * 60 * 1000 // 会话最大有效时间
    this.VISIT_TIME = new Date().getTime() // 当前访问时间
    this.last_vtz = Cookies.get('d1_last_vt') || '' // 上次访问时间
    this.d1_s_vnum = Cookies.get('d1_s_vnum') || '' // 曝光次数
    this.d1_s_clicks = Cookies.get('d1_s_clicks') || '' // 点击次数
    this.d1_session = Cookies.get('d1_session') || '' // session会话
    this.io = null // 监听io
    this.init()
  }
  get isTime() {
    // 距离上次访问时长
    return this.last_vtz !== '' ? this.VISIT_TIME - this.last_vtz : null
  }
  get isExpire() {
    // 会话失效或者首次访问
    return !this.isTime || this.isTime > this.SESSION_EXPIRE_TIME
  }
  // 初始化
  init() {
    if (!g__randomString) g__randomString = this.randomString()
    // 设置最后访问时间
    this.setLastVtz()
    // 埋spm
    this.buryingSpm()
  }
  // 曝光
  expose(options = {}) {
    const _this = this
    this.event_body = objectMerge(
      {
        event_type: 'expose',
        event_name: 'web_expo',
        event_data: {
          event_entity_info: {},
        },
      },
      options.event_body || {}
    )
    this.moduleIndex = options.moduleIndex || '1'
    // 设置请求报文
    this.setRequestVo()
    // 监听元素是否出现可视区
    try {
      this.io = new IntersectionObserver(
        function (entries, observer) {
          if (entries && entries[0] && entries[0].isIntersecting) {
            // 停止监听（防止循环监听）
            observer.unobserve(_this.module)
            // 如果元素可见 开始埋点
            _this.setPoint()
          }
        },
        {
          threshold: [0.5],
        }
      )
      // 开始监听
      this.io.observe(_this.module)
    } catch (err) {
      console.error('IntersectionObserver-error', err)
    }
  }
  // 点击
  click(options = {}) {
    // 设置请求报文
    this.event_body = objectMerge(
      {
        event_type: 'click',
        event_name: 'click',
        event_data: {
          event_entity_info: {
            link_type: 'click',
          },
        },
      },
      options.event_body || {}
    )
    this.moduleIndex = options.moduleIndex || '1'
    this.setRequestVo()
    this.setPoint()
  }
  // 页面曝光
  pageview(options = {}) {
    // 页面曝光前重新定义pvid
    g__randomString = this.randomString()
    // 设置请求报文
    this.event_body = objectMerge(
      {
        event_type: 'web_pageview',
        event_name: 'pageview',
        event_data: {
          event_entity_info: {},
        },
      },
      options.event_body || {}
    )
    this.setRequestVo()
    this.setPoint()
  }
  // 设置最后访问时间
  setLastVtz() {
    if (this.isExpire) {
      Cookies.set('d1_last_vt', this.VISIT_TIME, { domain: this.domain })
    }
  }
  // 随机数
  randomString() {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'
    var string_length = 20
    var randomstring = ''
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length)
      randomstring += chars.substring(rnum, rnum + 1)
    }
    return randomstring
  }
  // 设置会话
  setSession() {
    const d1_session = Cookies.get('d1_session')
    const randomString = this.randomString()
    if (this.isExpire || !d1_session) {
      Cookies.set('d1_session', randomString, { domain: this.domain })
    }
  }
  // 设置点击次数
  setSclk() {
    let d1_s_clicks = Cookies.get('d1_s_clicks')
    if (this.isExpire || !d1_s_clicks) {
      d1_s_clicks = 1
    } else {
      d1_s_clicks++
    }
    Cookies.set('d1_s_clicks', d1_s_clicks, { domain: this.domain })
    this.d1_s_clicks = d1_s_clicks
  }
  // 设置曝光次数
  setVnum() {
    let d1_s_vnum = Cookies.get('d1_s_vnum')
    if (this.isExpire || !d1_s_vnum) {
      d1_s_vnum = 1
    } else {
      d1_s_vnum++
    }
    Cookies.set('d1_s_vnum', d1_s_vnum, { domain: this.domain })
    this.d1_s_vnum = d1_s_vnum
  }
  // 埋点
  setPoint() {
    let lang = ''
    let site = ''
    const spmA = this.spm_a
    if (spmA) {
      lang = spmA.slice(-2) || ''
      site = spmA.slice(0, spmA.length - 2) || 'www'
    }
    var srcStr = {
      user_info: {
        vid: Cookies.get('vid') || '',
        user_id: Cookies.get('b2b_buyerid') || window.localStorage.getItem('d1_userid') || '',
        session_id: Cookies.get('d1_session') || Cookies.get('session') || '',
      },
      device: {
        user_agent: navigator.userAgent || '',
        sr: window.screen.width + '*' + window.screen.height,
        ga_id: Cookies.get('_ga') || '',
      },
      site_info: {
        site: site,
        lang: lang || Cookies.get('language') || '',
      },
      visit_time: {
        time: new Date().getTime() || '',
        // "timezone": Intl.DateTimeFormat().resolvedOptions().timeZone || ""
        timezone: new Date().getTimezoneOffset() / 60 || '',
      },
      event_body: this.event_body,
    }
    var enSrcStr = JSON.stringify(srcStr)
    if (typeof this.baseUrl === 'string') {
      this.sendLog(this.baseUrl, enSrcStr)
    } else if (Array.isArray(this.baseUrl) && this.baseUrl.length) {
      this.baseUrl.forEach((url) => {
        this.sendLog(url, enSrcStr)
      })
    }
    this.callback && this.callback()
  }
  // 埋点请求
  sendLog(url, params) {
    if (navigator.sendBeacon) {
      this.sendBeacon(url, params)
    } else {
      this.createTrackLogImg(url, params)
    }
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
  sendBeacon(url, params) {
    navigator.sendBeacon(`${url}?v=0.0.1&tacktype=web&site=www&status=true&data=`, params)
  }
  // 生成图片，发送请求
  createTrackLogImg(url, enSrcStr) {
    var tracklogImg = new Image()
    tracklogImg.onload = function () {}
    tracklogImg.src = `${url}?v=0.0.1&tacktype=web&site=www&status=true&data=${encodeURIComponent(enSrcStr)}`
  }
  // 获取URl上面的参数
  getUrlParam(key) {
    var url = location.href
    var paraObj = param2Obj(url)
    // 排除key=wedding+dresses#aa中#aa 把‘+’去掉
    var returnValue = paraObj[key.toLowerCase()]
    if (typeof returnValue === 'undefined') {
      return ''
    } else {
      return returnValue.replace(/(.+)#.*/, '$1').replace(/\+/g, ' ')
    }
  }
  // 处理请求参数
  setRequestVo() {
    var _this = this
    var type = this.event_body.event_data.event_entity_info.link_type
    var link_type = _this.event_body.event_type === 'click' ? type : 'item'
    // 设置随机数
    if (!g__randomString) g__randomString = this.randomString()
    // 设置会话
    _this.setSession()
    if (type === 'click' || _this.event_body.event_type === 'click') {
      _this.setSclk()
    }
    _this.event_body.event_time = new Date().getTime() || ''
    _this.event_body.source = {
      f: Cookies.get('ref_f') || '',
      url: location.href || '',
      ref_url: document.referrer || '',
      spm_ref: _this.getUrlParam('dspm') || '',
      spm_curr: _this.spm_a + '.' + _this.spm_b + '.0.0.0',
      pvid: g__randomString || '',
      vnum: _this.d1_s_vnum || '',
      s_clk: _this.d1_s_clicks || '',
      last_vt: _this.last_vtz || '',
      dh_aff: Cookies.get('DHaff') || '',
      ref_utm: Cookies.get('ref_utm') || '',
    }
    if (_this.module === 'page') {
      // 页面加载
      _this.event_body.event_type = 'web_pageview'
      _this.event_body.event_name = 'pageview'
      _this.event_body.source.title = _this.title
      _this.setVnum()
    } else {
      // 各模块
      _this.event_body.event_type = this.event_body.event_type || 'expose'
      _this.event_body.event_name = this.event_body.event_name || 'web_expo'
      if (!_this.event_body.content_data) {
        _this.event_body.content_data = {
          ab_version: '',
        }
      }
      // 处理scm
      if (_this.event_body.content_data.scm) {
        _this.event_body.content_data.scm = _this.event_body.content_data.scm || {}
      }
      // a标签或有href属性则处理href或itemcode
      var itemcode = (this.event_body.event_data.event_entity_info.item_code || '').toString()
      var moduleEl =
        _this.module.tagName === 'A' ? _this.module : _this.module.getElementsByTagName('a')[0] || _this.module
      var href = moduleEl.getAttribute('href') || ''
      if (!itemcode) {
        itemcode =
          link_type === 'item' ? moduleEl.getAttribute('itemcode') || moduleEl.getAttribute('resource') || '' : ''
      }
      if (itemcode.indexOf('/') > -1) {
        itemcode = ''
      }
      objectMerge(_this.event_body.event_data.event_entity_info, {
        link_url: href.indexOf('/') > -1 ? href : '',
        link_title: moduleEl.getAttribute('title') || '',
        resource_id: _this.resource || moduleEl.getAttribute('resource') || '',
        item_code: itemcode,
        spm_link:
          _this.spm_a + '.' + _this.spm_b + '.' + _this.moduleName + '.' + _this.moduleIndex + '.' + g__randomString,
        link_type: type || moduleEl.getAttribute('link-type') || 'item',
      })
    }
  }
  // 给a链接埋dspm
  buryingSpm(track) {
    track = track || this.module
    if (typeof track !== 'object') return
    const _this = this
    const spmA = this.spm_a || ''
    const spmB = this.spm_b || track.site || ''
    return (function getD1() {
      // track 可以传对象，也可以传模块id ,可以直接传元素  (传对象返回的是链接)
      // pcen
      // site 首页站点hp
      // module 模块 如flashdeal
      // index 索引
      // resourece resource_id
      // rmdspm 去掉dspm=
      // isSlide 是否加? true去掉   默认是有
      // spm-param  true 不加dspm
      // event-type: event 点击埋点   click 发送点击事件
      const isDOM = track instanceof HTMLElement
      let str = ''
      if (!isDOM) {
        const resourece = track.resourece || ''
        if (track.rmdspm) {
          str = spmA + '.' + spmB + '.' + track.module + '.' + track.index + '.' + g__randomString
        } else {
          str = 'dspm=' + spmA + '.' + spmB + '.' + track.module + '.' + track.index + '.' + g__randomString
        }
        // 处理resourece字段
        if (resourece) str += '&resource_id=' + encodeURIComponent(resourece)
      } else {
        if (!track) {
          return
        }
        switch (track.tagName) {
          case 'A':
            _this.setHref(track)
            break
          default:
            Array.from(track.getElementsByTagName('a')).forEach((v) => {
              _this.setHref(v)
            })
        }
        return
      }
      if (track.url) {
        str = _this.handleUrl(track.url, str)
      } else {
        if (track.isSlide) {
          str = str.substring(0, str.length)
        } else {
          str = '?' + str.substring(0, str.length)
        }
      }

      return str
    })()
  }
  // 设置a链接埋点链接
  setHref(ele) {
    var href = ele.getAttribute('href') || 'javascript'
    var resource = ele.getAttribute('resource') || ele.getAttribute('itemcode') || ''
    var str = ''
    var strD1_click_type = ''
    var scm_id = ''
    var strResource = '&resource_id=' + encodeURIComponent(resource)
    if (href.indexOf('dspm=') > -1 || href.indexOf('javascript') > -1) {
      return
    }
    var spmA = this.spm_a || ''
    var spmB = this.spm_b || ''
    var spmC = ele.getAttribute('spm-c') || this.moduleName || ''
    var spmIndex = ele.getAttribute('spm-index') || this.moduleIndex || '1'
    str =
      'dspm=' +
      spmA +
      '.' +
      spmB +
      '.' +
      spmC +
      '.' +
      spmIndex +
      '.' +
      g__randomString +
      strResource +
      strD1_click_type +
      scm_id
    str = this.handleUrl(href, str)
    ele.setAttribute('href', str)
  }
  // 处理链接
  handleUrl(href, str = '') {
    if (href.indexOf('?') > -1) {
      if (href.indexOf('#') > -1) {
        str = href.replace('#', function (a, b) {
          return '&' + str + '#'
        })
      } else {
        str = href + '&' + str
      }
    } else {
      if (href.indexOf('#') > -1) {
        str = href.replace('#', function (a, b) {
          return '?' + str + '#'
        })
      } else {
        str = href + '?' + str
      }
    }
    return str
  }
}

export default BuryingPoint
