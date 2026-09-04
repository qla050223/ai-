<script setup>
import { computed } from 'vue'
import ChartBase from './ChartBase.vue'

const props = defineProps({
  // { 专业技能: 85, 项目经验: 88, ... }
  data: { type: Object, default: () => ({}) },
  height: { type: String, default: '380px' }
})

const option = computed(() => {
  const indicators = Object.keys(props.data).map(name => ({ name, max: 100 }))
  const values = Object.values(props.data)
  return {
    tooltip: { trigger: 'item' },
    radar: {
      indicator: indicators,
      shape: 'polygon',
      splitNumber: 5,
      axisName: { color: '#4e5969', fontSize: 12 },
      splitArea: { areaStyle: { color: ['#fafbfc', '#f2f3f5', '#fafbfc', '#f2f3f5', '#fafbfc'] } },
      splitLine: { lineStyle: { color: '#e5e6eb' } },
      axisLine: { lineStyle: { color: '#e5e6eb' } }
    },
    series: [{
      type: 'radar',
      data: [{ value: values, name: '候选人能力' }],
      areaStyle: { color: 'rgba(91,143,249,0.25)' },
      lineStyle: { color: '#5B8FF9', width: 2 },
      itemStyle: { color: '#5B8FF9' },
      symbolSize: 6
    }]
  }
})
</script>

<template>
  <ChartBase :option="option" :height="height" />
</template>
