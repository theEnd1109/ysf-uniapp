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

    <!-- 级联选择器 -->
    <view class="cascader-popup">
      <u-popup
          :show="showPicker"
          mode="bottom"
          :round="10"
          @close="showPicker = false"
      >
        <view class="cascader-header">
          <text class="cascader-cancel" @click="showPicker = false">取消</text>
          <text class="cascader-title">{{ field.translations[lang]?.label }}</text>
          <text class="cascader-confirm" @click="handleConfirm">确定</text>
        </view>

        <view class="cascader-content">
          <scroll-view
              v-for="(column, index) in columns"
              :key="index"
              class="cascader-column"
              scroll-y
              :scroll-top="scrollTops[index]"
          >
            <view
                v-for="item in column"
                :key="item.value"
                class="cascader-item"
                :class="{ active: isItemSelected(item, index) }"
                @click="selectItem(item, index)"
            >
              {{ item.label }}
            </view>
          </scroll-view>
        </view>
      </u-popup>
    </view>

    <text class="field-help-text" v-if="field.translations[lang]?.help_text">
      {{ field.translations[lang].help_text }}
    </text>
  </u-form-item>
</template>

<script>
import { getCascaderOptions } from '../utils/optionsLoader'

export default {
  name: 'CascaderField',
  props: {
    field: Object,
    modelValue: [String, Array],
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
      columns: [],
      selectedValues: [],
      selectedItems: [],
      scrollTops: [],
      loading: false
    }
  },
  computed: {
    displayValue() {
      if (!this.modelValue) return ''

      if (this.field.field_options?.props?.multiple && Array.isArray(this.modelValue)) {
        return this.modelValue.map(val => this.getValuePath(val)).join('; ')
      }

      return this.getValuePath(this.modelValue)
    }
  },
  mounted() {
    this.loadOptions()
  },
  methods: {
    async loadOptions() {
      if (this.field.field_options?.dataSourceType === 'static') {
        this.options = this.field.field_options?.options || []
      } else if (this.field.field_options?.dataSourceType === 'api') {
        this.loading = true
        try {
          this.options = await getCascaderOptions(this.field.field_options.api)
        } catch (error) {
          console.error('Load options failed:', error)
        } finally {
          this.loading = false
        }
      }

      this.initColumns()
    },
    initColumns() {
      this.columns = [this.options]
      this.selectedValues = []
      this.selectedItems = []

      // 如果有默认值，初始化选中状态
      if (this.modelValue) {
        // 这里需要根据值找到对应的路径
        // 简化处理，实际需要递归查找
      }
    },
    selectItem(item, columnIndex) {
      // 更新选中值
      this.selectedValues[columnIndex] = item.value
      this.selectedItems[columnIndex] = item

      // 移除后续的选择
      this.selectedValues = this.selectedValues.slice(0, columnIndex + 1)
      this.selectedItems = this.selectedItems.slice(0, columnIndex + 1)
      this.columns = this.columns.slice(0, columnIndex + 1)

      // 如果有子级，添加新列
      if (item.children && item.children.length > 0) {
        this.columns.push(item.children)
      } else if (this.field.field_options?.props?.lazy) {
        // 懒加载
        this.loadLazyData(item, columnIndex)
      }
    },
    async loadLazyData(item, columnIndex) {
      this.loading = true
      try {
        const children = await getCascaderOptions(
            this.field.field_options.api,
            item.value
        )
        if (children.length > 0) {
          item.children = children
          this.columns.push(children)
        }
      } catch (error) {
        console.error('Load lazy data failed:', error)
      } finally {
        this.loading = false
      }
    },
    isItemSelected(item, columnIndex) {
      return this.selectedValues[columnIndex] === item.value
    },
    handleConfirm() {
      if (this.field.field_options?.props?.checkStrictly) {
        // 父子节点不关联，可以选择任意级别
        const lastValue = this.selectedValues[this.selectedValues.length - 1]
        this.$emit('update:modelValue', lastValue)
      } else {
        // 只能选择叶子节点
        const lastItem = this.selectedItems[this.selectedItems.length - 1]
        if (!lastItem || (lastItem.children && lastItem.children.length > 0)) {
          uni.showToast({
            title: '请选择完整路径',
            icon: 'none'
          })
          return
        }

        if (this.field.field_options?.props?.emitPath !== false) {
          this.$emit('update:modelValue', this.selectedValues)
        } else {
          this.$emit('update:modelValue', this.selectedValues[this.selectedValues.length - 1])
        }
      }

      this.showPicker = false
    },
    getValuePath(value) {
      // 根据值获取显示路径
      // 这里简化处理，实际需要递归查找
      if (Array.isArray(value)) {
        return this.selectedItems.map(item => item?.label).join(' / ')
      }
      return value
    }
  }
}
</script>

<style lang="scss" scoped>
.cascader-popup {
  position: relative;
}

.cascader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 88rpx;
  padding: 0 30rpx;
  border-bottom: 1px solid #e4e7ed;
}

.cascader-cancel,
.cascader-confirm {
  font-size: 30rpx;
  color: #606266;
}

.cascader-confirm {
  color: #2979ff;
}

.cascader-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #303133;
}

.cascader-content {
  display: flex;
  height: 600rpx;
}

.cascader-column {
  flex: 1;
  border-right: 1px solid #e4e7ed;

  &:last-child {
    border-right: none;
  }
}

.cascader-item {
  padding: 20rpx 30rpx;
  font-size: 28rpx;
  color: #606266;
  position: relative;

  &.active {
    color: #2979ff;
    background-color: #f5f7fa;

    &::after {
      content: '';
      position: absolute;
      right: 20rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 12rpx;
      height: 12rpx;
      background-color: #2979ff;
      border-radius: 50%;
    }
  }
}

.field-help-text {
  font-size: 24rpx;
  color: #909399;
  margin-top: 10rpx;
  display: block;
}
</style>