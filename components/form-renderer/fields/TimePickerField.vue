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
        suffix-icon="clock"
        readonly
        @click="showPicker = true"
    />

    <!-- 时间选择器 -->
    <u-datetime-picker
        :show="showPicker"
        v-model="pickerValue"
        mode="time"
        :title="field.translations[lang]?.label"
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
  name: 'TimePickerField',
  props: {
    field: Object,
    modelValue: String,
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
    displayValue() {
      if (!this.modelValue) return ''

      // 如果是时间范围
      if (this.field.field_options?.isRange && Array.isArray(this.modelValue)) {
        return `${this.modelValue[0]} - ${this.modelValue[1]}`
      }

      return this.modelValue
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        this.pickerValue = val || this.getDefaultTime()
      }
    }
  },
  methods: {
    handleConfirm(value) {
      const formattedValue = value.value
      this.$emit('update:modelValue', formattedValue)
      this.showPicker = false
    },
    getDefaultTime() {
      // 获取默认时间
      if (this.field.field_options?.defaultTime) {
        return this.field.field_options.defaultTime
      }

      // 返回当前时间
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')

      const format = this.field.field_options?.format || 'HH:mm:ss'

      if (format === 'HH:mm') {
        return `${hours}:${minutes}`
      }

      return `${hours}:${minutes}:${seconds}`
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