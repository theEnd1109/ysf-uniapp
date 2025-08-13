<template>
  <u-form-item
      :label="field.translations[lang]?.label"
      :prop="field.field_key"
      :required="field.is_required === 1"
      :label-width="labelWidth"
  >
    <view class="rate-container">
      <u-rate
          v-model="value"
          :count="field.field_options?.max || 5"
          :disabled="disabled"
          :allow-half="field.field_options?.allowHalf"
          :size="36"
          :active-color="#fadb14"
          :inactive-color="#e8e8e8"
          :gutter="10"
      />
      <text class="rate-text" v-if="field.field_options?.showText || field.field_options?.showScore">
        {{ rateText }}
      </text>
    </view>
    <text class="field-help-text" v-if="field.translations[lang]?.help_text">
      {{ field.translations[lang].help_text }}
    </text>
  </u-form-item>
</template>

<script>
export default {
  name: 'RateField',
  props: {
    field: Object,
    modelValue: Number,
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
  computed: {
    value: {
      get() {
        return this.modelValue || 0
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    },
    rateText() {
      if (this.field.field_options?.showScore) {
        return `${this.value} / ${this.field.field_options?.max || 5}`
      }

      if (this.field.field_options?.showText && this.field.field_options?.texts) {
        const texts = this.field.field_options.texts
        const index = Math.ceil(this.value) - 1
        return texts[index] || ''
      }

      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.rate-container {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.rate-text {
  font-size: 28rpx;
  color: #606266;
}

.field-help-text {
  font-size: 24rpx;
  color: #909399;
  margin-top: 10rpx;
  display: block;
}
</style>