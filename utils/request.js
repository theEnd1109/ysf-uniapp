import {
    baseURL,
    isEncrypt
} from "@/utils/net.config";
import AES from '@/utils/aes.js'
import {jump} from "@/utils/jump";

let platform = ''
// #ifdef H5
platform = 'z-h5'
// #endif
// #ifdef MP-WEIXIN
platform = 'z-applet'
// #endif
let refreshToking = false
let requests = []
const baseRequest = async (url, method, data = {}, header = {}, loading = true) => {
    let requestHeader = {
        'platform': platform,
        'batoken': uni.getStorageSync('token') ? uni.getStorageSync('token') : '',
        'service': true,
        'think-lang' : 'zh-cn'
    }
    requestHeader = Object.assign(requestHeader, header)
    // uni.showLoading({
    //   title: '正在加载',
    //   mask: true
    // })
    console.log('请求数据', data)

    if (isEncrypt === 1) {
        data = AES.encrypt(data)
    }
    return new Promise((resolve, reject) => {
        uni.request({
            url: baseURL + url,
            method: method || 'POST',
            header: requestHeader,
            timeout: 10000,
            data: {
                params: data
            } || {},
            success: async (successData) => {
                const res = successData.data
                if (res.code === 200) { //自定请求失败的情况，这里以常见的token失效或过期为例
                    if (isEncrypt === 1) {
                        resolve(AES.decrypt(res.data)) //成功
                    } else {
                        resolve(res.data)
                    }
                } else if (res.code === 401) {
                    uni.showToast({
                        title: '请重新登录',
                        icon: 'none'
                    });
                    uni.removeStorageSync('token');
                    uni.removeStorageSync('token_expiration')
                    setTimeout(function () {
                        jump("/pages/login/login", "navigateTo")
                    }, 1000)
                    reject(res.msg)
                } else if (res.code === 402) {
                    // 刷新token
                    const res = await refresh(url, method, data)
                    resolve(res)
                } else {
                    uni.showToast({
                        title: res.msg,
                        icon: 'none'
                    });
                    reject(res.msg)
                }
                // uni.hideLoading();
            },
            fail: (msg) => {
                // uni.hideLoading();
                uni.showToast({
                    title: msg,
                    icon: 'none'
                });
                reject(msg)
            }
        })
    })
}

const request = {}
let arr = ['options', 'get', 'post', 'put', 'head', 'delete', 'trace', 'connect']
arr.forEach((method) => {
    request[method] = (api, data, header, loading) => baseRequest(api, method, data, header, loading)
})

const addRequestToQueue = (url, method, data) => {
    return new Promise((resolve) => {
        requests.push(() => resolve(baseRequest(url, method, data)));
    });
};

const refreshAndRetry = async (url, method, data) => {
    try {
        const {token} = await refreshToken();
        if (token) {
            uni.setStorageSync('token', token);

            // 成功刷新了 token，执行队列中的请求并清空队列
            const queuedRequests = [...requests]; // 复制队列
            requests = []; // 清空原队列

            // 依次执行队列中的请求
            for (const req of queuedRequests) {
                await req();
            }
            // 执行当前请求
            return baseRequest(url, method, data);
        }
    } catch (error) {
        throw error;
    } finally {
        refreshToking = false;
    }
};

const refresh = async (url, method, data) => {
    if (!refreshToking) {
        refreshToking = true;
        try {
            const result = await refreshAndRetry(url, method, data);
            return result;
        } catch (error) {
            jump("/pages/login/login", "navigateTo")
        }
    } else {
        return addRequestToQueue(url, method, data);
    }
};

export default request;