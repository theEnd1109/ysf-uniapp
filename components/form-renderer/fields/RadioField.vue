<template>
  <u-form-item
      :label="field.translations[lang]?.label"
      :prop="field.field_key"
      :required="field.is_required === 1"
      :label-width="labelWidth"
  >
    <u-radio-group
        v-model="value"
        :placement="field.field_options?.direction === 'vertical' ? 'column' : 'row'"
        :disabled="disabled"
    >
      <u-radio
          v-for="option in options"
          :key="option.value"
          :name="option.value"
          :label="option.label"
          :disabled="option.disabled"
      />
    </u-radio-group>
    <text class="field-help-text" v-if="field.translations[lang]?.help_text">
      {{ field.translations[lang].help_text }}
    </text>
  </u-form-item>
</template>

<script>
import { getSelectOptions } from '../utils/optionsLoader'

export default {
  name: 'RadioField',
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
      options: []
    }
  },
  computed: {
    value: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    }
  },
  mounted() {
    this.loadOptions()
  },
  methods: {
    async loadOptions() {
      if (this.field.field_options?.dataSourceType === 'static') {
        this.options = this.field.translations[this.lang]?.options || []
      } else if (this.field.field_options?.dataSourceType === 'api') {
        try {
          this.options = await getSelectOptions(this.field.field_options.api)
        } catch (error) {
          console.error('Load options failed:', error)
        }
      }
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