// utils/jump.js

let jumping = false

/**
 * 全局页面跳转方法
 * @param {string} url - 页面路径或 navigateBack 的 delta 值（数字）
 * @param {string} type - 跳转类型 navigateTo / switchTab / redirectTo / reLaunch / navigateBack
 * @param {boolean} needLogin - 是否需要登录
 */
export function jump(url, type = 'navigateTo', needLogin = false) {
  if (jumping) return
  jumping = true

  if (needLogin && !uni.getStorageSync('token')) {
    uni.$u.toast('请先登录')
    jumping = false
    return
  }

  const jumpActions = {
    navigateTo: () => uni.navigateTo({ url, success, fail }),
    switchTab: () => uni.switchTab({ url, success, fail }),
    redirectTo: () => uni.redirectTo({ url, success, fail }),
    reLaunch: () => uni.reLaunch({ url, success, fail }),
    navigateBack: () => {
      const delta = parseInt(url) || 1
      uni.navigateBack({ delta })
      jumping = false
    }
  }

  const success = () => (jumping = false)
  const fail = () => (jumping = false)

  if (typeof jumpActions[type] === 'function') {
    jumpActions[type]()
  } else {
    console.warn(`[jumpUrl] 不支持的跳转类型: ${type}`)
    jumping = false
  }

  // 保险：解锁跳转
  setTimeout(() => {
    jumping = false
  }, 1000)
}