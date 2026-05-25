<template>
  <div class="plan-list-page">
    <div class="admin-card" style="padding: 0">
      <div class="table-toolbar">
        <span class="total-tip">共 {{ tableData.length }} 个套餐</span>
        <div class="toolbar-actions">
          <el-text type="info" size="small">仅 SUPER_ADMIN 可编辑套餐</el-text>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        row-key="id"
        :row-class-name="rowClassName"
      >
        <el-table-column label="套餐类型" width="100">
          <template #default="{ row }">
            <el-tag :type="PlanTypeMap[row.planType as PlanType]?.type" size="small">
              {{ PlanTypeMap[row.planType as PlanType]?.label || row.planType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="套餐名称" min-width="120" />
        <el-table-column label="价格" width="100">
          <template #default="{ row }">
            <span style="font-weight: 600; color: #f5222d">{{ formatAmount(row.price) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="每日拨打上限" width="120">
          <template #default="{ row }">
            {{ row.dailyDialLimit === -1 ? '无限制' : row.dailyDialLimit }}
          </template>
        </el-table-column>
        <el-table-column label="客户上限" width="100">
          <template #default="{ row }">
            {{ row.customerLimit === -1 ? '无限制' : row.customerLimit }}
          </template>
        </el-table-column>
        <el-table-column label="同步模式" width="140">
          <template #default="{ row }">
            {{ SyncModeMap[row.syncMode as SyncMode]?.label || row.syncMode }}
          </template>
        </el-table-column>
        <el-table-column label="数据导出" width="90">
          <template #default="{ row }">
            <el-tag :type="row.dataExport ? 'success' : 'info'" size="small">
              {{ row.dataExport ? '支持' : '不支持' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="体验天数" width="90">
          <template #default="{ row }">{{ row.trialDays || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
              {{ row.enabled ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-permission="'SUPER_ADMIN'"
                size="small"
                type="primary"
                link
                @click="router.push(`/plans/${row.id}/edit`)"
              >编辑</el-button>

              <el-button
                v-if="!row.enabled"
                size="small"
                type="success"
                link
                @click="handleEnable(row)"
              >上架</el-button>

              <el-button
                v-if="row.enabled"
                size="small"
                type="warning"
                link
                @click="handleDisable(row)"
              >下架</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { planApi } from '@/api/plan'
import type { PlanItem } from '@/api/plan'
import { PlanType, PlanTypeMap, SyncMode, SyncModeMap } from '@/constants/enums'
import { formatAmount } from '@/utils/format'
import { useConfirm } from '@/composables/useConfirm'

const router = useRouter()
const confirm = useConfirm()

const loading = ref(false)
const tableData = ref<PlanItem[]>([])

function rowClassName({ row }: { row: PlanItem }) {
  return !row.enabled ? 'row-disabled' : ''
}

async function loadData() {
  loading.value = true
  try {
    tableData.value = await planApi.getList()
  } finally {
    loading.value = false
  }
}

async function handleEnable(row: PlanItem) {
  const ok = await confirm({
    title: '上架确认',
    message: `确认上架套餐 <strong>${row.name}</strong>？上架后用户可购买该套餐。`,
    type: 'warning',
  })
  if (!ok) return
  try {
    await planApi.enable(row.id)
    ElMessage.success('上架成功')
    loadData()
  } catch { /* handled */ }
}

async function handleDisable(row: PlanItem) {
  const ok = await confirm({
    title: '下架确认',
    message: `确认下架套餐 <strong>${row.name}</strong>？下架后新用户将无法购买。`,
    type: 'warning',
  })
  if (!ok) return
  try {
    await planApi.disable(row.id)
    ElMessage.success('下架成功')
    loadData()
  } catch { /* handled */ }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.plan-list-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px 12px;
  border-bottom: 1px solid #f0f0f0;

  .total-tip {
    font-size: 13px;
    color: #8c8c8c;
  }
}

.action-buttons {
  display: flex;
  gap: 4px;
}

:deep(.row-disabled) {
  opacity: 0.5;
  background: #fafafa;
}
</style>
