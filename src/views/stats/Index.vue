<template>
  <div class="stats-page">
    <!-- 顶部时间范围选择 -->
    <div class="stats-header">
      <div>
        <h2 class="page-title">使用统计</h2>
        <p class="page-desc">用户行为数据趋势分析</p>
      </div>
      <el-radio-group v-model="dayRange" size="default" @change="handleRangeChange">
        <el-radio-button :value="7">近 7 天</el-radio-button>
        <el-radio-button :value="30">近 30 天</el-radio-button>
        <el-radio-button :value="90">近 90 天</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Tab -->
    <div class="admin-card" style="padding: 0">
      <el-tabs v-model="activeTab" class="stats-tabs" @tab-change="handleTabChange">
        <!-- DAU -->
        <el-tab-pane label="DAU（日活）" name="dau">
          <div class="tab-chart-wrap">
            <div v-if="loading" class="chart-loading"><el-skeleton :rows="4" animated /></div>
            <LineChart
              v-else
              :x-data="chartData.xData"
              :series="[{ name: 'DAU', data: chartData.y1, color: '#1890ff' }]"
              height="340px"
            />
          </div>
        </el-tab-pane>

        <!-- 拨打量 -->
        <el-tab-pane label="拨打量" name="dial">
          <div class="tab-chart-wrap">
            <div v-if="loading" class="chart-loading"><el-skeleton :rows="4" animated /></div>
            <BarChart
              v-else
              :x-data="chartData.xData"
              :series="[
                { name: '拨打次数', data: chartData.y1, color: '#faad14' },
                { name: '客户数', data: chartData.y2, color: '#52c41a' }
              ]"
              height="340px"
            />
          </div>
        </el-tab-pane>

        <!-- 活跃时长 -->
        <el-tab-pane label="活跃时长" name="active_duration">
          <div class="tab-chart-wrap">
            <div v-if="loading" class="chart-loading"><el-skeleton :rows="4" animated /></div>
            <LineChart
              v-else
              :x-data="chartData.xData"
              :series="[
                { name: '平均时长(分钟)', data: chartData.y1, color: '#722ed1' },
                { name: '总时长(小时)', data: chartData.y2, color: '#13c2c2' }
              ]"
              height="340px"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { statsApi } from '@/api/stats'
import LineChart from '@/components/chart/LineChart.vue'
import BarChart from '@/components/chart/BarChart.vue'

type TabKey = 'dau' | 'dial' | 'active_duration'

const activeTab = ref<TabKey>('dau')
const dayRange = ref(30)
const loading = ref(false)

const chartData = reactive<{ xData: string[]; y1: number[]; y2: number[] }>({
  xData: [],
  y1: [],
  y2: [],
})

// 请求级缓存（5分钟）
const cache = new Map<string, { data: typeof chartData; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000

function getCacheKey(): string {
  return `${activeTab.value}:${dayRange.value}`
}

async function loadChartData() {
  const key = getCacheKey()
  const now = Date.now()
  const cached = cache.get(key)
  if (cached && now - cached.ts < CACHE_TTL) {
    Object.assign(chartData, cached.data)
    return
  }

  loading.value = true
  try {
    const params = { days: dayRange.value }
    let xData: string[] = []
    let y1: number[] = []
    let y2: number[] = []

    if (activeTab.value === 'dau') {
      const res = await statsApi.getDau(params)
      xData = res.items.map((i) => i.date)
      y1 = res.items.map((i) => i.value)
    } else if (activeTab.value === 'dial') {
      const res = await statsApi.getDial(params)
      xData = res.items.map((i) => i.date)
      y1 = res.items.map((i) => i.value)
      y2 = res.items.map((i) => i.value2 || 0)
    } else if (activeTab.value === 'active_duration') {
      const res = await statsApi.getActiveDuration(params)
      xData = res.items.map((i) => i.date)
      // value = avg_seconds, 转为分钟
      y1 = res.items.map((i) => Math.round(i.value / 60))
      // value2 = total_seconds, 转为小时
      y2 = res.items.map((i) => Math.round((i.value2 || 0) / 3600))
    }

    const newData = { xData, y1, y2 }
    cache.set(key, { data: { ...newData }, ts: now })
    Object.assign(chartData, newData)
  } finally {
    loading.value = false
  }
}

function handleTabChange() {
  loadChartData()
}

function handleRangeChange() {
  loadChartData()
}

onMounted(() => {
  loadChartData()
})
</script>

<style lang="scss" scoped>
.stats-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
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

.stats-tabs {
  :deep(.el-tabs__header) {
    padding: 0 24px;
    margin-bottom: 0;
  }
}

.tab-chart-wrap {
  padding: 24px;
  min-height: 380px;
}

.chart-loading {
  height: 340px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
