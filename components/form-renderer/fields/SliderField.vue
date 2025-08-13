<template>
  <u-form-item
      :label="field.translations[lang]?.label"
      :prop="field.field_key"
      :required="field.is_required === 1"
      :label-width="labelWidth"
  >
    <view class="slider-container">
      <u-slider
          v-model="value"
          :min="field.field_options?.min || 0"
          :max="field.field_options?.max || 100"
          :step="field.field_options?.step || 1"
          :disabled="disabled"
          :block-size="30"
          :active-color="#2979ff"
          :inactive-color="#c0c4cc"
          :show-value="field.field_options?.showInput"
      />
      <text class="slider-value" v-if="!field.field_options?.showInput">
        {{ formatValue }}
      </text>
    </view>
    <text class="field-help-text" v-if="field.translations[lang]?.help_text">
      {{ field.translations[lang].help_text }}
    </text>
  </u-form-item>
</template>

<script>
export default {
  name: 'SliderField',
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
        return this.modelValue || this.field.field_options?.min || 0
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    },
    formatValue() {
      const unit = this.field.field_options?.unit || ''
      const prefix = this.field.field_options?.prefix || ''
      const suffix = this.field.field_options?.suffix || ''
      return `${prefix}${this.value}${unit}${suffix}`
    }
  }
}
</script>

<style lang="scss" scoped>
.slider-container {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.slider-value {
  font-size: 28rpx;
  color: #606266;
  min-width: 100rpx;
  text-align: right;
}

.field-help-text {
  font-size: 24rpx;
  color: #909399;
  margin-top: 10rpx;
  display: block;
}
</style>