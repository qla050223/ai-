<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ChartBase from '@/components/ChartBase.vue'
import { dashboardStats, talents } from '@/mock/data'
import { recommendLevelMap } from '@/mock/data'

const router = useRouter()

const statCards = computed(() => [
  { label: '面试场次', value: dashboardStats.totalInterviews, unit: '场', trend: '+12%', color: '#5B8FF9', icon: '🎯' },
  { label: '候选人数量', value: dashboardStats.totalCandidates, unit: '人', trend: '+8%', color: '#5AD8A6', icon: '👥' },
  { label: '通过率', value: dashboardStats.passRate, unit: '%', trend: '+3pp', color: '#5D7092', icon: '✅' },
  { label: '平均分', value: dashboardStats.avgScore, unit: '分', trend: '+1.2', color: '#F6BD16', icon: '📊' }
])

// 近 7 天面试趋势 - 面积折线
const trendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['面试场次', '通过'], right: 0, top: 0, icon: 'roundRect' },
  grid: { left: 0, right: 10, top: 36, bottom: 0, containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: dashboardStats.trend.dates, axisLine: { lineStyle: { color: '#e5e6eb' } } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f2f3f5' } } },
  series: [
    {
      name: '面试场次', type: 'line', smooth: true, data: dashboardStats.trend.interviews,
      itemStyle: { color: '#5B8FF9' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(91,143,249,0.35)' }, { offset: 1, color: 'rgba(91,143,249,0.02)' }] } },
      lineStyle: { width: 3 }
    },
    {
      name: '通过', type: 'line', smooth: true, data: dashboardStats.trend.passes,
      itemStyle: { color: '#5AD8A6' }, areaStyle: { color: 'rgba(90,216,166,0.15)' }, lineStyle: { width: 3 }
    }
  ]
}))

// 岗位分布 - 环形饼图
const positionOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} 场 ({d}%)' },
  legend: { bottom: 0, icon: 'circle' },
  series: [{
    type: 'pie', radius: ['45%', '70%'], center: ['50%', '42%'],
    avoidLabelOverlap: true,
    itemStyle: { borderColor: '#fff', borderWidth: 2 },
    label: { show: false, position: 'center' },
    emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
    color: ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E86452'],
    data: dashboardStats.byPosition
  }]
}))

// 面试官分布 - 横向柱状
const interviewerOption = computed(() => {
  const names = dashboardStats.byInterviewer.map(i => i.name)
  const values = dashboardStats.byInterviewer.map(i => i.value)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 0, right: 20, top: 10, bottom: 0, containLabel: true },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: '#f2f3f5' } } },
    yAxis: { type: 'category', data: names, axisLine: { lineStyle: { color: '#e5e6eb' } } },
    series: [{
      type: 'bar', data: values, barWidth: 18,
      itemStyle: { color: '#5B8FF9', borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', color: '#86909c' }
    }]
  }
})

function gotoReport(id) {
  // 跳转到候选人对应报告
  router.push('/report')
}
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">数据看板</h2>
    <p class="page-desc">近 30 天招聘面试整体情况一览</p>

    <!-- 指标卡 -->
    <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen" item-responsive>
      <n-grid-item v-for="card in statCards" :key="card.label" span="4 m:2 l:1">
        <n-card :bordered="false" class="stat-card">
          <div class="stat-card-body">
            <div class="sc-left">
              <div class="sc-label">{{ card.label }}</div>
              <div class="sc-value">{{ card.value }}<span class="sc-unit">{{ card.unit }}</span></div>
              <div class="sc-trend"><span style="color: #5AD8A6">{{ card.trend }}</span> 较上周</div>
            </div>
            <div class="sc-icon" :style="{ background: card.color + '1a', color: card.color }">{{ card.icon }}</div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- 图表区 -->
    <n-grid :cols="3" :x-gap="16" :y-gap="16" responsive="screen" item-responsive style="margin-top: 16px">
      <n-grid-item span="3 l:2">
        <n-card title="近 7 天面试趋势" :bordered="false">
          <ChartBase :option="trendOption" height="320px" />
        </n-card>
      </n-grid-item>
      <n-grid-item span="3 l:1">
        <n-card title="岗位分布" :bordered="false">
          <ChartBase :option="positionOption" height="320px" />
        </n-card>
      </n-grid-item>
      <n-grid-item span="3 l:1">
        <n-card title="面试官场次分布" :bordered="false">
          <ChartBase :option="interviewerOption" height="320px" />
        </n-card>
      </n-grid-item>
      <n-grid-item span="3 l:2">
        <n-card title="高潜力人才" :bordered="false">
          <n-list hover-cancellable>
            <n-list-item v-for="t in talents" :key="t.candidateId" @click="gotoReport(t.candidateId)">
              <n-thing>
                <template #avatar>
                  <n-avatar round color="#5B8FF9">{{ t.name[0] }}</n-avatar>
                </template>
                <template #header>
                  <span style="font-weight: 600">{{ t.name }}</span>
                  <n-tag :type="recommendLevelMap[t.level].type" size="small" style="margin-left: 8px">
                    {{ recommendLevelMap[t.level].label }}
                  </n-tag>
                </template>
                <template #description>
                  <n-space :size="20">
                    <span>应聘岗位：{{ t.position }}</span>
                    <span>综合分：<b style="color: #5B8FF9">{{ t.score }}</b></span>
                  </n-space>
                </template>
                <template #action>
                  <n-button text type="primary">查看报告 →</n-button>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<style scoped>
.stat-card { border-radius: 8px; }
.stat-card-body { display: flex; justify-content: space-between; align-items: center; }
.sc-label { font-size: 13px; color: #86909c; }
.sc-value { font-size: 28px; font-weight: 700; margin: 6px 0; color: #1f2329; }
.sc-unit { font-size: 13px; font-weight: 400; color: #86909c; margin-left: 4px; }
.sc-trend { font-size: 12px; color: #86909c; }
.sc-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
</style>
