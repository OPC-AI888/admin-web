<template>
  <div class="admin-list-page">
    <!-- 工具栏 -->
    <div class="filter-section" style="display: flex; justify-content: flex-end">
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">新建管理员</el-button>
    </div>

    <!-- 表格 -->
    <div class="admin-card" style="padding: 0">
      <div class="table-toolbar">
        <span class="total-tip">共 {{ pagination.total }} 条记录</span>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%" row-key="id">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="AdminRoleMap[row.role as AdminRole]?.type" size="small">
              {{ AdminRoleMap[row.role as AdminRole]?.label || row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="AdminStatusMap[row.status as AdminStatus]?.type" size="small">
              {{ AdminStatusMap[row.status as AdminStatus]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最近登录" width="160">
          <template #default="{ row }">{{ formatTime(row.lastLoginTime) }}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">{{ formatTime(row.createdTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons" v-if="!isSelf(row)">
              <el-button size="small" type="primary" link @click="openEditDialog(row)">编辑</el-button>

              <el-button size="small" link @click="handleResetPassword(row)">重置密码</el-button>

              <el-button
                v-if="row.status === AdminStatus.ACTIVE"
                size="small"
                type="warning"
                link
                @click="handleDisable(row)"
              >禁用</el-button>

              <el-button
                v-if="row.status === AdminStatus.DISABLED"
                size="small"
                type="success"
                link
                @click="handleEnable(row)"
              >启用</el-button>
            </div>
            <el-text v-else type="info" size="small">当前登录账号</el-text>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 新建/编辑弹窗 -->
    <el-dialog
      v-model="formDialog.visible"
      :title="formDialog.isEdit ? '编辑管理员' : '新建管理员'"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form :model="formDialog" :rules="formRules" ref="formRef" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formDialog.username"
            placeholder="仅支持字母数字下划线"
            :disabled="formDialog.isEdit"
          />
        </el-form-item>
        <el-form-item v-if="!formDialog.isEdit" label="初始密码" prop="password">
          <el-input v-model="formDialog.password" type="password" placeholder="至少6位" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formDialog.role" style="width: 100%">
            <el-option v-for="(v, k) in AdminRoleMap" :key="k" :label="v.label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formDialog.status" style="width: 100%">
            <el-option v-for="(v, k) in AdminStatusMap" :key="k" :label="v.label" :value="k" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="formDialog.loading" @click="confirmForm">
          {{ formDialog.isEdit ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 重置密码结果弹窗 -->
    <el-dialog v-model="passwordDialog.visible" title="重置密码结果" width="420px">
      <el-alert type="success" show-icon :closable="false">
        <template #title>密码已重置，临时密码如下：</template>
      </el-alert>
      <div class="temp-password-box">
        <code class="temp-password">{{ passwordDialog.tempPassword }}</code>
        <el-button size="small" :icon="CopyDocument" @click="copyPassword">复制</el-button>
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
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, CopyDocument } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import type { AdminItem } from '@/api/admin'
import {
  AdminRole, AdminRoleMap,
  AdminStatus, AdminStatusMap,
} from '@/constants/enums'
import { formatTime } from '@/utils/format'
import { useConfirm } from '@/composables/useConfirm'
import { useAuthStore } from '@/stores/auth'

const confirm = useConfirm()
const authStore = useAuthStore()

const loading = ref(false)
const tableData = ref<AdminItem[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

function isSelf(row: AdminItem): boolean {
  return row.id === authStore.admin?.id
}

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getList({
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
    tableData.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

function handlePageChange(p: number) { pagination.page = p; loadData() }
function handleSizeChange(s: number) { pagination.pageSize = s; pagination.page = 1; loadData() }

// 禁用
async function handleDisable(row: AdminItem) {
  // 检查是否最后一个 SUPER_ADMIN
  const superAdminCount = tableData.value.filter(
    (a) => a.role === AdminRole.SUPER_ADMIN && a.status === AdminStatus.ACTIVE
  ).length
  if (row.role === AdminRole.SUPER_ADMIN && superAdminCount <= 1) {
    ElMessage.warning('最后一个 SUPER_ADMIN 不可禁用')
    return
  }

  const ok = await confirm({
    title: '禁用确认',
    message: `确认禁用管理员 <strong>${row.username}</strong>？禁用后该账号将无法登录。`,
    type: 'warning',
  })
  if (!ok) return
  try {
    await adminApi.update(row.id, { status: AdminStatus.DISABLED })
    ElMessage.success('已禁用')
    loadData()
  } catch { /* handled */ }
}

// 启用
async function handleEnable(row: AdminItem) {
  const ok = await confirm({
    title: '启用确认',
    message: `确认启用管理员 <strong>${row.username}</strong>？`,
    type: 'warning',
  })
  if (!ok) return
  try {
    await adminApi.update(row.id, { status: AdminStatus.ACTIVE })
    ElMessage.success('已启用')
    loadData()
  } catch { /* handled */ }
}

// 重置密码
const passwordDialog = reactive({ visible: false, tempPassword: '' })

async function handleResetPassword(row: AdminItem) {
  const ok = await confirm({
    title: '重置密码',
    message: `确认重置管理员 <strong>${row.username}</strong> 的密码？`,
    type: 'warning',
  })
  if (!ok) return
  try {
    const res = await adminApi.resetPassword(row.id)
    passwordDialog.tempPassword = res.tempPassword
    passwordDialog.visible = true
  } catch { /* handled */ }
}

function copyPassword() {
  navigator.clipboard.writeText(passwordDialog.tempPassword).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}

// 表单弹窗
const formRef = ref<FormInstance>()
const formDialog = reactive({
  visible: false,
  isEdit: false,
  editId: 0,
  username: '',
  password: '',
  role: AdminRole.OPERATOR,
  status: AdminStatus.ACTIVE,
  loading: false,
})

const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字、下划线', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

function openCreateDialog() {
  Object.assign(formDialog, {
    visible: true, isEdit: false, editId: 0,
    username: '', password: '',
    role: AdminRole.OPERATOR, status: AdminStatus.ACTIVE,
  })
}

function openEditDialog(row: AdminItem) {
  Object.assign(formDialog, {
    visible: true, isEdit: true, editId: row.id,
    username: row.username, password: '',
    role: row.role, status: row.status,
  })
}

async function confirmForm() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  formDialog.loading = true
  try {
    if (formDialog.isEdit) {
      await adminApi.update(formDialog.editId, {
        role: formDialog.role,
        status: formDialog.status,
      })
      ElMessage.success('保存成功')
    } else {
      await adminApi.create({
        username: formDialog.username,
        password: formDialog.password,
        role: formDialog.role,
      })
      ElMessage.success('创建成功')
    }
    formDialog.visible = false
    loadData()
  } finally {
    formDialog.loading = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.admin-list-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-toolbar {
  display: flex;
  align-items: center;
  padding: 16px 24px 12px;
  border-bottom: 1px solid #f0f0f0;

  .total-tip { font-size: 13px; color: #8c8c8c; }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.action-buttons {
  display: flex;
  gap: 4px;
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
