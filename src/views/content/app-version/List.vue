<template>
  <div class="app-version-page">
    <!-- 工具栏 -->
    <div class="filter-section" style="display: flex; justify-content: space-between; align-items: center">
      <div style="display: flex; gap: 12px; align-items: center">
        <el-select v-model="filterPlatform" placeholder="全部平台" clearable style="width: 140px" @change="handleSearch">
          <el-option v-for="(v, k) in PlatformMap" :key="k" :label="v.label" :value="k" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="全部状态" clearable style="width: 140px" @change="handleSearch">
          <el-option v-for="(v, k) in AppVersionStatusMap" :key="k" :label="v.label" :value="k" />
        </el-select>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">新建版本</el-button>
    </div>

    <!-- 表格 -->
    <div class="admin-card" style="padding: 0">
      <div class="table-toolbar">
        <span class="total-tip">共 {{ pagination.total }} 条记录</span>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%" row-key="id">
        <el-table-column prop="versionCode" label="Version Code" width="130" />
        <el-table-column prop="versionName" label="版本名称" width="120" />
        <el-table-column label="平台" width="90">
          <template #default="{ row }">
            {{ PlatformMap[row.platform as Platform]?.label || row.platform }}
          </template>
        </el-table-column>
        <el-table-column label="强制更新" width="100">
          <template #default="{ row }">
            <el-tag :type="row.forceUpdate ? 'danger' : 'info'" size="small">
              {{ row.forceUpdate ? '强制' : '可选' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="AppVersionStatusMap[row.status as AppVersionStatus]?.type" size="small">
              {{ AppVersionStatusMap[row.status as AppVersionStatus]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布说明" min-width="200">
          <template #default="{ row }">
            <span>{{ truncate(row.releaseNotes, 40) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">{{ formatTime(row.createdTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" type="primary" link @click="openEditDialog(row)">编辑</el-button>

              <el-button
                v-permission="'SUPER_ADMIN'"
                v-if="row.status === AppVersionStatus.DRAFT"
                size="small"
                type="success"
                link
                @click="handlePublish(row)"
              >发布</el-button>

              <el-button
                v-if="row.status === AppVersionStatus.PUBLISHED"
                size="small"
                type="warning"
                link
                @click="handleArchive(row)"
              >归档</el-button>
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
      :title="formDialog.isEdit ? '编辑版本' : '新建版本'"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form :model="formDialog" :rules="formRules" ref="formRef" label-width="110px">
        <el-form-item label="Version Code" prop="versionCode">
          <el-input-number v-model="formDialog.versionCode" :min="1" style="width: 100%" />
          <div v-if="!formDialog.isEdit" class="form-hint">必须大于现有最大 version_code</div>
        </el-form-item>
        <el-form-item label="版本名称" prop="versionName">
          <el-input v-model="formDialog.versionName" placeholder="如：1.2.3" />
        </el-form-item>
        <el-form-item label="平台" prop="platform">
          <el-select v-model="formDialog.platform" style="width: 100%">
            <el-option v-for="(v, k) in PlatformMap" :key="k" :label="v.label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="下载地址" prop="downloadUrl">
          <el-input v-model="formDialog.downloadUrl" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="强制更新">
          <el-switch v-model="formDialog.forceUpdate" />
          <el-text v-if="formDialog.forceUpdate" type="danger" size="small" style="margin-left: 8px">
            开启后所有用户必须更新才能使用
          </el-text>
        </el-form-item>
        <el-form-item label="发布说明" prop="releaseNotes">
          <el-input
            v-model="formDialog.releaseNotes"
            type="textarea"
            :rows="4"
            placeholder="版本更新说明..."
            maxlength="1000"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { contentApi } from '@/api/content'
import type { AppVersionItem } from '@/api/content'
import {
  Platform, PlatformMap,
  AppVersionStatus, AppVersionStatusMap,
} from '@/constants/enums'
import { formatTime, truncate } from '@/utils/format'
import { useConfirm } from '@/composables/useConfirm'

const confirm = useConfirm()

const loading = ref(false)
const tableData = ref<AppVersionItem[]>([])
const filterPlatform = ref('')
const filterStatus = ref('')
const maxVersionCode = ref(0)

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
    if (filterPlatform.value) params.platform = filterPlatform.value
    if (filterStatus.value) params.status = filterStatus.value

    const res = await contentApi.getAppVersionList(params as Parameters<typeof contentApi.getAppVersionList>[0])
    tableData.value = res.list
    pagination.total = res.total
    // 计算最大 version_code
    maxVersionCode.value = Math.max(0, ...res.list.map((v) => v.versionCode))
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handlePageChange(p: number) { pagination.page = p; loadData() }
function handleSizeChange(s: number) { pagination.pageSize = s; pagination.page = 1; loadData() }

// 发布
async function handlePublish(row: AppVersionItem) {
  let confirmMsg = `确认发布版本 <strong>${row.versionName}</strong>？`
  if (row.forceUpdate) {
    confirmMsg += '<br/><span style="color:#f5222d;font-weight:600">⚠️ 此版本为强制更新，所有用户将被要求更新</span>'
  }
  const ok = await confirm({
    title: '发布确认',
    message: confirmMsg,
    type: row.forceUpdate ? 'danger' : 'warning',
  })
  if (!ok) return
  try {
    await contentApi.publishAppVersion(row.id)
    ElMessage.success('发布成功')
    loadData()
  } catch { /* handled */ }
}

// 归档
async function handleArchive(row: AppVersionItem) {
  const ok = await confirm({
    title: '归档确认',
    message: `确认归档版本 <strong>${row.versionName}</strong>？`,
    type: 'warning',
  })
  if (!ok) return
  try {
    await contentApi.archiveAppVersion(row.id)
    ElMessage.success('归档成功')
    loadData()
  } catch { /* handled */ }
}

// 表单弹窗
const formRef = ref<FormInstance>()
const formDialog = reactive({
  visible: false,
  isEdit: false,
  editId: 0,
  versionCode: 1,
  versionName: '',
  platform: Platform.ANDROID,
  downloadUrl: '',
  forceUpdate: false,
  releaseNotes: '',
  loading: false,
})

const formRules: FormRules = {
  versionCode: [
    { required: true, message: '请输入 versionCode', trigger: 'blur' },
    {
      validator: (_r, v, cb) => {
        if (!formDialog.isEdit && v <= maxVersionCode.value) {
          cb(new Error(`versionCode 必须大于当前最大值 ${maxVersionCode.value}`))
        } else cb()
      },
      trigger: 'blur',
    },
  ],
  versionName: [{ required: true, message: '请输入版本名称', trigger: 'blur' }],
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
  downloadUrl: [{ required: true, message: '请输入下载地址', trigger: 'blur' }],
  releaseNotes: [{ required: true, message: '请输入发布说明', trigger: 'blur' }],
}

function openCreateDialog() {
  Object.assign(formDialog, {
    visible: true,
    isEdit: false,
    editId: 0,
    versionCode: maxVersionCode.value + 1,
    versionName: '',
    platform: Platform.ANDROID,
    downloadUrl: '',
    forceUpdate: false,
    releaseNotes: '',
  })
}

function openEditDialog(row: AppVersionItem) {
  Object.assign(formDialog, {
    visible: true,
    isEdit: true,
    editId: row.id,
    versionCode: row.versionCode,
    versionName: row.versionName,
    platform: row.platform,
    downloadUrl: row.downloadUrl,
    forceUpdate: row.forceUpdate,
    releaseNotes: row.releaseNotes,
  })
}

async function confirmForm() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  // force_update 醒目二次确认
  if (formDialog.forceUpdate) {
    try {
      await ElMessageBox.confirm(
        `<p>强制更新已开启！</p><p style="color:#f5222d">所有用户将被强制要求更新至此版本，请确认后再保存。</p>`,
        '强制更新确认',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确认保存',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
    } catch { return }
  }

  formDialog.loading = true
  try {
    const data = {
      versionCode: formDialog.versionCode,
      versionName: formDialog.versionName,
      platform: formDialog.platform,
      downloadUrl: formDialog.downloadUrl,
      forceUpdate: formDialog.forceUpdate,
      releaseNotes: formDialog.releaseNotes,
    }

    if (formDialog.isEdit) {
      await contentApi.updateAppVersion(formDialog.editId, data)
      ElMessage.success('更新成功')
    } else {
      await contentApi.createAppVersion(data)
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
.app-version-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-toolbar {
  display: flex;
  align-items: center;
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
