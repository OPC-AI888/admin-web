<template>
  <div class="dashboard-page">
    <!-- 页面标题 + 时间范围选择 -->
    <div class="dashboard-header">
      <div>
        <h2 class="page-title">运营仪表板</h2>
        <p class="page-desc">实时运营数据总览</p>
      </div>
      <el-radio-group v-model="dayRange" size="default" @change="handleRangeChange">
        <el-radio-button :value="7">近 7 天</el-radio-button>
        <el-radio-button :value="30">近 30 天</el-radio-button>
        <el-radio-button :value="90">近 90 天</el-radio-button>
      </el-radio-group>
    </div>

    <!-- KPI 卡片 -->
    <el-row :gutter="16" class="kpi-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="kpi-card" @click="router.push('/accounts')">
          <div class="kpi-icon kpi-icon--blue">
            <el-icon><User /></el-icon>
          </div>
          <div class="kpi-info">
            <div class="kpi-value">
              <template v-if="overviewLoading">
                <el-skeleton-item variant="text" style="width: 80px; height: 32px" />
              </template>
              <template v-else>{{ formatLargeNumber(overview?.totalUsers) }}</template>
            </div>
            <div class="kpi-label">用户总数</div>
            <div class="kpi-trend">
              <el-icon class="trend-up"><Top /></el-icon>
              <span>注册用户累计</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <div class="kpi-card" @click="router.push('/stats')">
          <div class="kpi-icon kpi-icon--green">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="kpi-info">
            <div class="kpi-value">
              <template v-if="overviewLoading">
                <el-skeleton-item variant="text" style="width: 80px; height: 32px" />
              </template>
              <template v-else>{{ formatLargeNumber(overview?.dau) }}</template>
            </div>
            <div class="kpi-label">DAU（日活）</div>
            <div class="kpi-trend">
              <el-icon class="trend-up"><Top /></el-icon>
              <span>今日活跃用户</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <div class="kpi-card" @click="router.push('/accounts?is_paid=true')">
          <div class="kpi-icon kpi-icon--orange">
            <el-icon><Star /></el-icon>
          </div>
          <div class="kpi-info">
            <div class="kpi-value">
              <template v-if="overviewLoading">
                <el-skeleton-item variant="text" style="width: 80px; height: 32px" />
              </template>
              <template v-else>{{ formatLargeNumber(overview?.payingUsers) }}</template>
            </div>
            <div class="kpi-label">付费用户</div>
            <div class="kpi-trend">
              <el-icon class="trend-up"><Top /></el-icon>
              <span>有效订阅用户</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <div class="kpi-card" @click="router.push('/orders')">
          <div class="kpi-icon kpi-icon--purple">
            <el-icon><Money /></el-icon>
          </div>
          <div class="kpi-info">
            <div class="kpi-value">
              <template v-if="overviewLoading">
                <el-skeleton-item variant="text" style="width: 80px; height: 32px" />
              </template>
              <template v-else>{{ formatAmount(overview?.totalRevenueToday) }}</template>
            </div>
            <div class="kpi-label">今日收入</div>
            <div class="kpi-sub">
              本月：{{ formatAmount(overview?.totalRevenueMonth) }}
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="16" class="chart-row">
      <!-- 用户增长趋势 -->
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="chart-card-header">
            <span class="chart-title">用户增长趋势</span>
          </div>
          <div v-if="trendLoading" class="chart-loading">
            <el-skeleton :rows="4" animated />
          </div>
          <LineChart
            v-else
            :x-data="userTrend.x"
            :series="[{ name: '新增用户', data: userTrend.y, color: '#1890ff' }]"
            height="280px"
          />
        </div>
      </el-col>

      <!-- DAU 趋势 -->
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="chart-card-header">
            <span class="chart-title">DAU 趋势</span>
          </div>
          <div v-if="trendLoading" class="chart-loading">
            <el-skeleton :rows="4" animated />
          </div>
          <LineChart
            v-else
            :x-data="dauTrend.x"
            :series="[{ name: 'DAU', data: dauTrend.y, color: '#52c41a' }]"
            height="280px"
          />
        </div>
      </el-col>

      <!-- 拨打量趋势 -->
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="chart-card-header">
            <span class="chart-title">拨打量趋势</span>
          </div>
          <div v-if="trendLoading" class="chart-loading">
            <el-skeleton :rows="4" animated />
          </div>
          <BarChart
            v-else
            :x-data="dialTrend.x"
            :series="[{ name: '拨打次数', data: dialTrend.y, color: '#faad14' }]"
            height="280px"
          />
        </div>
      </el-col>

      <!-- 收入趋势 -->
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="chart-card-header">
            <span class="chart-title">收入趋势</span>
          </div>
          <div v-if="trendLoading" class="chart-loading">
            <el-skeleton :rows="4" animated />
          </div>
          <BarChart
            v-else
            :x-data="revenueTrend.x"
            :series="[{ name: '收入（元）', data: revenueTrend.y, color: '#722ed1' }]"
            :y-formatter="(v) => '¥' + v"
            height="280px"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, TrendCharts, Star, Money, Top } from '@element-plus/icons-vue'
