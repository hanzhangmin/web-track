function _toPrimitive(t, r) {
  if ('object' != typeof t || !t) return t
  var e = t[Symbol.toPrimitive]
  if (void 0 !== e) {
    var i = e.call(t, r)
    if ('object' != typeof i) return i
    throw new TypeError('@@toPrimitive must return a primitive value.')
  }
  return String(t)
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, 'string')
  return 'symbol' == typeof i ? i : i + ''
}
function _typeof(o) {
  '@babel/helpers - typeof'

  return (
    (_typeof =
      'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
        ? function (o) {
            return typeof o
          }
        : function (o) {
            return o && 'function' == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype
              ? 'symbol'
              : typeof o
          }),
    _typeof(o)
  )
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i]
    descriptor.enumerable = descriptor.enumerable || false
    descriptor.configurable = true
    if ('value' in descriptor) descriptor.writable = true
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor)
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps)
  Object.defineProperty(Constructor, 'prototype', {
    writable: false,
  })
  return Constructor
}

/*! js-cookie v3.0.5 | MIT */
/* eslint-disable no-var */
function assign(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i]
    for (var key in source) {
      target[key] = source[key]
    }
  }
  return target
}
/* eslint-enable no-var */

/* eslint-disable no-var */
var defaultConverter = {
  read: function (value) {
    if (value[0] === '"') {
      value = value.slice(1, -1)
    }
    return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
  },
  write: function (value) {
    return encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent)
  },
}
/* eslint-enable no-var */

/* eslint-disable no-var */

function init(converter, defaultAttributes) {
  function set(name, value, attributes) {
    if (typeof document === 'undefined') {
      return
    }
    attributes = assign({}, defaultAttributes, attributes)
    if (typeof attributes.expires === 'number') {
      attributes.expires = new Date(Date.now() + attributes.expires * 864e5)
    }
    if (attributes.expires) {
      attributes.expires = attributes.expires.toUTCString()
    }
    name = encodeURIComponent(name)
      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape)
    var stringifiedAttributes = ''
    for (var attributeName in attributes) {
      if (!attributes[attributeName]) {
        continue
      }
      stringifiedAttributes += '; ' + attributeName
      if (attributes[attributeName] === true) {
        continue
      }

      // Considers RFC 6265 section 5.2:
      // ...
      // 3.  If the remaining unparsed-attributes contains a %x3B (";")
      //     character:
      // Consume the characters of the unparsed-attributes up to,
      // not including, the first %x3B (";") character.
      // ...
      stringifiedAttributes += '=' + attributes[attributeName].split(';')[0]
    }
    return (document.cookie = name + '=' + converter.write(value, name) + stringifiedAttributes)
  }
  function get(name) {
    if (typeof document === 'undefined' || (arguments.length && !name)) {
      return
    }

    // To prevent the for loop in the first place assign an empty array
    // in case there are no cookies at all.
    var cookies = document.cookie ? document.cookie.split('; ') : []
    var jar = {}
    for (var i = 0; i < cookies.length; i++) {
      var parts = cookies[i].split('=')
      var value = parts.slice(1).join('=')
      try {
        var found = decodeURIComponent(parts[0])
        jar[found] = converter.read(value, found)
        if (name === found) {
          break
        }
      } catch (e) {}
    }
    return name ? jar[name] : jar
  }
  return Object.create(
    {
      set,
      get,
      remove: function (name, attributes) {
        set(
          name,
          '',
          assign({}, attributes, {
            expires: -1,
          })
        )
      },
      withAttributes: function (attributes) {
        return init(this.converter, assign({}, this.attributes, attributes))
      },
      withConverter: function (converter) {
        return init(assign({}, this.converter, converter), this.attributes)
      },
    },
    {
      attributes: {
        value: Object.freeze(defaultAttributes),
      },
      converter: {
        value: Object.freeze(converter),
      },
    }
  )
}
var api = init(defaultConverter, {
  path: '/',
})

/**
 * @param {string} object
 * @returns {Boolean}
 */
function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
function objectMerge(target, source) {
  if (!isObject(target)) {
    target = {}
  }
  if (Array.isArray(source)) {
    return source.slice()
  }
  Object.keys(source).forEach(function (property) {
    var sourceProperty = source[property]
    if (_typeof(sourceProperty) === 'object') {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      target[property] = sourceProperty
    }
  })
  return target
}

/**
 * @param {string} url
 * @returns {Object}
 */
