import {baseURL} from "@/utils/net.config";

export function upload(file, data) {
    let platform = ''
// #ifdef H5
    platform = 'z-h5'
// #endif
// #ifdef MP-WEIXIN
    platform = 'z-applet'
// #endif
    return new Promise((resolve, reject) => {
        uni.uploadFile({
            header: {
                'platform': platform,
                'batoken': uni.getStorageSync('token') ? uni.getStorageSync('token') : '',
                'service': true,
                'think-lang' : 'zh-cn'
            },
            url: baseURL + '/api/upload',
            timeout: 1000 * 6,
            filePath: file,
            name: 'file',
            formData: data,
            success: (successData) => {
                const res = isString(successData.data) ? JSON.parse(successData.data) : successData.data
                if (res.code === 200) { //自定请求失败的情况，这里以常见的token失效或过期为例
                    resolve(res.data) //成功
                } else if (res.code === 401) {
                    // 请重新登录
                    reject(res)
                } else if (res.code === 402) {
                    // TOKEN过期
                    uni.removeStorageSync('token');
                    refresh({}).then(res => {
                        if (res.token) {
                            uni.setStorageSync('token', data.token)
                        }
                    })
                } else {
                    uni.showToast({
                        title: res.msg,
                        icon: 'none'
                    });
                    reject(res)
                }
            },
            fail: (msg) => {
                uni.showToast({
                    title: msg,
                    icon: 'none'
                });
                reject(msg)
            }
        })
    })
}