<template>
  <div class="order-detail-page">
    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else-if="detail">
      <!-- 返回 + 操作 -->
      <div class="detail-toolbar">
        <el-button :icon="ArrowLeft" @click="router.back()">返回</el-button>
        <div class="action-buttons">
          <el-button
            v-permission="'SUPER_ADMIN'"
            v-if="canRefund"
            type="danger"
            size="small"
            @click="handleRefund"
          >发起退款</el-button>
        </div>
      </div>

      <!-- 订单基本信息 -->
      <div class="admin-card">
        <div class="card-title">订单信息</div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="订单号" :span="2">
            <span style="font-family: monospace; font-weight: 600">{{ detail.order_no }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatTime(detail.created_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="套餐类型">
            <el-tag :type="PlanTypeMap[detail.plan_type as PlanType]?.type" size="small">
              {{ PlanTypeMap[detail.plan_type as PlanType]?.label || detail.plan_type }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="套餐名称">{{ detail.plan_name }}</el-descriptions-item>
          <el-descriptions-item label="金额">
            <span style="font-weight: 700; color: #f5222d">{{ formatAmount(detail.amount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ PayMethodMap[detail.pay_method as PayMethod]?.label || detail.pay_method }}
          </el-descriptions-item>
          <el-descriptions-item label="支付状态">
            <el-tag :type="PayStatusMap[detail.pay_status as PayStatus]?.type" size="small">
              {{ PayStatusMap[detail.pay_status as PayStatus]?.label }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="退款状态">
            <el-tag :type="RefundStatusMap[detail.refund_status as RefundStatus]?.type" size="small">
              {{ RefundStatusMap[detail.refund_status as RefundStatus]?.label }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付时间">
            {{ formatTime(detail.pay_time) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 关联用户信息 -->
      <div class="admin-card">
        <div class="card-title">关联用户</div>
        <div class="user-info-row">
          <div class="user-info-item">
            <span class="label">手机号：</span>
            <el-button
              type="primary"
              link
              @click="router.push(`/accounts/${detail.account_id}`)"
            >{{ detail.account_phone }}</el-button>
          </div>
          <div class="user-info-item" v-if="detail.account_nickname">
            <span class="label">昵称：</span>
            <span>{{ detail.account_nickname }}</span>
          </div>
          <div class="user-info-item">
            <span class="label">用户ID：</span>
            <span>{{ detail.account_id }}</span>
          </div>
        </div>
      </div>

      <!-- 退款历史 -->
      <div class="admin-card">
        <div class="card-title">退款历史</div>
        <el-table
          v-if="detail.refund_records && detail.refund_records.length"
          :data="detail.refund_records"
          stripe
          style="width: 100%"
        >
          <el-table-column label="退款金额" width="120">
            <template #default="{ row }">
              <span style="color: #f5222d; font-weight: 600">{{ formatAmount(row.amount) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="RefundStatusMap[row.status as RefundStatus]?.type" size="small">
                {{ RefundStatusMap[row.status as RefundStatus]?.label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="退款原因" min-width="200" show-overflow-tooltip />
          <el-table-column label="申请时间" width="160">
            <template #default="{ row }">{{ formatTime(row.created_time) }}</template>
          </el-table-column>
          <el-table-column label="处理时间" width="160">
            <template #default="{ row }">{{ formatTime(row.processed_time) }}</template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无退款记录" />
      </div>
    </template>

    <el-empty v-else description="订单不存在" />

    <!-- 退款弹窗 -->
    <el-dialog v-model="refundDialog.visible" title="发起退款" width="500px" :close-on-click-modal="false">
      <el-alert type="error" show-icon :closable="false" style="margin-bottom: 16px">
        <template #title><strong>危险操作：</strong>退款操作不可撤销，请谨慎确认！</template>
        <template #default>
          订单号：{{ detail?.order_no }}，原始金额：{{ formatAmount(detail?.amount) }}
        </template>
      </el-alert>
      <el-form :model="refundDialog" :rules="refundRules" ref="refundFormRef" label-width="100px">
        <el-form-item label="退款金额" prop="refund_amount">
          <el-input-number
            v-model="refundDialog.refund_amount"
            :min="0.01"
            :max="detail?.amount || 0"
            :precision="2"
            :step="0.01"
            style="width: 100%"
          />
          <div class="form-hint">最大可退：{{ formatAmount(detail?.amount) }}</div>
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
        <el-button type="danger" :loading="refundDialog.loading" @click="confirmRefund">确认退款</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { orderApi } from '@/api/order'
import type { OrderDetail } from '@/api/order'
import {
  PlanType, PlanTypeMap,
  PayMethod, PayMethodMap,
  PayStatus, PayStatusMap,
  RefundStatus, RefundStatusMap,
} from '@/constants/enums'
import { formatTime, formatAmount } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const orderId = Number(route.params.id)
const loading = ref(false)
const detail = ref<OrderDetail | null>(null)

const canRefund = computed(() => {
  if (!detail.value) return false
  return (
    detail.value.pay_status === PayStatus.PAID &&
    [RefundStatus.NONE, RefundStatus.REJECTED].includes(detail.value.refund_status as RefundStatus)
  )
})

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await orderApi.getDetail(orderId)
  } finally {
    loading.value = false
  }
}

// 退款
const refundFormRef = ref<FormInstance>()
const refundDialog = reactive({
  visible: false,
  refund_amount: 0,
  reason: '',
  loading: false,
})

const refundRules: FormRules = {
  refund_amount: [
    { required: true, message: '请输入退款金额', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value <= 0) callback(new Error('退款金额必须大于0'))
        else if (detail.value && value > detail.value.amount)
          callback(new Error(`不能超过原始金额 ${formatAmount(detail.value.amount)}`))
        else callback()
      },
      trigger: 'blur',
    },
  ],
  reason: [{ required: true, message: '请输入退款原因', trigger: 'blur' }],
}

function handleRefund() {
  refundDialog.refund_amount = detail.value?.amount || 0
  refundDialog.reason = ''
  refundDialog.visible = true
}

async function confirmRefund() {
  if (!refundFormRef.value) return
  const valid = await refundFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    await ElMessageBox.prompt(
      `此操作不可撤销，请在下方输入框中输入 "确认" 以继续退款`,
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
    await orderApi.refund(orderId, {
      refund_amount: refundDialog.refund_amount,
      reason: refundDialog.reason,
    })
    ElMessage.success('退款申请已提交')
    refundDialog.visible = false
    loadDetail()
  } finally {
    refundDialog.loading = false
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style lang="scss" scoped>
.order-detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-wrap {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.detail-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 16px;
}

.user-info-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.user-info-item {
  display: flex;
  align-items: center;
  gap: 4px;

  .label {
    font-size: 13px;
    color: #8c8c8c;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.form-hint {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
}
</style>
