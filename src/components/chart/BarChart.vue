<template>
  <v-chart :option="option" :style="chartStyle" autoresize />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'

use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, BarChart, CanvasRenderer])

const props = withDefaults(
  defineProps<{
    title?: string
    xData: string[]
    series: Array<{
      name: string
      data: number[]
      color?: string
    }>
    height?: string
    yFormatter?: (val: number) => string
  }>(),
  {
    height: '300px',
  },
)

const chartStyle = computed(() => ({ height: props.height }))

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']

const option = computed<EChartsOption>(() => ({
  title: props.title
    ? { text: props.title, textStyle: { fontSize: 14, fontWeight: 600, color: '#262626' } }
    : undefined,
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params: unknown) => {
      const arr = params as Array<{ seriesName: string; value: number; axisValueLabel: string }>
      if (!arr.length) return ''
      let html = `<div style="font-weight:600;margin-bottom:4px">${arr[0].axisValueLabel}</div>`
      arr.forEach((p) => {
        const val = props.yFormatter ? props.yFormatter(p.value) : p.value
        html += `<div>${p.seriesName}：${val}</div>`
      })
      return html
    },
  },
  legend: {
    show: props.series.length > 1,
    bottom: 0,
  },
  grid: { left: 16, right: 16, top: props.title ? 40 : 16, bottom: props.series.length > 1 ? 36 : 16, containLabel: true },
  xAxis: {
    type: 'category',
    data: props.xData,
    axisLine: { lineStyle: { color: '#d9d9d9' } },
    axisTick: { show: false },
    axisLabel: { color: '#8c8c8c', fontSize: 12 },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#f0f0f0' } },
    axisLabel: {
      color: '#8c8c8c',
      fontSize: 12,
      formatter: props.yFormatter,
    },
  },
  series: props.series.map((s, i) => ({
    name: s.name,
    type: 'bar' as const,
    data: s.data,
    barMaxWidth: 40,
    itemStyle: {
      color: s.color || COLORS[i % COLORS.length],
      borderRadius: [4, 4, 0, 0],
    },
  })),
}))
</script>
