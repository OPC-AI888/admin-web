<template>
  <div class="pro-table">
    <!-- 工具栏插槽 -->
    <slot name="toolbar" />

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      :row-key="rowKey"
      stripe
      border
      style="width: 100%"
      v-bind="$attrs"
    >
      <template v-for="col in columns" :key="col.prop">
        <!-- 自定义插槽列 -->
        <el-table-column
          v-if="col.slot"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :fixed="col.fixed"
          :align="col.align || 'left'"
          :show-overflow-tooltip="col.showTooltip ?? true"
        >
          <template #default="scope">
            <slot :name="col.slot" v-bind="scope" />
          </template>
        </el-table-column>

        <!-- 格式化列 -->
        <el-table-column
          v-else
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :fixed="col.fixed"
          :align="col.align || 'left'"
          :show-overflow-tooltip="col.showTooltip ?? true"
          :formatter="col.formatter"
        />
      </template>

      <!-- 操作列插槽 -->
      <slot name="action-column" />
    </el-table>

    <!-- 分页 -->
    <div class="pro-table-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any

export interface ProTableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  slot?: string
  showTooltip?: boolean
  formatter?: (row: AnyRow, col: AnyRow, value: unknown) => string
}

const props = withDefaults(
  defineProps<{
    columns: ProTableColumn[]
    data: unknown[]
    total: number
    loading?: boolean
    rowKey?: string
    page?: number
    pageSize?: number
  }>(),
  {
    loading: false,
    rowKey: 'id',
    page: 1,
    pageSize: 20,
  },
)

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
}>()

const tableData = ref(props.data)
const currentPage = ref(props.page)
const currentPageSize = ref(props.pageSize)

watch(() => props.data, (val) => { tableData.value = val })
watch(() => props.page, (val) => { currentPage.value = val })
watch(() => props.pageSize, (val) => { currentPageSize.value = val })

function handlePageChange(page: number) {
  emit('page-change', page)
}

function handleSizeChange(size: number) {
  emit('size-change', size)
}

// 暴露 reload 方法（由父组件调用）
defineExpose({
  reload: () => {},
})
</script>

<style lang="scss" scoped>
.pro-table {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.pro-table-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}
</style>
