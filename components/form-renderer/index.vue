<template>
  <view class="form-renderer">
    <!-- 表单标题和描述 -->
    <view class="form-header" v-if="formData">
      <text class="form-title">{{ formData.translations?.[currentLang]?.title }}</text>
      <text class="form-description" v-if="formData.translations?.[currentLang]?.description">
        {{ formData.translations[currentLang].description }}
      </text>
    </view>

    <!-- 表单内容 -->
    <u-form
        ref="formRef"
        :model="formValues"
        :rules="formRules"
        :label-position="labelPosition"
        :label-width="labelWidth"
        :label-align="labelAlign"
        :error-type="errorType"
        v-if="formData && currentPageFields.length > 0"
    >
      <!-- 分页/步骤显示 -->
      <view class="form-steps" v-if="hasPageBreak && pageBreakConfig.breakType === 'step'">
        <u-steps
            :current="currentPage"
            :list="stepsList"
            active-color="#2979ff"
            inactive-color="#909399"
        />
      </view>

      <!-- 标签页显示 -->
      <u-tabs
          v-if="hasPageBreak && pageBreakConfig.breakType === 'tab'"
          :list="tabsList"
          :current="currentPage"
          @change="tabChange"
          active-color="#2979ff"
          inactive-color="#303133"
          :is-scroll="false"
      />

      <!-- 表单字段 -->
      <view class="form-fields">
        <view v-for="field in currentPageFields" :key="field.id">
          <component
              :is="getFieldComponent(field.field_type)"
              :field="field"
              :model-value="formValues[field.field_key]"
              @update:model-value="updateFieldValue(field.field_key, $event)"
              :lang="currentLang"
              :disabled="disabled || field.disabled"
              :form-values="formValues"
              :form-ref="formRef"
          />
        </view>
      </view>

      <!-- 分页按钮 -->
      <view
          class="form-pagination"
          v-if="hasPageBreak && pageBreakConfig.breakType !== 'tab'"
          :style="{ textAlign: pageBreakConfig.buttonAlign || 'right' }"
      >
        <u-button
            v-if="currentPage > 0"
            @click="prevPage"
            type="info"
            size="medium"
            :text="pageBreakConfig.prevButtonText || '上一页'"
        />

        <text class="page-info" v-if="pageBreakConfig.showPageNumber">
          {{ currentPage + 1 }} / {{ pages.length }}
        </text>

        <u-button
            v-if="currentPage < pages.length - 1"
            type="primary"
            size="medium"
            @click="nextPage"
            :text="pageBreakConfig.nextButtonText || '下一页'"
        />

        <u-button
            v-else
            type="primary"
            size="medium"
            @click="handleSubmit"
            :loading="loading"
            :text="pageBreakConfig.finishButtonText || '提交'"
        />
      </view>

      <!-- 无分页时的提交按钮 -->
      <view class="form-actions" v-if="!hasPageBreak">
        <u-button
            @click="handleReset"
            type="info"
            size="medium"
            text="重置"
            :custom-style="{ marginRight: '20rpx' }"
        />
        <u-button
            type="primary"
            size="medium"
            @click="handleSubmit"
            :loading="loading"
            text="提交"
        />
      </view>
    </u-form>

    <!-- 空状态 -->
    <u-empty
        v-else-if="!formData"
        text="暂无表单数据"
        mode="data"
    />
  </view>
</template>

<script>
import { ref, computed, reactive, watch, onMounted } from 'vue'

// 导入所有字段组件
import InputField from './fields/InputField.vue'
import TextareaField from './fields/TextareaField.vue'
import NumberField from './fields/NumberField.vue'
import SelectField from './fields/SelectField.vue'
import RadioField from './fields/RadioField.vue'
import CheckboxField from './fields/CheckboxField.vue'
import DatePickerField from './fields/DatePickerField.vue'
import TimePickerField from './fields/TimePickerField.vue'
import DateTimePickerField from './fields/DateTimePickerField.vue'
import SwitchField from './fields/SwitchField.vue'
import SliderField from './fields/SliderField.vue'
import RateField from './fields/RateField.vue'
import UploadField from './fields/UploadField.vue'
import CascaderField from './fields/CascaderField.vue'

