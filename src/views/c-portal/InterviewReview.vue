<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCandidateDataStore } from '@/stores/candidate'
import RadarChart from '@/components/RadarChart.vue'

const router = useRouter()
const route = useRoute()
const dataStore = useCandidateDataStore()

const interview = computed(() => dataStore.interviewById(route.params.id))

const radarData = computed(() => interview.value?.radar || {})

const dialogue = ref([
  { role: 'ai', time: '20:15', dim: '开场', content: '你好，陆星河。我是你的 AI 模拟面试官...请用 1 分钟做个自我介绍，重点放在技术栈与近期项目。' },
  { role: 'candidate', time: '20:16', content: '你好，我叫陆星河，4 年前端经验。最近在网易主导云音乐播放器的前端架构，技术栈 Vue3 + TypeScript + Vite。擅长性能优化与工程化。' },
  { role: 'ai', time: '20:17', dim: '专业技能', content: 'Vue3 的 ref 与 reactive 区别？响应式原理是什么？什么场景用哪个？' },
  { role: 'candidate', time: '20:19', content: 'ref 用于基本类型，通过 .value 访问；reactive 用于对象，基于 Proxy 实现深度响应式。场景上，基本类型用 ref，对象/数组用 reactive...' },
  { role: 'ai', time: '20:20', dim: '专业技能', content: '你提到 reactive 解构会丢失响应性，进一步说明原因？toRefs 如何解决？', isFollowUp: true },
  { role: 'candidate', time: '20:22', content: '解构后得到的是原始值，脱离了 Proxy 代理；toRefs 将每个属性包装成 ref，解构后仍保持引用...' },
  { role: 'ai', time: '20:23', dim: '项目经验', content: '请还原一次性能优化的完整路径——如何定位瓶颈、采取手段、度量结果？' },
  { role: 'candidate', time: '20:26', content: '通过 Lighthouse 定位首屏瓶颈，主因是大包体积；采取分包、懒加载、CDN 优化，首屏从 3.2s 降至 1.1s...' },
  { role: 'ai', time: '20:28', dim: '收尾', content: '回答很有体系，模拟结束。整体表现良好，工程化体系性可加强。' }
])

function goBack() {
  router.push('/c/my')
}
function goResult() {
  router.push(`/c/mock/result/${route.params.id}`)
}
</script>

