<template>
  <div class="transactions-page">
    <!-- 筛选区 -->
    <div class="filter-section">
      <el-form :model="query" inline label-width="80px">
        <el-form-item label="时间范围" required>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="query.payMethod" placeholder="全部" clearable style="width: 140px">
            <el-option v-for="(v, k) in PayMethodMap" :key="k" :label="v.label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="query.payStatus" placeholder="全部" clearable style="width: 140px">
            <el-option v-for="(v, k) in PayStatusMap" :key="k" :label="v.label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button :icon="Download" @click="handleExportCSV" :disabled="!tableData.length">
            导出 CSV
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="admin-card" style="padding: 0">
      <div class="table-toolbar">
        <span class="total-tip">共 {{ pagination.total }} 条记录</span>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%" row-key="id">
        <el-table-column prop="orderNo" label="订单号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="accountPhone" label="手机号" width="130" />
        <el-table-column label="金额" width="100">
          <template #default="{ row }">{{ formatAmount(row.amount) }}</template>
        </el-table-column>
        <el-table-column label="支付方式" width="100">
          <template #default="{ row }">
            {{ PayMethodMap[row.payMethod as PayMethod]?.label || row.payMethod }}
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="100">
          <template #default="{ row }">
            <el-tag :type="PayStatusMap[row.payStatus as PayStatus]?.type" size="small">
              {{ PayStatusMap[row.payStatus as PayStatus]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="退款状态" width="100">
          <template #default="{ row }">
            <el-tag :type="RefundStatusMap[row.refundStatus as RefundStatus]?.type" size="small">
              {{ RefundStatusMap[row.refundStatus as RefundStatus]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支付时间" width="160">
          <template #default="{ row }">{{ formatTime(row.payTime) }}</template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { paymentApi } from '@/api/payment'
import type { TransactionItem } from '@/api/payment'
import {
  PayMethod, PayMethodMap,
  PayStatus, PayStatusMap,
  RefundStatus, RefundStatusMap,
} from '@/constants/enums'
import { formatTime, formatAmount, dateToUTCStart, dateToUTCEnd } from '@/utils/format'
import dayjs from 'dayjs'

const today = dayjs().format('YYYY-MM-DD')
const todayStart = dateToUTCStart(today)
const todayEnd = dateToUTCEnd(today)

const loading = ref(false)
const tableData = ref<TransactionItem[]>([])
const dateRange = ref<[string, string]>([today, today])

const query = reactive({
  startDate: todayStart,
  endDate: todayEnd,
  payMethod: '',
  payStatus: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

function handleDateChange(val: [string, string] | null) {
  query.startDate = val?.[0] ? dateToUTCStart(val[0]) : dateToUTCStart(today)
  query.endDate = val?.[1] ? dateToUTCEnd(val[1]) : dateToUTCEnd(today)
}

function buildParams() {
  const p: Record<string, unknown> = { ...query }
  if (!p.payMethod) delete p.payMethod
  if (!p.payStatus) delete p.payStatus
  return p
}

async function loadData() {
  loading.value = true
  try {
    const res = await paymentApi.getTransactions({
      ...buildParams(),
      page: pagination.page,
      pageSize: pagination.pageSize,
    } as Parameters<typeof paymentApi.getTransactions>[0])
    tableData.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  dateRange.value = [today, today]
  query.startDate = todayStart
  query.endDate = todayEnd
  query.payMethod = ''
  query.payStatus = ''
  pagination.page = 1
  loadData()
}

function handlePageChange(page: number) {
  pagination.page = page
  loadData()
}

function handleSizeChange(size: number) {
  pagination.pageSize = size
  pagination.page = 1
  loadData()
}

// CSV 导出（前端 Blob API）
function handleExportCSV() {
  if (!tableData.value.length) {
    ElMessage.warning('没有数据可导出')
    return
  }

  const headers = ['订单号', '手机号', '金额', '支付方式', '支付状态', '退款状态', '支付时间']
  const rows = tableData.value.map((row) => [
    row.orderNo,
    row.accountPhone,
    row.amount.toFixed(2),
    PayMethodMap[row.payMethod as PayMethod]?.label || row.payMethod,
    PayStatusMap[row.payStatus as PayStatus]?.label || row.payStatus,
    RefundStatusMap[row.refundStatus as RefundStatus]?.label || row.refundStatus,
    row.payTime ? formatTime(row.payTime) : '-',
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const bom = '\uFEFF' // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `transactions_${dateRange.value[0]}_${dateRange.value[1]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.transactions-page {
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

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}
</style>
