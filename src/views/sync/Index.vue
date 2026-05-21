<template>
  <div class="sync-page">
    <!-- 概况卡 -->
    <el-row :gutter="16" v-loading="overviewLoading">
      <el-col :xs="24" :sm="8">
        <div class="kpi-card kpi-card--blue">
          <div class="kpi-icon"><el-icon><User /></el-icon></div>
          <div class="kpi-info">
            <div class="kpi-value">{{ formatLargeNumber(overview?.synced_user_count) }}</div>
            <div class="kpi-label">已同步用户数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="8">
        <div class="kpi-card kpi-card--green">
          <div class="kpi-icon"><el-icon><Files /></el-icon></div>
          <div class="kpi-info">
            <div class="kpi-value">{{ overview ? formatBytes(overview.total_storage_bytes) : '-' }}</div>
            <div class="kpi-label">累计存储</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="8">
        <div class="kpi-card kpi-card--orange">
          <div class="kpi-icon"><el-icon><TrendCharts /></el-icon></div>
          <div class="kpi-info">
            <div class="kpi-value">{{ overview ? formatBytes(overview.avg_size_bytes) : '-' }}</div>
            <div class="kpi-label">人均大小</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 筛选区 -->
    <div class="filter-section">
      <el-form :model="query" inline label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="query.phone" placeholder="模糊匹配" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="同步时间">
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
        <el-form-item label="最小大小(KB)">
          <el-input-number
            v-model="query.min_data_size"
            :min="0"
            placeholder="0"
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 用户同步列表 -->
    <div class="admin-card" style="padding: 0">
      <div class="table-toolbar">
        <span class="total-tip">共 {{ pagination.total }} 条记录（默认按数据大小降序）</span>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%" row-key="account_id">
        <el-table-column prop="account_id" label="用户ID" width="90" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="数据大小" width="120" sortable>
          <template #default="{ row }">
            {{ formatBytes(row.data_size) }}
          </template>
        </el-table-column>
        <el-table-column label="最近同步时间" width="160">
          <template #default="{ row }">{{ formatTime(row.synced_time) }}</template>
        </el-table-column>
        <el-table-column label="内容哈希（前8位）" min-width="140">
          <template #default="{ row }">
            <code class="hash-code">{{ row.content_hash?.slice(0, 8) || '-' }}</code>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="router.push(`/accounts/${row.account_id}`)">
              查看
            </el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Refresh, User, Files, TrendCharts } from '@element-plus/icons-vue'
import { syncApi } from '@/api/sync'
import type { SyncUserItem, SyncOverview } from '@/api/sync'
import { formatTime, formatBytes, formatLargeNumber } from '@/utils/format'

const router = useRouter()

const overviewLoading = ref(false)
const loading = ref(false)
const overview = ref<SyncOverview | null>(null)
const tableData = ref<SyncUserItem[]>([])
const dateRange = ref<[string, string] | null>(null)

const query = reactive({
  phone: '',
  synced_time_start: '',
  synced_time_end: '',
  min_data_size: undefined as number | undefined,
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
})

function handleDateChange(val: [string, string] | null) {
  query.synced_time_start = val?.[0] || ''
  query.synced_time_end = val?.[1] || ''
}

async function loadOverview() {
  overviewLoading.value = true
  try {
    overview.value = await syncApi.getOverview()
  } finally {
    overviewLoading.value = false
  }
}

async function loadData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {}
    if (query.phone) params.phone = query.phone
    if (query.synced_time_start) params.synced_time_start = query.synced_time_start
    if (query.synced_time_end) params.synced_time_end = query.synced_time_end
    if (query.min_data_size && query.min_data_size > 0) {
      params.min_data_size = query.min_data_size * 1024 // KB → bytes
    }

    const res = await syncApi.getUserList({
      ...params,
      page: pagination.page,
      page_size: pagination.page_size,
    } as Parameters<typeof syncApi.getUserList>[0])
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
  query.synced_time_start = ''
  query.synced_time_end = ''
  query.min_data_size = undefined
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

onMounted(() => {
  loadOverview()
  loadData()
})
</script>

<style lang="scss" scoped>
.sync-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kpi-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  margin-bottom: 0;
}

.kpi-icon {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  :deep(.el-icon) {
    font-size: 24px;
    color: #fff;
  }
}

.kpi-card--blue .kpi-icon { background: linear-gradient(135deg, #1890ff, #096dd9); }
.kpi-card--green .kpi-icon { background: linear-gradient(135deg, #52c41a, #389e0d); }
.kpi-card--orange .kpi-icon { background: linear-gradient(135deg, #fa8c16, #d46b08); }

.kpi-info {
  flex: 1;
}

.kpi-value {
  font-size: 22px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 4px;
}

.kpi-label {
  font-size: 13px;
  color: #8c8c8c;
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

.hash-code {
  font-family: monospace;
  font-size: 13px;
  color: #595959;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
