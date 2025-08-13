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
        suffix-icon="arrow-down"
        readonly
        @click="showPicker = true"
    />

    <!-- 选择器弹窗 -->
    <u-picker
        :show="showPicker"
        :columns="columns"
        :default-index="defaultIndex"
        @cancel="showPicker = false"
        @confirm="handleConfirm"
        :title="field.translations[lang]?.label"
        confirm-color="#2979ff"
        cancel-color="#606266"
    />

    <text class="field-help-text" v-if="field.translations[lang]?.help_text">
      {{ field.translations[lang].help_text }}
    </text>
  </u-form-item>
</template>

<script>
import { getSelectOptions } from '../utils/optionsLoader'

export default {
  name: 'SelectField',
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
      options: [],
      loading: false
    }
  },
  computed: {
    columns() {
      if (this.field.field_options?.multiple) {
        // 多选模式，使用多列选择
        return this.options.map(opt => ({
          values: [opt],
          defaultIndex: this.modelValue?.includes(opt.value) ? 0 : -1
        }))
      }

      // 单选模式
      return [this.options.map(opt => opt.label)]
    },
    defaultIndex() {
      if (!this.modelValue) return [0]

      const index = this.options.findIndex(opt => opt.value === this.modelValue)
      return [index >= 0 ? index : 0]
    },
    displayValue() {
      if (!this.modelValue) return ''

      if (this.field.field_options?.multiple && Array.isArray(this.modelValue)) {
        return this.modelValue
            .map(val => this.options.find(opt => opt.value === val)?.label || val)
            .join(', ')
      }

      const option = this.options.find(opt => opt.value === this.modelValue)
      return option?.label || ''
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
        this.loading = true
        try {
          this.options = await getSelectOptions(this.field.field_options.api)
        } catch (error) {
          console.error('Load options failed:', error)
        } finally {
          this.loading = false
        }
      }
    },
    handleConfirm(value) {
      if (this.field.field_options?.multiple) {
        // 多选处理
        const selectedValues = value.indexs
            .map((indexes, colIndex) => {
              if (indexes[0] >= 0) {
                return this.options[colIndex].value
              }
              return null
            })
            .filter(v => v !== null)

        this.$emit('update:modelValue', selectedValues)
      } else {
        // 单选处理
        const index = value.indexs[0]
        const selectedOption = this.options[index]
        this.$emit('update:modelValue', selectedOption?.value || '')
      }

      this.showPicker = false
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