function param2Obj(url) {
  var search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  var obj = {}
  var searchArr = search.split('&')
  searchArr.forEach(function (v) {
    var index = v.indexOf('=')
    if (index !== -1) {
      var name = v.substring(0, index)
      var val = v.substring(index + 1, v.length)
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
function queryUrlParams(name) {
  var urlParams = new URLSearchParams(location.search)
  return urlParams.get(name) || ''
}

/**
 * 获取站点ID
 * @returns {String}
 */
function getMetaSpmA() {
  var _document$head$queryS
  return (
    ((_document$head$queryS = document.head.querySelector('[name="spm-a"]')) === null ||
    _document$head$queryS === void 0
      ? void 0
      : _document$head$queryS.content) || ''
  )
}

/**
 * 获取页面ID
 * @returns {String}
 */
function getSpmb() {
  var _document$head$queryS2
  return (
    ((_document$head$queryS2 = document.head.querySelector('[name="spm-b"]')) === null ||
    _document$head$queryS2 === void 0
      ? void 0
      : _document$head$queryS2.content) || ''
  )
}

/**
 * 获取是否自动上报pv
 * @returns {Boolean}
 */
function getMetaAutotrack() {
  var _document$head$queryS3
  return (
    ((_document$head$queryS3 = document.head.querySelector('[name="autotrack"]')) === null ||
    _document$head$queryS3 === void 0
      ? void 0
      : _document$head$queryS3.content) === 'true' || false
  )
}

/**
 * 获取页面级别的itemcode
 * @returns {Boolean}
 */
function getMetaItemcode() {
  var _document$head$queryS4
  return (
    ((_document$head$queryS4 = document.head.querySelector('[name="itemcode"]')) === null ||
    _document$head$queryS4 === void 0
      ? void 0
      : _document$head$queryS4.content) || ''
  )
}

/**
 * @descriptin 是否客户端
 * @returns {Boolean}
 */
var isClient = function isClient() {
  return typeof window !== 'undefined'
}

var g__randomString = null // 全局的pvid的定义是：sdk加载时（pageview事件）（在发送日志之前）生成一个随机id，由数字和大小写字母组成
var BuryingPoint = /*#__PURE__*/ (function () {
  function BuryingPoint() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
    _classCallCheck(this, BuryingPoint)
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
    this.other = options.other // 用于上报特殊参数
    this.callback = options.callback || null // 回调
    this.domain = options.domain || location.hostname // 当前domian
    this.userIdCacheKey = options.userIdCacheKey || 'd1_userid' // 当前站点用户ID缓存key
    this.keywordKey = options.keywordQueryKey || 'searchKey' // 当前站点搜索结果页url query key
    this.cateName = options.cateName || 'cateDisName' // 当前站点搜索结果页url query key
    // 处理时间维度
    this.SESSION_EXPIRE_TIME = options.sessionExpireTime || 30 * 60 * 1000 // 会话最大有效时间
    this.VISIT_TIME = new Date().getTime() // 当前访问时间
    this.last_vtz = api.get('d1_last_vt') || '' // 上次访问时间
    this.d1_s_vnum = api.get('d1_s_vnum') || '' // 曝光次数
    this.d1_s_clicks = api.get('d1_s_clicks') || '' // 点击次数
    this.d1_session = api.get('d1_session') || '' // session会话
    this.io = null // 监听io
    this.init()
  }
  return _createClass(BuryingPoint, [
    {
      key: 'isTime',
      get: function get() {
        // 距离上次访问时长
        return this.last_vtz !== '' ? this.VISIT_TIME - this.last_vtz : null
      },
    },
    {
      key: 'isExpire',
      get: function get() {
        // 会话失效或者首次访问
        return !this.isTime || this.isTime > this.SESSION_EXPIRE_TIME
      },
      // 初始化
    },
    {
      key: 'init',
      value: function init() {
        if (!g__randomString) g__randomString = this.randomString()
        // 设置最后访问时间
        this.setLastVtz()
        // 埋spm
        this.buryingSpm()
      },
      // 曝光
    },
    {
      key: 'expose',
      value: function expose() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
        var _this = this
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
      },
      // 点击
    },
    {
      key: 'click',
      value: function click() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
        // 设置请求报文
        this.event_body = objectMerge(
          {
            event_type: 'click',
            event_name: 'click',
            event_data: {
              event_entity_info: {
                link_type: 'click',
                item_code: options.itemcode,
              },
            },
          },
          options.event_body || {}
        )
        this.moduleIndex = options.moduleIndex || '1'
        this.setRequestVo()
        this.setPoint()
      },
      // 页面曝光
    },
    {
      key: 'pageview',
      value: function pageview() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
        // 页面曝光前重新定义pvid
        g__randomString = this.randomString()
        // 搜索结果页搜索关键词
        var keyword = options.keyword || queryUrlParams(this.keywordKey) || queryUrlParams(this.cateName) || ''
        // 设置请求报文
        this.event_body = objectMerge(
          {
            event_type: 'web_pageview',
            event_name: 'pageview',
            event_data: {
              event_entity_info: {
                item_code: options.itemcode,
                keyword: keyword,
              },
            },
          },
          options.event_body || {}
        )
        this.setRequestVo()
        this.setPoint()
      },
      // 设置最后访问时间
    },
    {
      key: 'setLastVtz',
      value: function setLastVtz() {
        if (this.isExpire) {
          api.set('d1_last_vt', this.VISIT_TIME, {
            domain: this.domain,
          })
        }
      },
      // 随机数
    },
    {
      key: 'randomString',
      value: function randomString() {
        var string_length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 20
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'
        var randomstring = ''
        for (var i = 0; i < string_length; i++) {
          var rnum = Math.floor(Math.random() * chars.length)
          randomstring += chars.substring(rnum, rnum + 1)
        }
        return randomstring
      },
      // 设置会话
    },
    {
      key: 'setSession',
      value: function setSession() {
        var d1_session = api.get('d1_session')
        var randomString = this.randomString()
        if (this.isExpire || !d1_session) {
          api.set('d1_session', randomString, {
            domain: this.domain,
          })
        }
      },
      // 设置点击次数
    },
    {
      key: 'setSclk',
      value: function setSclk() {
        var d1_s_clicks = api.get('d1_s_clicks')
        if (this.isExpire || !d1_s_clicks) {
          d1_s_clicks = 1
        } else {
          d1_s_clicks++
        }
        api.set('d1_s_clicks', d1_s_clicks, {
          domain: this.domain,
        })
        this.d1_s_clicks = d1_s_clicks
      },
      // 设置曝光次数
    },
    {
      key: 'setVnum',
      value: function setVnum() {
        var d1_s_vnum = api.get('d1_s_vnum')
        if (this.isExpire || !d1_s_vnum) {
          d1_s_vnum = 1
        } else {
          d1_s_vnum++
        }
        api.set('d1_s_vnum', d1_s_vnum, {
          domain: this.domain,
        })
        this.d1_s_vnum = d1_s_vnum
      },
      // 埋点
    },
    {
      key: 'setPoint',
      value: function setPoint() {
        var _this2 = this
        var lang = ''
        var site = ''
        var spmA = this.spm_a
        if (spmA) {
          lang = spmA.slice(-2) || ''
          site = spmA.slice(0, spmA.length - 2) || 'www'
        }
        var srcStr = {
          user_info: {
            vid: api.get('vid') || '',
            user_id: api.get(this.userIdCacheKey) || window.localStorage.getItem(this.userIdCacheKey) || '',
            session_id: api.get('d1_session') || api.get('session') || '',
          },
          device: {
            user_agent: navigator.userAgent || '',
            sr: window.screen.width + '*' + window.screen.height,
            ga_id: api.get('_ga') || '',
          },
          site_info: {
            site: site,
            lang: lang || api.get('language') || '',
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
          this.baseUrl.forEach(function (url) {
            _this2.sendLog(url, enSrcStr)
          })
        }
        this.callback && this.callback()
      },
      // 埋点请求
    },
    {
      key: 'sendLog',
      value: function sendLog(url, params) {
        if (navigator.sendBeacon) {
          this.sendBeacon(url, params)
        } else {
          this.createTrackLogImg(url, params)
        }
      },
      // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
    },
    {
      key: 'sendBeacon',
      value: function sendBeacon(url, params) {
        navigator.sendBeacon(''.concat(url, '?v=0.0.1&tacktype=web&site=www&status=true&data='), params)
      },
      // 生成图片，发送请求
    },
    {
      key: 'createTrackLogImg',
      value: function createTrackLogImg(url, enSrcStr) {
        var tracklogImg = new Image()
        tracklogImg.onload = function () {}
        tracklogImg.src = ''
          .concat(url, '?v=0.0.1&tacktype=web&site=www&status=true&data=')
          .concat(encodeURIComponent(enSrcStr))
      },
      // 获取URl上面的参数
    },
    {
      key: 'getUrlParam',
      value: function getUrlParam(key) {
        var url = location.href
        var paraObj = param2Obj(url)
        // 排除key=wedding+dresses#aa中#aa 把‘+’去掉
        var returnValue = paraObj[key]
        if (typeof returnValue === 'undefined') {
          return ''
        } else {
          return returnValue.replace(/(.+)#.*/, '$1').replace(/\+/g, ' ')
        }
      },
      // 处理请求参数
    },
    {
      key: 'setRequestVo',
      value: function setRequestVo() {
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
        _this.event_body.event_code = _this.event_code || ''
        _this.event_body.source = {
          f: api.get('ref_f') || '',
          url: location.href || '',
          ref_url: document.referrer || '',
          spm_ref: _this.getUrlParam('dspm') || '',
          spm_curr: _this.spm_a + '.' + _this.spm_b + '.0.0.0',
          pvid: g__randomString || '',
          vnum: _this.d1_s_vnum || '',
          s_clk: _this.d1_s_clicks || '',
          last_vt: _this.last_vtz || '',
          dh_aff: api.get('DHaff') || '',
          ref_utm: api.get('ref_utm') || '',
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
            _this.module.tagName === 'A'
              ? _this.module
              : _this.module.getElementsByTagName('a')[0] || _this.module.closest('a') || _this.module
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
              _this.spm_a +
              '.' +
              _this.spm_b +
              '.' +
              _this.moduleName +
              '.' +
              _this.moduleIndex +
              '.' +
              g__randomString,
            link_type: type || moduleEl.getAttribute('link-type') || 'item',
            other: _this.other || {},
          })
        }
      },
      // 给a链接埋dspm
    },
    {
      key: 'buryingSpm',
      value: function buryingSpm(track) {
        track = track || this.module
        if (_typeof(track) !== 'object') return
        var _this = this
        var spmA = this.spm_a || ''
        var spmB = this.spm_b || track.site || ''
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
          var isDOM = track instanceof HTMLElement
          var str = ''
          if (!isDOM) {
            var resourece = track.resourece || ''
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
                Array.from(track.getElementsByTagName('a')).forEach(function (v) {
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
      },
      // 设置a链接埋点链接
    },
    {
      key: 'setHref',
      value: function setHref(ele) {
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
      },
      // 处理链接
    },
    {
      key: 'handleUrl',
      value: function handleUrl(href) {
        var str = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ''
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
      },
    },
  ])
})()

// 埋点上报地址，支持多写
var spmBaseUrl = ['https://d1.dhmogo.com/track/tracklog.jsp']

/**
 *
 * @param {事件event} event
 * @param {获取的属性名称} attribute
 * @param {当前绑定事件的元素} el
 * @returns 属性值
 * @description 获取属性值
 */
var getAttribute = function getAttribute(event, attribute, el) {
  var target = event.target
  var paths = event.path || (event.composedPath && event.composedPath()) // ios只支持10以上版本
  var pathsNum = paths.length
  if (target.getAttribute(attribute)) return target.getAttribute(attribute)
  var res = null
  for (var index = 0; index < pathsNum; index++) {
    var element = paths[index]
    try {
      res = element.getAttribute(attribute)
    } catch (error) {}
    if (element === el || res) break
  }
  return res
}

// 处理应用初始化传递的optios参数
var mergeInitOptionsHandler = function mergeInitOptionsHandler() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
  var baseUrl = (options === null || options === void 0 ? void 0 : options.baseUrl) || spmBaseUrl // 上报地址
  var spm_a = (options === null || options === void 0 ? void 0 : options.spm_a) || getMetaSpmA() // 站点ID
  var spm_b = (options === null || options === void 0 ? void 0 : options.spm_b) || getSpmb() // 页面ID
  var userIdCacheKey = options === null || options === void 0 ? void 0 : options.userIdCacheKey // 站点用户ID缓存key
  var autotrack = (options === null || options === void 0 ? void 0 : options.autotrack) || getMetaAutotrack() || false // 是否自动上报pv
  return {
    baseUrl: baseUrl,
    spm_a: spm_a,
    spm_b: spm_b,
    userIdCacheKey: userIdCacheKey,
    autotrack: autotrack,
  }
}

// 暴露pageview事件
var pageView = function pageView(_ref) {
  var eventCode = _ref.eventCode,
    other = _ref.other,
    itemcode = _ref.itemcode,
    _ref$options = _ref.options,
    options = _ref$options === void 0 ? {} : _ref$options
  if (!isClient()) {
    return false
  }
  // 处理传参
  var mergeOptions = mergeInitOptionsHandler(options)
  var baseUrl = mergeOptions.baseUrl,
    spm_a = mergeOptions.spm_a,
    spm_b = mergeOptions.spm_b,
    userIdCacheKey = mergeOptions.userIdCacheKey
  var _itemcode = itemcode || getMetaItemcode()
  new BuryingPoint({
    baseUrl: baseUrl,
    spm_a: spm_a,
    module: 'page',
    spm_b: spm_b,
    event_code: eventCode,
    other: other,
    userIdCacheKey: userIdCacheKey,
  }).pageview({
    itemcode: _itemcode,
  })
}

// 暴露click事件
var traceClick = function traceClick(_ref2) {
  var spmc = _ref2.spmc,
    spmd = _ref2.spmd,
    _ref2$module = _ref2.module,
    module = _ref2$module === void 0 ? document.body : _ref2$module
  _ref2.eventCode
  var other = _ref2.other,
    options = _ref2.options,
    itemcode = _ref2.itemcode
  // 处理传参
  var mergeOptions = mergeInitOptionsHandler(options)
  var baseUrl = mergeOptions.baseUrl,
    spm_a = mergeOptions.spm_a,
    spm_b = mergeOptions.spm_b,
    userIdCacheKey = mergeOptions.userIdCacheKey
  new BuryingPoint({
    baseUrl: baseUrl,
    spm_a: spm_a,
    module: module,
    // element dom
    spm_b: spm_b,
    moduleName: spmc,
    // spm_c
    other: other,
    userIdCacheKey: userIdCacheKey,
  }).click({
    moduleIndex: spmd,
    itemcode: itemcode,
  })
}
// 暴露expose事件
var traceExpose = function traceExpose(_ref3) {
  var spmc = _ref3.spmc,
    spmd = _ref3.spmd,
    _ref3$module = _ref3.module,
    module = _ref3$module === void 0 ? document.body : _ref3$module
  _ref3.eventCode
  var other = _ref3.other,
    options = _ref3.options
  // 处理传参
  var mergeOptions = mergeInitOptionsHandler(options)
  var baseUrl = mergeOptions.baseUrl,
    spm_a = mergeOptions.spm_a,
    spm_b = mergeOptions.spm_b,
    userIdCacheKey = mergeOptions.userIdCacheKey
  new BuryingPoint({
    baseUrl: baseUrl,
    spm_a: spm_a,
    module: module,
    // element dom
    spm_b: spm_b,
    moduleName: spmc,
    // spm_c
    other: other,
    userIdCacheKey: userIdCacheKey,
  }).expose({
    moduleIndex: spmd,
  })
}

/**
 * @description 点击事件埋点
 */
var listenerTraceClickHandler = function listenerTraceClickHandler(event, options) {
  // 获取埋点元素信息
  var target = event.target
  var spmc = getAttribute(event, 'spm-c')
  getAttribute(event, 'event-code')
  var other = getAttribute(event, 'other')
  if (spmc) {
    var spmIndex = getAttribute(event, 'spm-index') || '1'
    var itemcode = getAttribute(event, 'itemcode') || ''
    traceClick({
      spmc: spmc,
      spmd: spmIndex,
      module: target,
      other: other,
      options: options,
      itemcode: itemcode,
    })
  }
}
/**
 * history事件绑定
 */
var bindHistoryEventListener = function bindHistoryEventListener(type) {
  var historyEvent = window.history[type]
  return function () {
    var newEvent = historyEvent.apply(this, arguments)
    var e = new Event(type)
    e.arguments = arguments
    window.dispatchEvent(e)
    return newEvent
  }
}

/**
 * 页面堆变化
 */
var onPageChange = function onPageChange(event, options) {
  pageView({
    options: options,
  })
}

/**
 * @description 自动埋点元素
 */
function autoTrack(attr) {
  if (!isClient()) {
    return false
  }
  // 处理传参
  var mergeOptions = mergeInitOptionsHandler(options)

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
  var observer = null
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver

  // 网页关闭之前取消监听
  window.addEventListener('beforeunload', function (e) {
    if (observer) observer.disconnect()
  })

  // 监听dom变化
  function checkDomReady() {
    // 检查指定节点是否有匹配
    var elements = [].slice.call(document.querySelectorAll('[event-type=expose]')).filter(function (item) {
      return !item.ready
    })
    var changeTotal = elements.length
    if (changeTotal > 0) {
      for (var index = 0; index < changeTotal; index++) {
        var element = elements[index]
        // 确保只会对该元素调用一次
        if (!element.ready) {
          element.ready = true
          // 对节点调用曝光监听
          var spmc = element.getAttribute('spm-c') || ''
          var spmd = element.getAttribute('spm-index') || '1'
          var other = element.getAttribute('other') || {}
          traceExpose({
            spmc: spmc,
            spmd: spmd,
            module: element,
            other: other,
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

export { autoTrack, listenerTraceClickHandler, pageView, traceClick, traceExpose }
//# sourceMappingURL=index.js.map
