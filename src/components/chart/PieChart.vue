<template>
  <v-chart :option="option" :style="chartStyle" autoresize />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'

use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer])

const props = withDefaults(
  defineProps<{
    title?: string
    data: Array<{ name: string; value: number; color?: string }>
    height?: string
    donut?: boolean
  }>(),
  {
    height: '300px',
    donut: true,
  },
)

const chartStyle = computed(() => ({ height: props.height }))

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96']

const option = computed<EChartsOption>(() => ({
  title: props.title
    ? {
        text: props.title,
        textStyle: { fontSize: 14, fontWeight: 600, color: '#262626' },
      }
    : undefined,
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    formatter: (name: string) => {
      const item = props.data.find((d) => d.name === name)
      return item ? `${name}: ${item.value}` : name
    },
  },
  series: [
    {
      name: props.title || '',
      type: 'pie' as const,
      radius: props.donut ? ['40%', '70%'] : '70%',
      center: ['40%', '50%'],
      data: props.data.map((item, i) => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: item.color || COLORS[i % COLORS.length],
        },
      })),
      label: {
        formatter: '{b}: {d}%',
        fontSize: 12,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
}))
</script>
