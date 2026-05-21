<template>
  <div class="account-list-page">
    <!-- 筛选区 -->
    <div class="filter-section">
      <el-form :model="query" inline label-width="80px">
        <el-form-item label="手机号">
          <el-input
            v-model="query.phone"
            placeholder="模糊匹配"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable multiple style="width: 180px">
            <el-option
              v-for="(v, k) in UserStatusMap"
              :key="k"
              :label="v.label"
              :value="k"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="套餐类型">
          <el-select v-model="query.plan_type" placeholder="全部" clearable multiple style="width: 180px">
            <el-option
              v-for="(v, k) in PlanTypeMap"
              :key="k"
              :label="v.label"
              :value="k"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="注册时间">
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
        <el-form-item label="付费用户">
          <el-switch v-model="query.is_paid" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="admin-card" style="padding: 0">
      <div class="table-toolbar">
        <span class="total-tip">共 {{ pagination.total }} 条记录</span>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
        row-key="id"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="nickname" label="昵称" min-width="100" show-overflow-tooltip />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="UserStatusMap[row.status as UserStatus]?.type" size="small">
              {{ UserStatusMap[row.status as UserStatus]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前套餐" width="90">
          <template #default="{ row }">
            <el-tag :type="PlanTypeMap[row.plan_type as PlanType]?.type" size="small">
              {{ PlanTypeMap[row.plan_type as PlanType]?.label || row.plan_type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="套餐到期" width="120">
          <template #default="{ row }">
            {{ formatTime(row.subscription_end_time, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column label="最近登录" width="160">
          <template #default="{ row }">
            {{ formatTime(row.last_login_time) }}
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.created_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                size="small"
                type="primary"
                link
                @click="router.push(`/accounts/${row.id}`)"
              >详情</el-button>

              <el-button
                v-if="row.status !== UserStatus.BANNED"
                size="small"
                type="danger"
                link
                @click="handleBan(row)"
              >封禁</el-button>

              <el-button
                v-if="row.status === UserStatus.BANNED"
                size="small"
                type="success"
                link
                @click="handleUnban(row)"
              >解封</el-button>

              <el-button
                size="small"
                type="warning"
                link
                @click="handleGrant(row)"
              >赠送时长</el-button>

              <el-button
                size="small"
                link
                @click="handleResetPassword(row)"
              >重置密码</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 封禁弹窗 -->
    <el-dialog v-model="banDialog.visible" title="封禁用户" width="440px" :close-on-click-modal="false">
      <el-alert
        :title="`确认封禁用户 ${banDialog.phone}？封禁后用户将无法登录。`"
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
        <el-form-item label="套餐类型" prop="plan_type">
          <el-select v-model="grantDialog.plan_type" placeholder="选择套餐" style="width: 100%">
            <el-option label="日卡" value="DAY_CARD" />
            <el-option label="月卡" value="MONTH_CARD" />
            <el-option label="年卡" value="YEAR_CARD" />
          </el-select>
        </el-form-item>
        <el-form-item label="赠送天数" prop="days">
          <el-input-number
            v-model="grantDialog.days"
            :min="1"
            :max="365"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="赠送原因" prop="reason">
          <el-input
            v-model="grantDialog.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入赠送原因（必填）"
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

    <!-- 重置密码结果弹窗 -->
    <el-dialog v-model="passwordDialog.visible" title="重置密码结果" width="420px">
      <el-alert type="success" show-icon :closable="false">
        <template #title>密码已重置，临时密码如下：</template>
      </el-alert>
      <div class="temp-password-box">
        <code class="temp-password">{{ passwordDialog.tempPassword }}</code>
        <el-button
          size="small"
          :icon="CopyDocument"
          @click="copyPassword"
        >复制</el-button>
      </div>
      <el-alert
        title="请告知用户尽快修改密码，临时密码仅展示一次"
        type="warning"
        show-icon
        :closable="false"
        style="margin-top: 12px"
      />
      <template #footer>
        <el-button type="primary" @click="passwordDialog.visible = false">知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Search, Refresh, CopyDocument } from '@element-plus/icons-vue'
import { accountApi } from '@/api/account'
import type { AccountItem } from '@/api/account'
import { UserStatus, UserStatusMap, PlanType, PlanTypeMap } from '@/constants/enums'
import { formatTime } from '@/utils/format'
import { useConfirm } from '@/composables/useConfirm'

const router = useRouter()
const confirm = useConfirm()

// 表格状态
const loading = ref(false)
const tableData = ref<AccountItem[]>([])
const dateRange = ref<[string, string] | null>(null)

const query = reactive({
  phone: '',
  status: [] as string[],
  plan_type: [] as string[],
  created_time_start: '',
  created_time_end: '',
  is_paid: false,
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
})

function handleDateChange(val: [string, string] | null) {
  query.created_time_start = val?.[0] || ''
  query.created_time_end = val?.[1] || ''
}

async function loadData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      ...query,
      page: pagination.page,
      page_size: pagination.page_size,
    }
    if (!params.is_paid) delete params.is_paid
    const res = await accountApi.getList(params as Parameters<typeof accountApi.getList>[0])
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
  query.phone = ''
  query.status = []
  query.plan_type = []
  query.created_time_start = ''
  query.created_time_end = ''
  query.is_paid = false
  dateRange.value = null
  pagination.page = 1
  loadData()
}

function handlePageChange(page: number) {
  pagination.page = page
  loadData()
}

function handleSizeChange(size: number) {
  pagination.page_size = size
  pagination.page = 1
  loadData()
}

// ---- 封禁 ----
const banFormRef = ref<FormInstance>()
const banDialog = reactive({
  visible: false,
  id: 0,
  phone: '',
  reason: '',
  loading: false,
})
const banRules: FormRules = {
  reason: [{ required: true, message: '请输入封禁原因', trigger: 'blur' }],
}

function handleBan(row: AccountItem) {
  banDialog.id = row.id
  banDialog.phone = row.phone
  banDialog.reason = ''
  banDialog.visible = true
}

async function confirmBan() {
  if (!banFormRef.value) return
  const valid = await banFormRef.value.validate().catch(() => false)
  if (!valid) return

  banDialog.loading = true
  try {
    await accountApi.ban(banDialog.id, { reason: banDialog.reason })
    ElMessage.success('封禁成功')
    banDialog.visible = false
    loadData()
  } finally {
    banDialog.loading = false
  }
}

// ---- 解封 ----
async function handleUnban(row: AccountItem) {
  const ok = await confirm({
    title: '解封确认',
    message: `确认解封用户 <strong>${row.phone}</strong>？`,
    type: 'warning',
  })
  if (!ok) return
  try {
    await accountApi.unban(row.id)
    ElMessage.success('解封成功')
    loadData()
  } catch {
    // error handled by interceptor
  }
}

// ---- 赠送时长 ----
const grantFormRef = ref<FormInstance>()
const grantDialog = reactive({
  visible: false,
  id: 0,
  phone: '',
  plan_type: '',
  days: 30,
  reason: '',
  loading: false,
})
const grantRules: FormRules = {
  plan_type: [{ required: true, message: '请选择套餐类型', trigger: 'change' }],
  days: [{ required: true, message: '请输入赠送天数', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入赠送原因', trigger: 'blur' }],
}

function handleGrant(row: AccountItem) {
  grantDialog.id = row.id
  grantDialog.phone = row.phone
  grantDialog.plan_type = ''
  grantDialog.days = 30
  grantDialog.reason = ''
  grantDialog.visible = true
}

async function confirmGrant() {
  if (!grantFormRef.value) return
  const valid = await grantFormRef.value.validate().catch(() => false)
  if (!valid) return

  const planLabel = { DAY_CARD: '日卡', MONTH_CARD: '月卡', YEAR_CARD: '年卡' }[grantDialog.plan_type] || ''
  const ok = await confirm({
    title: '赠送确认',
    message: `确认赠送用户 <strong>${grantDialog.phone}</strong> <strong>${grantDialog.days} 天 ${planLabel}</strong>？`,
    type: 'warning',
  })
  if (!ok) return

  grantDialog.loading = true
  try {
    await accountApi.grant(grantDialog.id, {
      plan_type: grantDialog.plan_type,
      days: grantDialog.days,
      reason: grantDialog.reason,
    })
    ElMessage.success('赠送成功')
    grantDialog.visible = false
    loadData()
  } finally {
    grantDialog.loading = false
  }
}

// ---- 重置密码 ----
const passwordDialog = reactive({
  visible: false,
  tempPassword: '',
})

async function handleResetPassword(row: AccountItem) {
  const ok = await confirm({
    title: '重置密码',
    message: `确认重置用户 <strong>${row.phone}</strong> 的密码？重置后将生成临时密码。`,
    type: 'warning',
  })
  if (!ok) return
  try {
    const res = await accountApi.resetPassword(row.id)
    passwordDialog.tempPassword = res.temp_password
    passwordDialog.visible = true
  } catch {
    // error handled by interceptor
  }
}

function copyPassword() {
  navigator.clipboard.writeText(passwordDialog.tempPassword).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.account-list-page {
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
