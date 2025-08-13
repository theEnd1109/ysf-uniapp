<template>
  <u-form-item
      :label="field.translations[lang]?.label"
      :prop="field.field_key"
      :required="field.is_required === 1"
      :label-width="labelWidth"
  >
    <view class="switch-wrapper">
      <u-switch
          v-model="value"
          :disabled="disabled"
          :loading="loading"
          :size="field.field_options?.size || 50"
          :active-color="field.field_options?.activeColor || '#2979ff'"
          :inactive-color="field.field_options?.inactiveColor || '#ffffff'"
          @change="handleChange"
      />
      <text class="switch-text" v-if="switchText">
        {{ switchText }}
      </text>
    </view>
    <text class="field-help-text" v-if="field.translations[lang]?.help_text">
      {{ field.translations[lang].help_text }}
    </text>
  </u-form-item>
</template>

<script>
export default {
  name: 'SwitchField',
  props: {
    field: Object,
    modelValue: [Boolean, String, Number],
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
      loading: false
    }
  },
  computed: {
    value: {
      get() {
        if (this.field.field_options?.valueType === 'custom') {
          return this.modelValue === this.field.field_options.activeValue
        }
        return !!this.modelValue
      },
      set(val) {
        let emitValue = val
        if (this.field.field_options?.valueType === 'custom') {
          emitValue = val
              ? this.field.field_options.activeValue
              : this.field.field_options.inactiveValue
        }
        this.$emit('update:modelValue', emitValue)
      }
    },
    switchText() {
      const activeText = this.field.field_options?.activeText
      const inactiveText = this.field.field_options?.inactiveText

      if (!activeText && !inactiveText) return ''

      return this.value ? activeText : inactiveText
    }
  },
  methods: {
    async handleChange(value) {
      if (this.field.field_options?.beforeChange) {
        uni.showModal({
          title: '提示',
          content: this.field.field_options.confirmText || '确定要切换开关状态吗？',
          success: (res) => {
            if (res.confirm) {
              this.value = value
            } else {
              // 恢复原值
              this.$nextTick(() => {
                this.value = !value
              })
            }
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.switch-wrapper {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.switch-text {
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