<template>
  <div class="rv-page" v-if="interview">
    <button class="back-btn" @click="goBack">← 返回列表</button>

    <!-- 概要 -->
    <div class="rv-head">
      <div>
        <h1>{{ interview.positionTitle }}</h1>
        <div class="rv-meta">
          <span class="rv-type" :class="interview.type">{{ interview.type === 'mock' ? '🤖 模拟练习' : '🏢 企业面试' }}</span>
          <span>📅 {{ interview.date }}</span>
          <span>⏱ {{ interview.duration }} 分钟</span>
          <span>📝 {{ interview.questionCount }} 题</span>
        </div>
      </div>
      <div class="rv-score" :class="interview.overallScore >= 80 ? 'good' : interview.overallScore >= 60 ? 'mid' : 'low'">
        {{ interview.overallScore }}
      </div>
    </div>

    <div class="rv-body">
      <!-- 对话记录 -->
      <div class="rv-card rv-chat-card">
        <div class="rv-card-title">💬 完整对话记录</div>
        <div class="rv-chat">
          <div v-for="(m, i) in dialogue" :key="i" class="rv-msg" :class="m.role">
            <div class="rv-avatar">{{ m.role === 'ai' ? '🤖' : '🙂' }}</div>
            <div class="rv-bubble">
              <div class="rv-msg-meta">
                <span class="rv-msg-name">{{ m.role === 'ai' ? 'AI 面试官' : '陆星河' }}</span>
                <span v-if="m.dim" class="rv-msg-dim">{{ m.dim }}{{ m.isFollowUp ? ' · 追问' : '' }}</span>
                <span class="rv-msg-time">{{ m.time }}</span>
              </div>
              <div class="rv-msg-content">{{ m.content }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边 -->
      <div class="rv-side">
        <div class="rv-card">
          <div class="rv-card-title">📊 能力雷达</div>
          <RadarChart :data="radarData" height="280px" />
          <div class="rv-dim-list">
            <div v-for="(v, k) in interview.radar" :key="k" class="rv-dim-row">
              <span class="rv-dim-name">{{ k }}</span>
              <div class="rv-dim-bar"><div class="rv-dim-inner" :style="{ width: v + '%' }"></div></div>
              <span class="rv-dim-score">{{ v }}</span>
            </div>
          </div>
        </div>

        <div class="rv-card">
          <div class="rv-card-title">🎯 AI 评语</div>
          <p class="rv-summary">{{ interview.summary }}</p>
          <div v-if="interview.shortboards?.length" class="rv-sb">
            <div class="rv-sb-title">⚠ 短板提示</div>
            <span v-for="s in interview.shortboards" :key="s" class="rv-sb-tag">{{ s }}</span>
          </div>
        </div>

        <button class="rv-detail-btn" @click="goResult">查看完整报告 ›</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rv-page { display: flex; flex-direction: column; gap: 16px; }
.back-btn { align-self: flex-start; padding: 8px 16px; border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; color: #6b7280; font-size: 13px; cursor: pointer; }
.rv-head { background: #fff; border-radius: 16px; padding: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.rv-head h1 { font-size: 22px; color: #1f2937; margin-bottom: 10px; }
.rv-meta { display: flex; gap: 16px; font-size: 13px; color: #9ca3af; align-items: center; flex-wrap: wrap; }
.rv-type { padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
.rv-type.mock { background: #ede9fe; color: #6d28d9; }
.rv-type.enterprise { background: #dbeafe; color: #2563eb; }
.rv-score { font-size: 48px; font-weight: 700; line-height: 1; }
.rv-score.good { color: #059669; }
.rv-score.mid { color: #7c3aed; }
.rv-score.low { color: #ef4444; }

.rv-body { display: grid; grid-template-columns: 1fr 320px; gap: 16px; }
.rv-card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.rv-card-title { font-size: 14px; font-weight: 700; color: #1f2937; margin-bottom: 16px; }
.rv-chat-card { padding: 20px 24px; }
.rv-chat { display: flex; flex-direction: column; gap: 14px; max-height: 600px; overflow-y: auto; padding-right: 4px; }
.rv-msg { display: flex; gap: 10px; max-width: 85%; }
.rv-msg.candidate { align-self: flex-end; flex-direction: row-reverse; }
.rv-avatar { width: 32px; height: 32px; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.rv-msg.candidate .rv-avatar { background: #ede9fe; }
.rv-bubble { padding: 10px 14px; border-radius: 12px; background: #f9fafb; }
.rv-msg.candidate .rv-bubble { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; }
.rv-msg-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.rv-msg-name { font-size: 11px; font-weight: 600; color: #6b7280; }
.rv-msg.candidate .rv-msg-name { color: rgba(255,255,255,.9); }
.rv-msg-dim { font-size: 10px; padding: 1px 6px; background: #ede9fe; color: #6d28d9; border-radius: 3px; }
.rv-msg.candidate .rv-msg-dim { background: rgba(255,255,255,.2); color: #fff; }
.rv-msg-time { font-size: 10px; color: #9ca3af; margin-left: auto; }
.rv-msg.candidate .rv-msg-time { color: rgba(255,255,255,.7); }
.rv-msg-content { font-size: 13px; line-height: 1.6; color: #1f2937; }
.rv-msg.candidate .rv-msg-content { color: #fff; }

.rv-side { display: flex; flex-direction: column; gap: 16px; }
.rv-dim-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.rv-dim-row { display: flex; align-items: center; gap: 8px; }
.rv-dim-name { width: 70px; font-size: 12px; color: #4b5563; }
.rv-dim-bar { flex: 1; height: 6px; background: #f3f4f6; border-radius: 3px; overflow: hidden; }
.rv-dim-inner { height: 100%; background: #7c3aed; border-radius: 3px; }
.rv-dim-score { width: 30px; text-align: right; font-size: 12px; font-weight: 700; color: #1f2937; }
.rv-summary { font-size: 13px; color: #4b5563; line-height: 1.7; background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 3px solid #7c3aed; margin: 0; }
.rv-sb { margin-top: 12px; }
.rv-sb-title { font-size: 12px; color: #b45309; font-weight: 600; margin-bottom: 6px; }
.rv-sb-tag { display: inline-block; margin-right: 6px; padding: 3px 8px; background: #fef3c7; color: #92400e; border-radius: 4px; font-size: 11px; }
.rv-detail-btn { height: 44px; border: none; border-radius: 12px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; }
.rv-detail-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,.3); }
</style>
