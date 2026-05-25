<template>
  <div class="notice-page">
    <!-- 工具栏 -->
    <div class="filter-section" style="display: flex; justify-content: space-between; align-items: center">
      <div style="display: flex; gap: 12px">
        <el-select v-model="filterType" placeholder="全部类型" clearable style="width: 140px" @change="handleSearch">
          <el-option v-for="(v, k) in NoticeTypeMap" :key="k" :label="v.label" :value="k" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="全部状态" clearable style="width: 140px" @change="handleSearch">
          <el-option v-for="(v, k) in NoticeStatusMap" :key="k" :label="v.label" :value="k" />
        </el-select>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">新建公告</el-button>
    </div>

    <!-- 表格 -->
    <div class="admin-card" style="padding: 0">
      <div class="table-toolbar">
        <span class="total-tip">共 {{ pagination.total }} 条记录</span>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%" row-key="id">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="NoticeTypeMap[row.type as NoticeType]?.type" size="small">
              {{ NoticeTypeMap[row.type as NoticeType]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标用户" width="100">
          <template #default="{ row }">
            {{ NoticeTargetUsersMap[row.targetUsers as NoticeTargetUsers]?.label || row.targetUsers }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="NoticeStatusMap[row.status as NoticeStatus]?.type" size="small">
              {{ NoticeStatusMap[row.status as NoticeStatus]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="160">
          <template #default="{ row }">{{ formatTime(row.publishTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" type="primary" link @click="openEditDialog(row)">编辑</el-button>

              <el-button
                v-if="row.status === NoticeStatus.DRAFT"
                size="small"
                type="success"
                link
                @click="handlePublish(row)"
              >发布</el-button>

              <el-button
                v-if="row.status === NoticeStatus.PUBLISHED"
                size="small"
                type="warning"
                link
                @click="handleOffline(row)"
              >下线</el-button>

              <el-button
                v-if="row.status === NoticeStatus.DRAFT"
                size="small"
                type="danger"
                link
                @click="handleDelete(row)"
              >删除</el-button>
            </div>
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
      :title="formDialog.isEdit ? '编辑公告' : '新建公告'"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-form :model="formDialog" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formDialog.title" placeholder="公告标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formDialog.type" style="width: 100%">
            <el-option v-for="(v, k) in NoticeTypeMap" :key="k" :label="v.label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标用户" prop="targetUsers">
          <el-select v-model="formDialog.targetUsers" style="width: 100%">
            <el-option v-for="(v, k) in NoticeTargetUsersMap" :key="k" :label="v.label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="定时发布">
          <el-date-picker
            v-model="formDialog.publishTime"
            type="datetime"
            placeholder="留空=立即发布"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="formDialog.content"
            type="textarea"
            :rows="8"
            placeholder="支持 Markdown 格式"
            maxlength="5000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="formDialog.loading" @click="confirmForm">
          {{ formDialog.isEdit ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { contentApi } from '@/api/content'
import type { NoticeItem } from '@/api/content'
import {
  NoticeType, NoticeTypeMap,
  NoticeStatus, NoticeStatusMap,
  NoticeTargetUsers, NoticeTargetUsersMap,
} from '@/constants/enums'
import { formatTime, datetimeToUTC } from '@/utils/format'
import { useConfirm } from '@/composables/useConfirm'

const confirm = useConfirm()

const loading = ref(false)
const tableData = ref<NoticeItem[]>([])
const filterType = ref('')
const filterStatus = ref('')

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

async function loadData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
    if (filterType.value) params.type = filterType.value
    if (filterStatus.value) params.status = filterStatus.value

    const res = await contentApi.getNoticeList(params as Parameters<typeof contentApi.getNoticeList>[0])
    tableData.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() { pagination.page = 1; loadData() }
function handlePageChange(p: number) { pagination.page = p; loadData() }
function handleSizeChange(s: number) { pagination.pageSize = s; pagination.page = 1; loadData() }

// 发布
async function handlePublish(row: NoticeItem) {
  const targetLabel = NoticeTargetUsersMap[row.targetUsers as NoticeTargetUsers]?.label || row.targetUsers
  const ok = await confirm({
    title: '发布确认',
    message: `确认发布公告 <strong>《${row.title}》</strong>？<br/>目标用户：<strong>${targetLabel}</strong>`,
    type: 'warning',
  })
  if (!ok) return
  try {
    await contentApi.publishNotice(row.id)
    ElMessage.success('发布成功')
    loadData()
  } catch { /* handled */ }
}

// 下线
async function handleOffline(row: NoticeItem) {
  const ok = await confirm({
    title: '下线确认',
    message: `确认下线公告 <strong>《${row.title}》</strong>？下线后用户将无法看到此公告。`,
    type: 'warning',
  })
  if (!ok) return
  try {
    await contentApi.offlineNotice(row.id)
    ElMessage.success('下线成功')
    loadData()
  } catch { /* handled */ }
}

// 删除
async function handleDelete(row: NoticeItem) {
  const ok = await confirm({
    title: '删除确认',
    message: `确认删除公告 <strong>《${row.title}》</strong>？此操作不可撤销。`,
    type: 'danger',
  })
  if (!ok) return
  try {
    await contentApi.deleteNotice(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch { /* handled */ }
}

// 表单弹窗
const formRef = ref<FormInstance>()
const formDialog = reactive({
  visible: false,
  isEdit: false,
  editId: 0,
  title: '',
  type: NoticeType.NOTICE,
  targetUsers: NoticeTargetUsers.ALL,
  publishTime: '',
  content: '',
  loading: false,
})

const formRules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  targetUsers: [{ required: true, message: '请选择目标用户', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}

function openCreateDialog() {
  Object.assign(formDialog, {
    visible: true, isEdit: false, editId: 0,
    title: '', type: NoticeType.NOTICE, targetUsers: NoticeTargetUsers.ALL,
    publishTime: '', content: '',
  })
}

function openEditDialog(row: NoticeItem) {
  Object.assign(formDialog, {
    visible: true, isEdit: true, editId: row.id,
    title: row.title, type: row.type, targetUsers: row.targetUsers,
    publishTime: row.publishTime || '', content: row.content,
  })
}

async function confirmForm() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  formDialog.loading = true
  try {
    const data = {
      title: formDialog.title,
      type: formDialog.type,
      targetUsers: formDialog.targetUsers,
      content: formDialog.content,
      publishTime: formDialog.publishTime ? datetimeToUTC(formDialog.publishTime) : undefined,
    }

    if (formDialog.isEdit) {
      await contentApi.updateNotice(formDialog.editId, data)
      ElMessage.success('保存成功')
    } else {
      await contentApi.createNotice(data)
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
.notice-page {
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
</style>
