<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart, RadarChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  DataZoomComponent, ToolboxComponent, RadarComponent
} from 'echarts/components'

use([
  CanvasRenderer, PieChart, BarChart, LineChart, RadarChart,
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  DataZoomComponent, ToolboxComponent, RadarComponent
])

const props = defineProps({
  option: { type: Object, required: true },
  height: { type: String, default: '320px' },
  width: { type: String, default: '100%' }
})
</script>

<template>
  <v-chart :option="option" :style="{ width, height }" autoresize />
</template>
