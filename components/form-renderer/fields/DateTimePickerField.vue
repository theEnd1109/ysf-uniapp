<template>
  <u-form-item
      :label="field.translations[lang]?.label"
      :prop="field.field_key"
      :required="field.is_required === 1"
      :label-width="labelWidth"
  >
    <u-input
        :value="displayValue"
        :placeholder="field.translations[lang]?.placeholder"
        :disabled="disabled"
        suffix-icon="calendar"
        readonly
        @click="showPicker = true"
    />

    <!-- 日期时间选择器 -->
    <u-datetime-picker
        :show="showPicker"
        v-model="pickerValue"
        :mode="pickerMode"
        :title="field.translations[lang]?.label"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="handleConfirm"
        @cancel="showPicker = false"
        confirm-color="#2979ff"
        cancel-color="#606266"
    />

    <text class="field-help-text" v-if="field.translations[lang]?.help_text">
      {{ field.translations[lang].help_text }}
    </text>
  </u-form-item>
</template>

<script>
export default {
  name: 'DateTimePickerField',
  props: {
    field: Object,
    modelValue: [String, Number, Array],
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
      showPicker: false,
      pickerValue: ''
    }
  },
  computed: {
    pickerMode() {
      const type = this.field.field_options?.type || 'datetime'
      const modeMap = {
        'datetime': 'datetime',
        'datetimerange': 'datetime',
        'year': 'year',
        'month': 'yearmonth'
      }
      return modeMap[type] || 'datetime'
    },
    displayValue() {
      if (!this.modelValue) return ''

      // 如果是日期时间范围
      if (this.isRangeType && Array.isArray(this.modelValue)) {
        const format = this.field.field_options?.format || 'YYYY-MM-DD HH:mm:ss'
        return `${this.formatDateTime(this.modelValue[0], format)} - ${this.formatDateTime(this.modelValue[1], format)}`
      }

      // 格式化显示
      const format = this.field.field_options?.format || 'YYYY-MM-DD HH:mm:ss'
      return this.formatDateTime(this.modelValue, format)
    },
    isRangeType() {
      const type = this.field.field_options?.type || 'datetime'
      return ['datetimerange'].includes(type)
    },
    minDate() {
      const options = this.field.field_options || {}

      if (options.disablePast) {
        return new Date().getTime()
      }

      if (options.minDate) {
        return new Date(options.minDate).getTime()
      }

      // 默认10年前
      return new Date().getTime() - 10 * 365 * 24 * 60 * 60 * 1000
    },
    maxDate() {
      const options = this.field.field_options || {}

      if (options.disableFuture) {
        return new Date().getTime()
      }

      if (options.maxDate) {
        return new Date(options.maxDate).getTime()
      }

      // 默认10年后
      return new Date().getTime() + 10 * 365 * 24 * 60 * 60 * 1000
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val) {
          if (this.isRangeType && Array.isArray(val)) {
            this.pickerValue = val[0] || ''
          } else {
            this.pickerValue = val
          }
        } else {
          this.pickerValue = this.getDefaultDateTime()
        }
      }
    }
  },
  methods: {
    handleConfirm(value) {
      const valueFormat = this.field.field_options?.valueFormat || 'YYYY-MM-DD HH:mm:ss'
      const formattedValue = this.formatPickerValue(value.value, valueFormat)

      if (this.isRangeType) {
        // 如果是范围选择，需要特殊处理
        // 这里简化处理，实际可能需要两次选择
        const currentValue = this.modelValue || []
        if (currentValue.length === 0) {
          this.$emit('update:modelValue', [formattedValue])
          uni.showToast({
            title: '请选择结束时间',
            icon: 'none'
          })
          // 再次打开选择器
          setTimeout(() => {
            this.showPicker = true
          }, 500)
        } else if (currentValue.length === 1) {
          this.$emit('update:modelValue', [...currentValue, formattedValue])
        } else {
          // 重新选择
          this.$emit('update:modelValue', [formattedValue])
        }
      } else {
        this.$emit('update:modelValue', formattedValue)
      }

      this.showPicker = false
    },
    formatDateTime(timestamp, format) {
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      return format
          .replace('YYYY', year)
          .replace('MM', month)
          .replace('DD', day)
          .replace('HH', hours)
          .replace('mm', minutes)
          .replace('ss', seconds)
    },
    formatPickerValue(value, format) {
      // 处理不同的格式
      if (typeof value === 'string') {
        // 如果返回的是字符串格式，直接返回
        return value
      }

      // 如果返回的是时间戳
      return this.formatDateTime(value, format)
    },
    getDefaultDateTime() {
      // 获取默认日期时间
      if (this.field.field_options?.defaultTime) {
        const defaultDate = new Date()
        const [hours, minutes, seconds] = this.field.field_options.defaultTime.split(':')
        defaultDate.setHours(parseInt(hours) || 0)
        defaultDate.setMinutes(parseInt(minutes) || 0)
        defaultDate.setSeconds(parseInt(seconds) || 0)
        return defaultDate.getTime()
      }

      return new Date().getTime()
    }
  }
}
</script>

<style lang="scss" scoped>
.field-help-text {
  font-size: 24rpx;
  color: #909399;
  margin-top: 10rpx;
  display: block;
}
</style>