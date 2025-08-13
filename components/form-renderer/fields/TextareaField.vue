<template>
  <u-form-item
      :label="field.translations[lang]?.label"
      :prop="field.field_key"
      :required="field.is_required === 1"
      :label-width="labelWidth"
  >
    <u-textarea
        :value="modelValue"
        @input="$emit('update:modelValue', $event)"
        :placeholder="field.translations[lang]?.placeholder"
        :maxlength="field.field_options?.maxlength || -1"
        :disabled="disabled"
        :count="field.field_options?.showWordLimit"
        :height="field.field_options?.rows ? field.field_options.rows * 50 : 200"
        :auto-height="field.field_options?.autosize"
        :border="border"
    />
    <text class="field-help-text" v-if="field.translations[lang]?.help_text">
      {{ field.translations[lang].help_text }}
    </text>
  </u-form-item>
</template>

<script>
export default {
  name: 'TextareaField',
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
    },
    border: {
      type: String,
      default: 'surround'
    }
  },
  emits: ['update:modelValue']
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