export default {
  name: 'FormRenderer',
  components: {
    InputField,
    TextareaField,
    NumberField,
    SelectField,
    RadioField,
    CheckboxField,
    DatePickerField,
    TimePickerField,
    DateTimePickerField,
    SwitchField,
    SliderField,
    RateField,
    UploadField,
    CascaderField,
  },
  props: {
    // 表单数据，由父组件传入
    formData: {
      type: Object,
      default: null
    },
    // 表单初始值，由父组件传入
    initialValues: {
      type: Object,
      default: () => ({})
    },
    // 加载状态，由父组件控制
    loading: {
      type: Boolean,
      default: false
    },
    // 其他配置项
    labelPosition: {
      type: String,
      default: 'left'
    },
    labelWidth: {
      type: [String, Number],
      default: '160'
    },
    labelAlign: {
      type: String,
      default: 'left'
    },
    errorType: {
      type: String,
      default: 'message'
    },
    disabled: Boolean,
    lang: String
  },
  emits: ['submit', 'reset', 'update:values', 'validate-error'],
  setup(props, { emit, expose }) {
    const formRef = ref(null)
    const formValues = reactive({})
    const formRules = reactive({})
    const currentPage = ref(0)

    // 当前语言
    const currentLang = computed(() => props.lang || uni.getLocale() || 'zh-cn')

    // 字段组件映射
    const getFieldComponent = (type) => {
      const componentMap = {
        'input': 'InputField',
        'textarea': 'TextareaField',
        'number': 'NumberField',
        'select': 'SelectField',
        'radio': 'RadioField',
        'checkbox': 'CheckboxField',
        'date-picker': 'DatePickerField',
        'time-picker': 'TimePickerField',
        'datetime-picker': 'DateTimePickerField',
        'switch': 'SwitchField',
        'slider': 'SliderField',
        'rate': 'RateField',
        'color-picker': 'InputField', // uView没有颜色选择器，用输入框代替
        'upload': 'UploadField',
        'cascader': 'CascaderField',
        'transfer': 'CheckboxField', // uView没有穿梭框，用复选框代替
      }
      return componentMap[type] || 'InputField'
    }

    // 分页相关计算
    const pageBreakFields = computed(() => {
      if (!props.formData?.fields) return []
      return props.formData.fields.filter(f => f.field_type === 'page-break')
    })

    const hasPageBreak = computed(() => pageBreakFields.value.length > 0)

    const pageBreakConfig = computed(() => {
      if (!hasPageBreak.value) return {}
      return pageBreakFields.value[0]?.field_options || {}
    })

    // 计算页面
    const pages = computed(() => {
      if (!hasPageBreak.value || !props.formData?.fields) {
        return [{
          title: props.formData?.translations?.[currentLang.value]?.title || '',
          description: '',
          fields: props.formData?.fields || []
        }]
      }

      const allFields = props.formData.fields
      const pages = []
      let currentFields = []
      let pageInfo = {
        title: '第1页',
        description: '',
        icon: ''
      }

      allFields.forEach(field => {
        if (field.field_type === 'page-break') {
          if (currentFields.length > 0) {
            pages.push({
              ...pageInfo,
              fields: currentFields
            })
          }
          currentFields = []
          pageInfo = field.field_options?.pageInfo || {
            title: `第${pages.length + 2}页`,
            description: '',
            icon: ''
          }
        } else {
          currentFields.push(field)
        }
      })

      if (currentFields.length > 0) {
        pages.push({
          ...pageInfo,
          fields: currentFields
        })
      }

      return pages
    })

    // 步骤条数据
    const stepsList = computed(() => {
      return pages.value.map((page, index) => ({
        name: page.title
      }))
    })

    // 标签页数据
    const tabsList = computed(() => {
      return pages.value.map((page, index) => ({
        name: page.title
      }))
    })

    // 当前页的字段
    const currentPageFields = computed(() => {
      if (!hasPageBreak.value) {
        return props.formData?.fields?.filter(f => f.field_type !== 'page-break') || []
      }
      return pages.value[currentPage.value]?.fields || []
    })

    // 监听表单数据变化，初始化表单
    watch(() => props.formData, (newData) => {
      if (newData) {
        initializeForm()
      }
    }, { immediate: true })

    // 监听初始值变化
    watch(() => props.initialValues, (newValues) => {
      if (newValues && Object.keys(newValues).length > 0) {
        Object.assign(formValues, newValues)
      }
    }, { deep: true, immediate: true })

    // 初始化表单
    const initializeForm = () => {
      if (!props.formData?.fields) return

      props.formData.fields.forEach(field => {
        if (field.field_type === 'page-break') return

        // 设置默认值（如果没有初始值）
        if (!formValues.hasOwnProperty(field.field_key)) {
          const defaultValue = getFieldDefaultValue(field)
          formValues[field.field_key] = defaultValue
        }

        // 构建验证规则
        const rules = buildFieldRules(field)
        if (rules.length > 0) {
          formRules[field.field_key] = rules
        }
      })
    }

    // 获取字段默认值
    const getFieldDefaultValue = (field) => {
      const options = field.field_options || {}

      if (options.defaultType === 'dynamic') {
        return getDynamicDefaultValue(field)
      }

      if (options.defaultValue !== undefined) {
        return options.defaultValue
      }

      const typeDefaults = {
        'checkbox': [],
        'transfer': [],
        'switch': false,
        'rate': 0,
        'slider': options.min || 0,
        'number': undefined,
      }

      return typeDefaults[field.field_type] || ''
    }

    // 获取动态默认值
    const getDynamicDefaultValue = (field) => {
      const options = field.field_options || {}

      switch (options.dynamicDefault) {
        case 'user_id':
          return uni.getStorageSync('userId') || ''
        case 'username':
          return uni.getStorageSync('username') || ''
        case 'url_param':
          // 从页面参数获取
          const pages = getCurrentPages()
          const currentPage = pages[pages.length - 1]
          return currentPage.options[options.urlParam] || ''
        case 'field_value':
          return formValues[options.relatedField] || ''
        default:
          return ''
      }
    }

    // 构建字段验证规则
    const buildFieldRules = (field) => {
      const rules = []
      const validationRules = field.validation_rules || {}
      const translations = field.translations?.[currentLang.value] || {}

      // 必填验证
      if (field.is_required || validationRules.required) {
        rules.push({
          required: true,
          message: `请填写${translations.label}`,
          trigger: ['blur', 'change']
        })
      }

      // 长度验证
      if (validationRules.min || validationRules.max) {
        rules.push({
          min: validationRules.min,
          max: validationRules.max,
          message: `长度应在 ${validationRules.min || 0} 到 ${validationRules.max || '∞'} 之间`,
          trigger: 'blur'
        })
      }

      // 模式验证
      if (validationRules.pattern) {
        const patterns = {
          email: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
          url: /^https?:\/\/.+$/,
          phone: /^1[3-9]\d{9}$/,
          number: /^\d+$/
        }

        if (patterns[validationRules.pattern]) {
          rules.push({
            pattern: patterns[validationRules.pattern],
            message: '格式不正确',
            trigger: 'blur'
          })
        }
      }

      return rules
    }

    // 更新字段值
    const updateFieldValue = (key, value) => {
      formValues[key] = value
      // 实时通知父组件值的变化
      emit('update:values', { ...formValues })
    }

    // 标签页切换
    const tabChange = (index) => {
      currentPage.value = index
    }

    // 上一页
    const prevPage = () => {
      if (currentPage.value > 0) {
        currentPage.value--
      }
    }

    // 下一页
    const nextPage = async () => {
      if (pageBreakConfig.value.validateOnNext) {
        // 验证当前页字段
        const currentFields = currentPageFields.value.map(f => f.field_key)
        try {
          await validateFields(currentFields)
          currentPage.value++
        } catch (error) {
          uni.showToast({
            title: '请完善当前页面的必填项',
            icon: 'none'
          })
        }
      } else {
        currentPage.value++
      }
    }

    // 验证指定字段
    const validateFields = (fields) => {
      return new Promise((resolve, reject) => {
        formRef.value.validate(fields, (valid, errors) => {
          if (valid) {
            resolve(true)
          } else {
            emit('validate-error', errors)
            reject(errors)
          }
        })
      })
    }

    // 验证整个表单
    const validate = () => {
      return new Promise((resolve, reject) => {
        formRef.value.validate((valid, errors) => {
          if (valid) {
            resolve(true)
          } else {
            emit('validate-error', errors)
            reject(errors)
          }
        })
      })
    }

    // 处理提交
    const handleSubmit = async () => {
      try {
        await validate()
        emit('submit', { ...formValues })
      } catch (error) {
        console.error('表单验证失败:', error)
      }
    }

    // 处理重置
    const handleReset = () => {
      formRef.value.resetFields()
      currentPage.value = 0
      emit('reset')
    }

    // 获取表单数据
    const getFormData = () => {
      return { ...formValues }
    }

    // 设置表单数据
    const setFormData = (data) => {
      Object.assign(formValues, data)
    }

    // 暴露方法给父组件
    expose({
      validate,
      validateFields,
      getFormData,
      setFormData,
      resetFields: handleReset
    })

    return {
      formRef,
      formValues,
      formRules,
      currentPage,
      currentLang,
      hasPageBreak,
      pageBreakConfig,
      pages,
      stepsList,
      tabsList,
      currentPageFields,
      getFieldComponent,
      updateFieldValue,
      tabChange,
      prevPage,
      nextPage,
      handleSubmit,
      handleReset,
    }
  }
}
</script>

<style lang="scss" scoped>
.form-renderer {
  padding: 20rpx;

  // 表单项间距
  :deep .u-form-item {
    margin-bottom: 30rpx;
  }

  // 标签样式
  :deep .u-form-item__body__left__content__label {
    color: #303133;
    font-size: 30rpx;
  }

  // 必填星号
  :deep .u-form-item__body__left__content__required {
    color: #fa3534;
    margin-right: 8rpx;
  }
}

.form-header {
  text-align: center;
  margin-bottom: 40rpx;

  .form-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #303133;
    display: block;
    margin-bottom: 20rpx;
  }

  .form-description {
    font-size: 28rpx;
    color: #909399;
    display: block;
  }
}

.form-steps {
  margin-bottom: 40rpx;
}

.form-fields {
  min-height: 600rpx;
}

.form-pagination {
  margin-top: 40rpx;
  padding-top: 30rpx;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 20rpx;

  .page-info {
    flex: 1;
    text-align: center;
    color: #909399;
    font-size: 28rpx;
  }
}

.form-actions {
  margin-top: 40rpx;
  display: flex;
  justify-content: center;
}
</style>