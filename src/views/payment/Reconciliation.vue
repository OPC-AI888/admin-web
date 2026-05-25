<template>
  <div class="reconciliation-page">
    <!-- 日期选择 -->
    <div class="filter-section">
      <el-form inline>
        <el-form-item label="对账日期">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 160px"
            @change="loadData"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- KPI 卡片 -->
    <el-row :gutter="16" v-loading="loading">
      <el-col :xs="12" :sm="8" :lg="4">
        <div class="kpi-card">
          <div class="kpi-label">订单数</div>
          <div class="kpi-value">{{ data?.orderCount ?? '-' }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <div class="kpi-card">
          <div class="kpi-label">成功数</div>
          <div class="kpi-value">{{ data?.successCount ?? '-' }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <div class="kpi-card">
          <div class="kpi-label">成功金额</div>
          <div class="kpi-value kpi-value--green">{{ data ? formatAmount(data.successAmount) : '-' }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <div class="kpi-card">
          <div class="kpi-label">退款数</div>
          <div class="kpi-value">{{ data?.refundCount ?? '-' }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <div class="kpi-card">
          <div class="kpi-label">退款金额</div>
          <div class="kpi-value kpi-value--red">{{ data ? formatAmount(data.refundAmount) : '-' }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :lg="4">
        <div class="kpi-card">
          <div class="kpi-label">净收入</div>
          <div class="kpi-value kpi-value--blue">{{ data ? formatAmount(data.netIncome) : '-' }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 按支付方式分组 -->
    <div class="admin-card" v-if="data?.byPayMethod?.length">
      <div class="card-title">按支付方式明细</div>
      <el-table :data="data.byPayMethod" stripe style="width: 100%">
        <el-table-column label="支付方式" width="120">
          <template #default="{ row }">
            {{ PayMethodMap[row.payMethod as PayMethod]?.label || row.payMethod }}
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数" width="100" />
        <el-table-column prop="successCount" label="成功数" width="100" />
        <el-table-column label="成功金额" width="120">
          <template #default="{ row }">
            <span style="color: #52c41a; font-weight: 600">{{ formatAmount(row.successAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundCount" label="退款数" width="100" />
        <el-table-column label="退款金额" width="120">
          <template #default="{ row }">
            <span style="color: #f5222d">{{ formatAmount(row.refundAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="净收入">
          <template #default="{ row }">
            <span style="color: #1890ff; font-weight: 600">
              {{ formatAmount(row.successAmount - row.refundAmount) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-empty v-else-if="!loading" description="暂无对账数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { paymentApi } from '@/api/payment'
import type { ReconciliationData } from '@/api/payment'
import { PayMethod, PayMethodMap } from '@/constants/enums'
import { formatAmount, dateToUTCStart } from '@/utils/format'
import dayjs from 'dayjs'

const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

const loading = ref(false)
const selectedDate = ref(yesterday)
const data = ref<ReconciliationData | null>(null)

async function loadData() {
  loading.value = true
  try {
    data.value = await paymentApi.getReconciliation({ date: dateToUTCStart(selectedDate.value) })
  } catch {
    data.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.reconciliation-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kpi-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  margin-bottom: 0;
}

.kpi-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  color: #262626;

  &--green { color: #52c41a; }
  &--red { color: #f5222d; }
  &--blue { color: #1890ff; }
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 16px;
}
</style>
