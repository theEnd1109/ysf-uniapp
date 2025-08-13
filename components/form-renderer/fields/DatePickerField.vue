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

    <!-- 日期选择器 -->
    <u-datetime-picker
        :show="showPicker"
        v-model="pickerValue"
        :mode="mode"
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
  name: 'DatePickerField',
  props: {
    field: Object,
    modelValue: [String, Number],
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
    mode() {
      const type = this.field.field_options?.type || 'date'
      const modeMap = {
        'date': 'date',
        'datetime': 'datetime',
        'year': 'year',
        'month': 'yearmonth',
        'daterange': 'daterange',
        'datetimerange': 'datetimerange'
      }
      return modeMap[type] || 'date'
    },
    displayValue() {
      if (!this.modelValue) return ''

      // 格式化显示
      const format = this.field.field_options?.format || 'YYYY-MM-DD'
      if (this.mode === 'datetime') {
        return this.formatDateTime(this.modelValue, format)
      }
      return this.formatDate(this.modelValue, format)
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
        this.pickerValue = val || ''
      }
    }
  },
  methods: {
    handleConfirm(value) {
      const valueFormat = this.field.field_options?.valueFormat || 'YYYY-MM-DD'
      const formattedValue = this.formatPickerValue(value, valueFormat)
      this.$emit('update:modelValue', formattedValue)
      this.showPicker = false
    },
    formatDate(timestamp, format) {
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      return format
          .replace('YYYY', year)
          .replace('MM', month)
          .replace('DD', day)
    },
    formatDateTime(timestamp, format) {
      const date = new Date(timestamp)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      return this.formatDate(timestamp, format)
          .replace('HH', hours)
          .replace('mm', minutes)
          .replace('ss', seconds)
    },
    formatPickerValue(value, format) {
      if (this.mode === 'datetime') {
        return this.formatDateTime(value.value, format)
      }
      return this.formatDate(value.value, format)
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