import { dashboardApi } from '@/api/dashboard'
import type { DashboardOverview, TrendItem } from '@/api/dashboard'
import { formatAmount, formatLargeNumber } from '@/utils/format'
import LineChart from '@/components/chart/LineChart.vue'
import BarChart from '@/components/chart/BarChart.vue'

const router = useRouter()

const dayRange = ref(30)
const overviewLoading = ref(false)
const trendLoading = ref(false)
const overview = ref<DashboardOverview | null>(null)

interface TrendData {
  x: string[]
  y: number[]
}

const userTrend = reactive<TrendData>({ x: [], y: [] })
const dauTrend = reactive<TrendData>({ x: [], y: [] })
const dialTrend = reactive<TrendData>({ x: [], y: [] })
const revenueTrend = reactive<TrendData>({ x: [], y: [] })

function parseTrend(items: TrendItem[]): TrendData {
  return {
    x: items.map((i) => i.date),
    y: items.map((i) => i.value),
  }
}

async function loadOverview() {
  overviewLoading.value = true
  try {
    overview.value = await dashboardApi.getOverview()
  } finally {
    overviewLoading.value = false
  }
}

async function loadTrends() {
  trendLoading.value = true
  try {
    const [userItems, dauItems, dialItems, revenueItems] = await Promise.all([
      dashboardApi.getTrend({ metric: 'user_growth', days: dayRange.value }),
      dashboardApi.getTrend({ metric: 'dau', days: dayRange.value }),
      dashboardApi.getTrend({ metric: 'dial', days: dayRange.value }),
      dashboardApi.getTrend({ metric: 'revenue', days: dayRange.value }),
    ])
    Object.assign(userTrend, parseTrend(userItems))
    Object.assign(dauTrend, parseTrend(dauItems))
    Object.assign(dialTrend, parseTrend(dialItems))
    Object.assign(revenueTrend, parseTrend(revenueItems))
  } finally {
    trendLoading.value = false
  }
}

function handleRangeChange() {
  loadTrends()
}

onMounted(() => {
  loadOverview()
  loadTrends()
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: 0;
}

.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;

  .page-title {
    font-size: 20px;
    font-weight: 700;
    color: #262626;
    margin: 0 0 4px;
  }

  .page-desc {
    font-size: 13px;
    color: #8c8c8c;
    margin: 0;
  }
}

// KPI 卡片
.kpi-row {
  margin-bottom: 16px;
}

.kpi-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 21, 41, 0.14);
  }
}

.kpi-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  :deep(.el-icon) {
    font-size: 28px;
    color: #fff;
  }

  &--blue { background: linear-gradient(135deg, #1890ff, #096dd9); }
  &--green { background: linear-gradient(135deg, #52c41a, #389e0d); }
  &--orange { background: linear-gradient(135deg, #fa8c16, #d46b08); }
  &--purple { background: linear-gradient(135deg, #722ed1, #531dab); }
}

.kpi-info {
  flex: 1;
  min-width: 0;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #262626;
  line-height: 1.2;
  margin-bottom: 4px;
}

.kpi-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 6px;
}

.kpi-trend {
  font-size: 12px;
  color: #52c41a;
  display: flex;
  align-items: center;
  gap: 2px;

  .trend-up {
    font-size: 12px;
  }
}

.kpi-sub {
  font-size: 12px;
  color: #8c8c8c;
}

// 图表卡片
.chart-row {
  margin-bottom: 16px;

  > :deep(.el-col) {
    margin-bottom: 16px;
  }
}

.chart-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  height: 100%;
}

.chart-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .chart-title {
    font-size: 15px;
    font-weight: 600;
    color: #262626;
  }
}

.chart-loading {
  height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
}
</style>
