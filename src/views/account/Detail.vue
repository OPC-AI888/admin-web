<template>
  <div class="account-detail-page">
    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="8" animated />
    </div>

    <template v-else-if="detail">
      <!-- 返回 + 操作按钮 -->
      <div class="detail-toolbar">
        <el-button :icon="ArrowLeft" @click="router.back()">返回</el-button>
        <div class="action-buttons">
          <el-button
            v-if="detail.status !== UserStatus.BANNED"
            type="danger"
            size="small"
            @click="handleBan"
          >封禁</el-button>
          <el-button
            v-if="detail.status === UserStatus.BANNED"
            type="success"
            size="small"
            @click="handleUnban"
          >解封</el-button>
          <el-button type="warning" size="small" @click="grantDialog.visible = true">赠送时长</el-button>
          <el-button size="small" @click="handleResetPassword">重置密码</el-button>
        </div>
      </div>

      <!-- 基本信息卡 -->
      <div class="admin-card">
        <div class="user-basic-info">
          <el-avatar :size="72" class="user-avatar">
            {{ detail.nickname?.slice(0, 1) || detail.phone?.slice(-4) }}
          </el-avatar>
          <div class="user-meta">
            <div class="user-name">{{ detail.nickname || '未设置昵称' }}</div>
            <div class="user-phone">{{ detail.phone }}</div>
            <div class="user-tags">
              <el-tag :type="UserStatusMap[detail.status as UserStatus]?.type" size="small">
                {{ UserStatusMap[detail.status as UserStatus]?.label }}
              </el-tag>
              <span class="user-id">ID: {{ detail.id }}</span>
            </div>
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-val">{{ formatDate(detail.createdTime) }}</div>
              <div class="stat-key">注册时间</div>
            </div>
            <div class="stat-item">
              <div class="stat-val">{{ formatTime(detail.lastLoginTime) }}</div>
              <div class="stat-key">最近登录</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 面板 -->
      <div class="admin-card" style="padding: 0">
        <el-tabs v-model="activeTab" class="detail-tabs">
          <!-- Tab 1：当前订阅 -->
          <el-tab-pane label="当前订阅" name="subscription">
            <div class="tab-content">
              <template v-if="detail.subscription">
                <el-descriptions :column="3" border>
                  <el-descriptions-item label="套餐类型">
                    <el-tag :type="PlanTypeMap[detail.subscription.planType as PlanType]?.type">
                      {{ PlanTypeMap[detail.subscription.planType as PlanType]?.label }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="订阅状态">
                    <el-tag :type="SubscriptionStatusMap[detail.subscription.status as SubscriptionStatus]?.type">
                      {{ SubscriptionStatusMap[detail.subscription.status as SubscriptionStatus]?.label }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="同步模式">
                    {{ SyncModeMap[detail.subscription.syncMode as SyncMode]?.label }}
                  </el-descriptions-item>
                  <el-descriptions-item label="开始时间">
                    {{ formatTime(detail.subscription.startTime) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="到期时间">
                    {{ formatTime(detail.subscription.endTime) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="每日拨打上限">
                    {{ detail.subscription.dailyDialLimit === -1 ? '无限制' : detail.subscription.dailyDialLimit }}
                  </el-descriptions-item>
                  <el-descriptions-item label="客户数上限">
                    {{ detail.subscription.customerLimit === -1 ? '无限制' : detail.subscription.customerLimit }}
                  </el-descriptions-item>
                </el-descriptions>
              </template>
              <el-empty v-else description="暂无订阅信息" />
            </div>
          </el-tab-pane>

          <!-- Tab 2：订单历史 -->
          <el-tab-pane label="订单历史" name="orders">
            <div class="tab-content">
              <el-table :data="orderList" stripe style="width: 100%">
                <el-table-column prop="orderNo" label="订单号" min-width="160" show-overflow-tooltip />
                <el-table-column label="套餐" width="90">
                  <template #default="{ row }">
                    <el-tag :type="PlanTypeMap[row.planType as PlanType]?.type" size="small">
                      {{ PlanTypeMap[row.planType as PlanType]?.label }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="金额" width="90">
                  <template #default="{ row }">{{ formatAmount(row.amount) }}</template>
                </el-table-column>
                <el-table-column label="支付方式" width="90">
                  <template #default="{ row }">
                    {{ PayMethodMap[row.payMethod as PayMethod]?.label || row.payMethod }}
                  </template>
                </el-table-column>
                <el-table-column label="支付状态" width="90">
                  <template #default="{ row }">
                    <el-tag :type="PayStatusMap[row.payStatus as PayStatus]?.type" size="small">
                      {{ PayStatusMap[row.payStatus as PayStatus]?.label }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="退款状态" width="90">
                  <template #default="{ row }">
                    <el-tag :type="RefundStatusMap[row.refundStatus as RefundStatus]?.type" size="small">
                      {{ RefundStatusMap[row.refundStatus as RefundStatus]?.label }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="支付时间" width="160">
                  <template #default="{ row }">{{ formatTime(row.payTime) }}</template>
                </el-table-column>
                <el-table-column label="操作" width="80">
                  <template #default="{ row }">
                    <el-button size="small" link type="primary" @click="router.push(`/orders/${row.id}`)">
                      详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="!orderList.length" description="暂无订单记录" />
            </div>
          </el-tab-pane>

          <!-- Tab 3：同步信息 -->
          <el-tab-pane label="同步信息" name="sync">
            <div class="tab-content">
              <template v-if="detail.syncInfo">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="最近同步时间">
                    {{ formatTime(detail.syncInfo.syncedTime) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="数据大小">
                    {{ formatBytes(detail.syncInfo.dataSize) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="内容哈希（前8位）">
                    <code>{{ detail.syncInfo.contentHashPrefix || '-' }}</code>
                  </el-descriptions-item>
                </el-descriptions>
              </template>
              <el-empty v-else description="该用户暂未使用云同步" />
            </div>
          </el-tab-pane>

          <!-- Tab 4：使用统计 -->
          <el-tab-pane label="使用统计" name="stats">
            <div class="tab-content">
              <el-empty description="近30天使用统计（功能开发中）" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>

    <el-empty v-else description="用户不存在" />

    <!-- 封禁弹窗 -->
    <el-dialog v-model="banDialog.visible" title="封禁用户" width="440px" :close-on-click-modal="false">
      <el-alert
        :title="`确认封禁用户 ${detail?.phone}？封禁后用户将无法登录。`"
        type="warning"
        show-icon
        :closable="false"
        style="margin-bottom: 16px"
      />
      <el-form :model="banDialog" :rules="banRules" ref="banFormRef" label-width="80px">
        <el-form-item label="封禁原因" prop="reason">
          <el-input
            v-model="banDialog.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入封禁原因（必填）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="banDialog.visible = false">取消</el-button>
        <el-button type="danger" :loading="banDialog.loading" @click="confirmBan">确认封禁</el-button>
      </template>
    </el-dialog>

    <!-- 赠送时长弹窗 -->
    <el-dialog v-model="grantDialog.visible" title="赠送订阅时长" width="480px" :close-on-click-modal="false">
      <el-form :model="grantDialog" :rules="grantRules" ref="grantFormRef" label-width="90px">
        <el-form-item label="套餐类型" prop="planType">
          <el-select v-model="grantDialog.planType" placeholder="选择套餐" style="width: 100%">
            <el-option label="日卡" value="DAY_CARD" />
            <el-option label="月卡" value="MONTH_CARD" />
            <el-option label="年卡" value="YEAR_CARD" />
          </el-select>
        </el-form-item>
        <el-form-item label="赠送天数" prop="days">
          <el-input-number v-model="grantDialog.days" :min="1" :max="365" style="width: 100%" />
        </el-form-item>
        <el-form-item label="赠送原因" prop="reason">
          <el-input
            v-model="grantDialog.reason"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="grantDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="grantDialog.loading" @click="confirmGrant">确认赠送</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码结果 -->
    <el-dialog v-model="passwordDialog.visible" title="重置密码结果" width="420px">
      <el-alert type="success" show-icon :closable="false">
        <template #title>密码已重置，临时密码如下：</template>
      </el-alert>
      <div class="temp-password-box">
        <code class="temp-password">{{ passwordDialog.tempPassword }}</code>
        <el-button size="small" @click="copyPassword">复制</el-button>
      </div>
      <el-alert title="请告知用户尽快修改密码" type="warning" show-icon :closable="false" style="margin-top: 12px" />
      <template #footer>
        <el-button type="primary" @click="passwordDialog.visible = false">知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { accountApi } from '@/api/account'
import type { AccountDetail } from '@/api/account'
import {
  UserStatus, UserStatusMap,
  PlanType, PlanTypeMap,
  SubscriptionStatus, SubscriptionStatusMap,
  SyncMode, SyncModeMap,
  PayMethod, PayMethodMap,
  PayStatus, PayStatusMap,
  RefundStatus, RefundStatusMap,
} from '@/constants/enums'
import { formatTime, formatDate, formatAmount, formatBytes } from '@/utils/format'
import { useConfirm } from '@/composables/useConfirm'

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()

const accountId = Number(route.params.id)
const loading = ref(false)
const detail = ref<AccountDetail | null>(null)
const activeTab = ref('subscription')
const orderList = ref<unknown[]>([])

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await accountApi.getDetail(accountId)
    // 订单数据（实际由后端接口提供）
    // orderList.value = detail.value.orders || []
  } finally {
    loading.value = false
  }
}

// 封禁
const banFormRef = ref<FormInstance>()
const banDialog = reactive({ visible: false, reason: '', loading: false })
const banRules: FormRules = { reason: [{ required: true, message: '请输入封禁原因', trigger: 'blur' }] }

function handleBan() {
  banDialog.reason = ''
  banDialog.visible = true
}

async function confirmBan() {
  if (!banFormRef.value) return
  const valid = await banFormRef.value.validate().catch(() => false)
  if (!valid) return
  banDialog.loading = true
  try {
    await accountApi.ban(accountId, { reason: banDialog.reason })
    ElMessage.success('封禁成功')
    banDialog.visible = false
    loadDetail()
  } finally {
    banDialog.loading = false
  }
}

// 解封
async function handleUnban() {
  const ok = await confirm({
    title: '解封确认',
    message: `确认解封用户 <strong>${detail.value?.phone}</strong>？`,
    type: 'warning',
  })
  if (!ok) return
  try {
    await accountApi.unban(accountId)
    ElMessage.success('解封成功')
    loadDetail()
  } catch { /* empty */ }
}

// 赠送时长
const grantFormRef = ref<FormInstance>()
const grantDialog = reactive({
  visible: false,
  planType: '',
  days: 30,
  reason: '',
  loading: false,
})
const grantRules: FormRules = {
  planType: [{ required: true, message: '请选择套餐类型', trigger: 'change' }],
  days: [{ required: true, message: '请输入赠送天数', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入赠送原因', trigger: 'blur' }],
}

async function confirmGrant() {
  if (!grantFormRef.value) return
  const valid = await grantFormRef.value.validate().catch(() => false)
  if (!valid) return
  grantDialog.loading = true
  try {
    await accountApi.grant(accountId, {
      planType: grantDialog.planType,
      days: grantDialog.days,
      reason: grantDialog.reason,
    })
    ElMessage.success('赠送成功')
    grantDialog.visible = false
    loadDetail()
  } finally {
    grantDialog.loading = false
  }
}

// 重置密码
const passwordDialog = reactive({ visible: false, tempPassword: '' })

async function handleResetPassword() {
  const ok = await confirm({
    title: '重置密码',
    message: `确认重置用户 <strong>${detail.value?.phone}</strong> 的密码？`,
    type: 'warning',
  })
  if (!ok) return
  try {
    const res = await accountApi.resetPassword(accountId)
    passwordDialog.tempPassword = res.tempPassword
    passwordDialog.visible = true
  } catch { /* empty */ }
}

function copyPassword() {
  navigator.clipboard.writeText(passwordDialog.tempPassword).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}

onMounted(() => {
  loadDetail()
})
</script>

<style lang="scss" scoped>
.account-detail-page {
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

.user-basic-info {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.user-avatar {
  background: #1890ff;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-meta {
  flex: 1;

  .user-name {
    font-size: 20px;
    font-weight: 700;
    color: #262626;
    margin-bottom: 4px;
  }

  .user-phone {
    font-size: 14px;
    color: #595959;
    margin-bottom: 8px;
  }

  .user-tags {
    display: flex;
    align-items: center;
    gap: 8px;

    .user-id {
      font-size: 12px;
      color: #8c8c8c;
    }
  }
}

.user-stats {
  display: flex;
  gap: 32px;

  .stat-item {
    text-align: center;

    .stat-val {
      font-size: 13px;
      font-weight: 500;
      color: #262626;
      margin-bottom: 2px;
    }

    .stat-key {
      font-size: 12px;
      color: #8c8c8c;
    }
  }
}

.detail-tabs {
  :deep(.el-tabs__header) {
    padding: 0 24px;
    margin-bottom: 0;
  }
}

.tab-content {
  padding: 24px;
  min-height: 200px;
}

.temp-password-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 12px;

  .temp-password {
    font-family: monospace;
    font-size: 18px;
    font-weight: 700;
    color: #52c41a;
    letter-spacing: 2px;
    flex: 1;
  }
}
</style>
