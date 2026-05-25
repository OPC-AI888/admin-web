<template>
  <div class="order-list-page">
    <!-- 筛选区 -->
    <div class="filter-section">
      <el-form :model="query" inline label-width="80px">
        <el-form-item label="订单号">
          <el-input v-model="query.orderNo" placeholder="精确匹配" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="query.accountId" placeholder="精确匹配" clearable type="number" min="1" style="width: 160px" />
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="query.payStatus" placeholder="全部" clearable multiple style="width: 200px">
            <el-option v-for="(v, k) in PayStatusMap" :key="k" :label="v.label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="退款状态">
          <el-select v-model="query.refundStatus" placeholder="全部" clearable multiple style="width: 200px">
            <el-option v-for="(v, k) in RefundStatusMap" :key="k" :label="v.label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="query.payMethod" placeholder="全部" clearable style="width: 140px">
            <el-option v-for="(v, k) in PayMethodMap" :key="k" :label="v.label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付时间">
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
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计条 -->
    <div class="stats-bar admin-card">
      <div class="stat-item" v-if="!statsLoading">
        <span class="stat-label">订单数</span>
        <span class="stat-value">{{ stats.orderCount }}</span>
      </div>
      <el-divider direction="vertical" />
      <div class="stat-item" v-if="!statsLoading">
        <span class="stat-label">成交金额</span>
        <span class="stat-value success">{{ formatAmount(stats.totalAmount) }}</span>
      </div>
      <el-divider direction="vertical" />
      <div class="stat-item" v-if="!statsLoading">
        <span class="stat-label">退款金额</span>
        <span class="stat-value danger">{{ formatAmount(stats.refundAmount) }}</span>
      </div>
      <el-skeleton v-if="statsLoading" :rows="1" animated style="width: 300px" />
    </div>

    <!-- 表格 -->
    <div class="admin-card" style="padding: 0">
      <div class="table-toolbar">
        <span class="total-tip">共 {{ pagination.total }} 条记录</span>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%" row-key="id">
        <el-table-column prop="orderNo" label="订单号" min-width="180" show-overflow-tooltip />
        <el-table-column label="手机号" width="130">
          <template #default="{ row }">
            <el-tooltip :content="row.accountPhone" placement="top">
              <span class="phone-mask">{{ maskPhone(row.accountPhone) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="套餐" width="90">
          <template #default="{ row }">
            <el-tag :type="PlanTypeMap[row.planType as PlanType]?.type" size="small">
              {{ PlanTypeMap[row.planType as PlanType]?.label || row.planType }}
            </el-tag>
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" type="primary" link @click="router.push(`/orders/${row.id}`)">
                详情
              </el-button>
              <el-button
                v-permission="'SUPER_ADMIN'"
                v-if="row.payStatus === PayStatus.PAID && [RefundStatus.NONE, RefundStatus.REJECTED].includes(row.refundStatus)"
                size="small"
                type="danger"
                link
                @click="handleRefund(row)"
              >退款</el-button>
            </div>
          </template>
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

    <!-- 退款弹窗 -->
    <el-dialog v-model="refundDialog.visible" title="发起退款" width="500px" :close-on-click-modal="false">
      <el-alert
        type="error"
        show-icon
        :closable="false"
        style="margin-bottom: 16px"
      >
        <template #title>
          <strong>危险操作：</strong>退款操作不可撤销，请谨慎确认！
        </template>
        <template #default>
          订单号：{{ refundDialog.orderNo }}，原始金额：{{ formatAmount(refundDialog.maxAmount) }}
        </template>
      </el-alert>
      <el-form :model="refundDialog" :rules="refundRules" ref="refundFormRef" label-width="100px">
        <el-form-item label="退款金额" prop="refund_amount">
          <el-input-number
            v-model="refundDialog.refundAmount"
            :min="0.01"
            :max="refundDialog.maxAmount"
            :precision="2"
            :step="0.01"
            style="width: 100%"
          />
          <div class="form-hint">最大可退：{{ formatAmount(refundDialog.maxAmount) }}</div>
        </el-form-item>
        <el-form-item label="退款原因" prop="reason">
          <el-input
            v-model="refundDialog.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入退款原因（必填）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="refundDialog.visible = false">取消</el-button>
        <el-button type="danger" :loading="refundDialog.loading" @click="confirmRefund">
          确认退款
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { orderApi } from '@/api/order'
import type { OrderItem, OrderStats } from '@/api/order'
import {
  PlanType, PlanTypeMap,
  PayMethod, PayMethodMap,
  PayStatus, PayStatusMap,
  RefundStatus, RefundStatusMap,
} from '@/constants/enums'
import { formatTime, formatAmount, dateToUTCStart, dateToUTCEnd } from '@/utils/format'

const router = useRouter()

function maskPhone(phone: string): string {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 表格状态
const loading = ref(false)
const statsLoading = ref(false)
const tableData = ref<OrderItem[]>([])
const dateRange = ref<[string, string] | null>(null)

const stats = reactive<OrderStats>({
  orderCount: 0,
  totalAmount: 0,
  refundAmount: 0,
})

const query = reactive({
  orderNo: '',
  accountId: undefined as number | undefined,
  payStatus: [] as string[],
  refundStatus: [] as string[],
  payMethod: '',
  startDate: '',
  endDate: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

function handleDateChange(val: [string, string] | null) {
  query.startDate = val?.[0] ? dateToUTCStart(val[0]) : ''
  query.endDate = val?.[1] ? dateToUTCEnd(val[1]) : ''
}

function buildParams() {
  const p: Record<string, unknown> = { ...query }
  Object.keys(p).forEach((k) => {
    const v = p[k]
    if (v === '' || v == null || (Array.isArray(v) && v.length === 0)) delete p[k]
  })
  return p
}

async function loadData() {
  loading.value = true
  try {
    const res = await orderApi.getList({
      ...buildParams(),
      page: pagination.page,
      pageSize: pagination.pageSize,
    } as Parameters<typeof orderApi.getList>[0])
    tableData.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  statsLoading.value = true
  try {
    const res = await orderApi.getStats(buildParams() as Parameters<typeof orderApi.getStats>[0])
    Object.assign(stats, res)
  } finally {
    statsLoading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadData()
  loadStats()
}

function handleReset() {
  query.orderNo = ''
  query.accountId = undefined
  query.payStatus = []
  query.refundStatus = []
  query.payMethod = ''
  query.startDate = ''
  query.endDate = ''
  dateRange.value = null
  pagination.page = 1
  loadData()
  loadStats()
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

// 退款
const refundFormRef = ref<FormInstance>()
const refundDialog = reactive({
  visible: false,
  id: 0,
  orderNo: '',
  maxAmount: 0,
  refundAmount: 0,
  reason: '',
  loading: false,
})
const refundRules: FormRules = {
  refundAmount: [
    { required: true, message: '请输入退款金额', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value <= 0) callback(new Error('退款金额必须大于0'))
        else if (value > refundDialog.maxAmount) callback(new Error(`不能超过原始金额 ${formatAmount(refundDialog.maxAmount)}`))
        else callback()
      },
      trigger: 'blur',
    },
  ],
  reason: [{ required: true, message: '请输入退款原因', trigger: 'blur' }],
}

function handleRefund(row: OrderItem) {
  refundDialog.id = row.id
  refundDialog.orderNo = row.orderNo
  refundDialog.maxAmount = row.amount
  refundDialog.refundAmount = row.amount
  refundDialog.reason = ''
  refundDialog.visible = true
}

async function confirmRefund() {
  if (!refundFormRef.value) return
  const valid = await refundFormRef.value.validate().catch(() => false)
  if (!valid) return

  // 危险操作二次确认：输入"确认"
  try {
    await ElMessageBox.prompt(
      `此操作不可撤销，请在下方输入框中输入 "确认" 以继续退款操作`,
      '退款二次确认',
      {
        confirmButtonText: '确定退款',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger',
        inputPattern: /^确认$/,
        inputErrorMessage: '请输入"确认"两字',
        type: 'warning',
      }
    )
  } catch {
    return
  }

  refundDialog.loading = true
  try {
    await orderApi.refund(refundDialog.id, {
      refundAmount: refundDialog.refundAmount,
      reason: refundDialog.reason,
    })
    ElMessage.success('退款申请已提交')
    refundDialog.visible = false
    loadData()
    loadStats()
  } finally {
    refundDialog.loading = false
  }
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<style lang="scss" scoped>
.order-list-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 24px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stat-label {
    font-size: 13px;
    color: #8c8c8c;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 700;
    color: #262626;

    &.success { color: #52c41a; }
    &.danger { color: #f5222d; }
  }
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

.phone-mask {
  cursor: default;
  font-family: monospace;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.form-hint {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}
</style>
