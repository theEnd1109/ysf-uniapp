<template>
  <u-form-item
      :label="field.translations[lang]?.label"
      :prop="field.field_key"
      :required="field.is_required === 1"
      :label-width="labelWidth"
  >
    <u-input
        :value="modelValue"
        @input="$emit('update:modelValue', $event)"
        :type="inputType"
        :placeholder="field.translations[lang]?.placeholder"
        :maxlength="field.field_options?.maxlength || -1"
        :disabled="disabled"
        :clearable="field.field_options?.clearable !== false"
        :password="field.field_options?.type === 'password'"
        :prefix-icon="field.field_options?.prefixIcon"
        :suffix-icon="field.field_options?.suffixIcon"
        :border="border"
    >
      <template #prefix v-if="field.field_options?.prefix">
        <text class="input-prefix">{{ field.field_options.prefix }}</text>
      </template>
      <template #suffix v-if="field.field_options?.suffix">
        <text class="input-suffix">{{ field.field_options.suffix }}</text>
      </template>
    </u-input>
    <text class="field-help-text" v-if="field.translations[lang]?.help_text">
      {{ field.translations[lang].help_text }}
    </text>
  </u-form-item>
</template>

<script>
export default {
  name: 'InputField',
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
    },
    border: {
      type: String,
      default: 'surround'
    }
  },
  emits: ['update:modelValue'],
  computed: {
    inputType() {
      const typeMap = {
        'text': 'text',
        'password': 'password',
        'email': 'text',
        'url': 'text',
        'tel': 'number',
        'number': 'number',
        'digit': 'digit',
        'idcard': 'idcard'
      }
      return typeMap[this.field.field_options?.type] || 'text'
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

.input-prefix,
.input-suffix {
  font-size: 28rpx;
  color: #606266;
}
</style>