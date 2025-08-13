import CryptoJS from 'crypto-js'

const AES = {
  METHODS: {
    'aes-128-cbc': { ivLength: 16, keyLength: 16 },
    'aes-192-cbc': { ivLength: 16, keyLength: 24 },
    'aes-256-cbc': { ivLength: 16, keyLength: 32 }
  },

  key: 'a7puYRHkXwwUO0qA3fRKuCwgTF5200Fq',

  encrypt(data, method = 'aes-256-cbc') {
    AES.validateMethod(method)

    if (method.includes('gcm')) {
      throw new Error('CryptoJS 不支持 GCM 模式，请使用 CBC 模式')
    }

    const iv = CryptoJS.lib.WordArray.random(AES.METHODS[method].ivLength)
    const key = CryptoJS.enc.Utf8.parse(AES.getValidKey(method))

    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    const result = CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext))
    return result
  },

  decrypt(encryptedData, method = 'aes-256-cbc') {
    AES.validateMethod(method)

    if (method.includes('gcm')) {
      throw new Error('CryptoJS 不支持 GCM 模式，请使用 CBC 模式')
    }

    const encryptedDataWordArray = CryptoJS.enc.Base64.parse(encryptedData)
    const ivLength = AES.METHODS[method].ivLength

    const iv = CryptoJS.lib.WordArray.create(
      encryptedDataWordArray.words.slice(0, ivLength / 4),
      ivLength
    )

    const ciphertext = CryptoJS.lib.WordArray.create(
      encryptedDataWordArray.words.slice(ivLength / 4),
      encryptedDataWordArray.sigBytes - ivLength
    )

    const key = CryptoJS.enc.Utf8.parse(AES.getValidKey(method))

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext },
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    )

    return decrypted.toString(CryptoJS.enc.Utf8)
  },

  generateKey(method = 'aes-256-cbc') {
    AES.validateMethod(method)
    const key = CryptoJS.lib.WordArray.random(AES.METHODS[method].keyLength)
    return CryptoJS.enc.Base64.stringify(key)
  },

  setKey(newKey) {
    AES.key = newKey
  },

  validateMethod(method) {
    if (!(method in AES.METHODS)) {
      throw new Error(`不支持的加密方法: ${method}`)
    }

    if (method.includes('gcm')) {
      throw new Error('CryptoJS 不支持 GCM 模式，请使用 CBC 模式')
    }
  },

  getValidKey(method) {
    const keyLength = AES.METHODS[method].keyLength
    return AES.key.substring(0, keyLength)
  }
}

export default AES

/**

import AES from '@/utils/aes.js'

export default {
  data() {
    return {
      originalText: 'hello uniapp',
      encrypted: '',
      decrypted: ''
    }
  },
  mounted() {
    const encrypted = AES.encrypt(this.originalText)
    const decrypted = AES.decrypt(encrypted)

    console.log('加密:', encrypted)
    console.log('解密:', decrypted)

    this.encrypted = encrypted
    this.decrypted = decrypted
  }
}
 */