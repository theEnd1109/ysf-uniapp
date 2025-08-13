```vue
<template>
  <view class="container">
    <form-renderer
        ref="formRendererRef"
        :form-data="formData"
        :initial-values="initialValues"
        :loading="loading"
        @submit="handleSubmit"
        @reset="handleReset"
        @update:values="handleValuesChange"
        @validate-error="handleValidateError"
    />
  </view>
</template>

<script>
  import { ref, reactive } from 'vue'
  import FormRenderer from '@/components/form-renderer/index.vue'

  export default {
    components: {
      FormRenderer
    },
    setup() {
      const formRendererRef = ref(null)
      const formData = ref(null)
      const initialValues = reactive({})
      const loading = ref(false)

      // 加载表单数据
      const loadFormData = async () => {
        loading.value = true
        try {
          const res = await uni.request({
            url: '/api/forms/1/design',
            method: 'GET'
          })

          formData.value = res.data.data.form

          // 如果需要加载已保存的数据
          // initialValues.field1 = 'saved value'
          // initialValues.field2 = 123
        } catch (error) {
          uni.showToast({
            title: '加载失败',
            icon: 'none'
          })
        } finally {
          loading.value = false
        }
      }

      // 处理表单提交
      const handleSubmit = async (values) => {
        console.log('提交的表单数据:', values)

        loading.value = true
        try {
          const res = await uni.request({
            url: '/api/forms/submit',
            method: 'POST',
            data: {
              form_id: 1,
              form_data: values,
              // 其他数据...
            }
          })

          uni.showToast({
            title: '提交成功',
            icon: 'success'
          })

          // 提交成功后的处理
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (error) {
          uni.showToast({
            title: '提交失败',
            icon: 'none'
          })
        } finally {
          loading.value = false
        }
      }

      // 处理表单重置
      const handleReset = () => {
        console.log('表单已重置')
      }

      // 处理值变化
      const handleValuesChange = (values) => {
        console.log('表单值变化:', values)
      }

      // 处理验证错误
      const handleValidateError = (errors) => {
        console.log('验证错误:', errors)
      }

      // 页面加载时获取表单数据
      onMounted(() => {
        loadFormData()
      })

      return {
        formRendererRef,
        formData,
        initialValues,
        loading,
        handleSubmit,
        handleReset,
        handleValuesChange,
        handleValidateError
      }
    }
  }
</script>
```
### 主要改动说明

1. **Props 变化**：
    - 移除了 `formId`、`categoryId`、`userId` 等属性
    - 添加了 `formData`（表单结构数据）
    - 添加了 `initialValues`（表单初始值）
    - 添加了 `loading`（加载状态）

2. **事件变化**：
    - `submit` 事件只返回表单值，不再处理提交逻辑
    - 添加了 `reset` 事件
    - 添加了 `update:values` 事件，实时通知值变化
    - 添加了 `validate-error` 事件

3. **暴露的方法**：
    - `validate()` - 验证整个表单
    - `validateFields(fields)` - 验证指定字段
    - `getFormData()` - 获取表单数据
    - `setFormData(data)` - 设置表单数据
    - `resetFields()` - 重置表单

4. **数据流**：
    - 表单结构数据由父组件通过 `formData` prop 传入
    - 表单初始值通过 `initialValues` prop 传入
    - 加载状态由父组件控制
    - 提交逻辑完全由父组件处理

这样设计让表单渲染器更加灵活，父组件可以完全控制数据的加载和提交流程。