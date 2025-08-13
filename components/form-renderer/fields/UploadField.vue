<template>
  <u-form-item
      :label="field.translations[lang]?.label"
      :prop="field.field_key"
      :required="field.is_required === 1"
      :label-width="labelWidth"
  >
    <u-upload
        v-model="fileList"
        :action="uploadUrl"
        :header="uploadHeaders"
        :max-count="field.field_options?.limit || 9"
        :max-size="maxSize"
        :file-list="fileList"
        :multiple="field.field_options?.multiple"
        :disabled="disabled"
        :deletable="!disabled"
        :preview-full-image="true"
        :accept="acceptType"
        @on-success="handleSuccess"
        @on-remove="handleRemove"
        @on-error="handleError"
        @on-exceed="handleExceed"
        :width="160"
        :height="160"
    >
      <view class="upload-btn" slot="addBtn">
        <u-icon name="camera-fill" size="50" color="#999999"></u-icon>
        <text class="upload-text">{{ field.field_options?.buttonText || '选择文件' }}</text>
      </view>
    </u-upload>

    <text class="upload-tip" v-if="uploadTip">
      {{ uploadTip }}
    </text>

    <text class="field-help-text" v-if="field.translations[lang]?.help_text">
      {{ field.translations[lang].help_text }}
    </text>
  </u-form-item>
</template>

<script>
export default {
  name: 'UploadField',
  props: {
    field: Object,
    modelValue: [String, Array],
    lang: String,
    disabled: Boolean,
    formValues: Object,
    formRef: Object,
    labelWidth: {
      type: [String, Number],
      default: '160'
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      fileList: []
    }
  },
  computed: {
    uploadUrl() {
      return this.field.field_options?.uploadUrl || '/api/upload'
    },
    uploadHeaders() {
      return {
        Authorization: 'Bearer ' + uni.getStorageSync('token'),
        ...this.field.field_options?.headers
      }
    },
    maxSize() {
      const mb = this.field.field_options?.maxSize || 10
      return mb * 1024 * 1024
    },
    acceptType() {
      const accept = this.field.field_options?.accept
      if (!accept) return 'all'

      if (accept.includes('image')) return 'image'
      if (accept.includes('video')) return 'video'
      return 'all'
    },
    uploadTip() {
      const tips = []
      const options = this.field.field_options || {}

      if (options.accept) {
        tips.push(`支持格式：${options.accept}`)
      }

      if (options.maxSize) {
        tips.push(`单个文件不超过 ${options.maxSize}MB`)
      }

      if (options.limit) {
        tips.push(`最多上传 ${options.limit} 个文件`)
      }

      return tips.join('，')
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (!val) {
          this.fileList = []
          return
        }

        if (typeof val === 'string') {
          this.fileList = [{
            url: val,
            status: 'success'
          }]
        } else if (Array.isArray(val)) {
          this.fileList = val.map(url => ({
            url: url,
            status: 'success'
          }))
        }
      }
    }
  },
  methods: {
    handleSuccess(data, index, lists, name) {
      // 假设返回格式为 { url: 'xxx' }
      if (data.url) {
        this.fileList[index].url = data.url
        this.updateValue()
      }
    },
    handleRemove(index, lists, name) {
      this.fileList.splice(index, 1)
      this.updateValue()
    },
    handleError(data, index, lists, name) {
      uni.showToast({
        title: '上传失败',
        icon: 'none'
      })
    },
    handleExceed(lists, name) {
      uni.showToast({
        title: `最多上传 ${this.field.field_options?.limit} 个文件`,
        icon: 'none'
      })
    },
    updateValue() {
      const urls = this.fileList
          .filter(f => f.status === 'success' && f.url)
          .map(f => f.url)

      if (this.field.field_options?.multiple) {
        this.$emit('update:modelValue', urls)
      } else {
        this.$emit('update:modelValue', urls[0] || '')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 160rpx;
  background-color: #f4f5f7;
  border-radius: 8rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999999;
  margin-top: 10rpx;
}

.upload-tip {
  font-size: 24rpx;
  color: #909399;
  margin-top: 10rpx;
  display: block;
}

.field-help-text {
  font-size: 24rpx;
  color: #909399;
  margin-top: 10rpx;
  display: block;
}
</style>
