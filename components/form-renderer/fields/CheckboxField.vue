<template>
  <u-form-item
      :label="field.translations[lang]?.label"
      :prop="field.field_key"
      :required="field.is_required === 1"
      :label-width="labelWidth"
  >
    <u-checkbox-group
        v-model="value"
        :placement="field.field_options?.direction === 'vertical' ? 'column' : 'row'"
        :disabled="disabled"
        :max="field.field_options?.max || 999"
    >
      <u-checkbox
          v-for="option in options"
          :key="option.value"
          :name="option.value"
          :label="option.label"
          :disabled="option.disabled"
      />
    </u-checkbox-group>
    <view v-if="field.field_options?.showCheckAll" class="check-all">
      <u-checkbox
          v-model="checkAll"
          @change="handleCheckAllChange"
          label="全选"
      />
    </view>
    <text class="field-help-text" v-if="field.translations[lang]?.help_text">
      {{ field.translations[lang].help_text }}
    </text>
  </u-form-item>
</template>

<script>
import { getSelectOptions } from '../utils/optionsLoader'

export default {
  name: 'CheckboxField',
  props: {
    field: Object,
    modelValue: Array,
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
      options: [],
      checkAll: false
    }
  },
  computed: {
    value: {
      get() {
        return this.modelValue || []
      },
      set(val) {
        this.$emit('update:modelValue', val)
        this.updateCheckAllStatus(val)
      }
    }
  },
  watch: {
    modelValue(val) {
      this.updateCheckAllStatus(val || [])
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
    },
    handleCheckAllChange(checked) {
      if (checked) {
        this.value = this.options.map(opt => opt.value)
      } else {
        this.value = []
      }
    },
    updateCheckAllStatus(values) {
      this.checkAll = values.length === this.options.length && values.length > 0
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

.check-all {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1px solid #e4e7ed;
}
</style>