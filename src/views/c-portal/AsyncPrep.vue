<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAsyncInterviewStore } from '@/stores/candidate'

const router = useRouter()
const store = useAsyncInterviewStore()

// 环境检测步骤
const checks = reactive({
  browser: { status: 'pending', label: '浏览器兼容性' },
  network: { status: 'pending', label: '网络延迟' },
  input: { status: 'pending', label: '输入法可用性' },
  device: { status: 'pending', label: '设备指纹确认' }
})
const allPassed = ref(false)
const agreed = ref(false)

onMounted(async () => {
  // 没有 token 则回入口
  if (!store.isVerified) {
    router.replace('/c/login')
    return
  }
  // 模拟逐项检测
  const steps = ['browser', 'network', 'input', 'device']
  for (const key of steps) {
    await new Promise(r => setTimeout(r, 600))
    checks[key].status = 'pass'
  }
  allPassed.value = true
})

function enterRoom() {
  if (!allPassed.value || !agreed.value) return
  router.push('/c/async/room')
}
</script>

<template>
  <div class="prep-page">
    <div class="prep-container">
      <div class="prep-header">
        <div class="prep-brand">
          <span class="prep-logo">{{ store.invitation?.orgLogo || '🎯' }}</span>
          <div>
            <div class="prep-org">{{ store.invitation?.orgName }}</div>
            <div class="prep-pos">{{ store.invitation?.positionTitle }} · 异步面试</div>
          </div>
        </div>
      </div>

      <h1 class="prep-title">面试准备</h1>
      <p class="prep-desc">开始正式面试前，请完成以下准备步骤，确保作答过程稳定。</p>

      <!-- 步骤 1：环境检测 -->
      <div class="step-card">
        <div class="step-head">
          <span class="step-num">1</span>
          <span class="step-name">环境检测</span>
          <span v-if="allPassed" class="step-done">✓ 全部通过</span>
        </div>
        <div class="check-list">
          <div v-for="(c, k) in checks" :key="k" class="check-row">
            <span class="check-icon" :class="c.status">
              <span v-if="c.status === 'pending'" class="mini-spin"></span>
              <span v-else-if="c.status === 'pass'">✓</span>
            </span>
            <span class="check-label">{{ c.label }}</span>
            <span class="check-status" :class="c.status">
              {{ c.status === 'pending' ? '检测中...' : c.status === 'pass' ? '正常' : '异常' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 步骤 2：阅读说明 -->
      <div class="step-card">
        <div class="step-head">
          <span class="step-num">2</span>
          <span class="step-name">面试规则说明</span>
        </div>
        <ul class="rule-list">
          <li><b>流程</b>：AI 面试官会按维度逐题发问，每题作答后可触发动态追问。</li>
          <li><b>时长</b>：总时长 {{ store.invitation?.duration }} 分钟，倒计时归零将自动提交。</li>
          <li><b>暂停</b>：可暂停，累计次数受 HR 配置限制，暂停时长不计入作答时长。</li>
          <li><b>离页</b>：离开页面（失焦）的次数与时长将被记录写入报告。</li>
          <li><b>防作弊</b>：禁止复制粘贴题目内容，AI 作答不真实性将标注。</li>
          <li><b>离线保护</b>：网络中断时作答内容本地缓存，恢复后自动同步。</li>
        </ul>
      </div>

      <!-- 步骤 3：知情同意 -->
      <div class="step-card">
        <div class="step-head">
          <span class="step-num">3</span>
          <span class="step-name">数据授权与知情同意</span>
        </div>
        <label class="consent-row">
          <input v-model="agreed" type="checkbox" :disabled="!allPassed" />
          <span class="consent-text">
            我已阅读上述说明，同意将本次面试作答数据、评估结果提供给 <b>{{ store.invitation?.orgName }}</b> 用于招聘评估，并理解 AI 面试官的非人判断属性。
          </span>
        </label>
      </div>

      <button class="btn-start" :disabled="!allPassed || !agreed" @click="enterRoom">
        {{ !allPassed ? '环境检测中...' : !agreed ? '请先勾选知情同意' : '开始面试 →' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.prep-page {
  min-height: 100vh; background: #f6f8fb;
  padding: 40px 24px; box-sizing: border-box;
}
.prep-container { max-width: 720px; margin: 0 auto; }
.prep-header { margin-bottom: 24px; }
.prep-brand { display: flex; align-items: center; gap: 12px; }
.prep-logo {
  width: 48px; height: 48px; border-radius: 12px; background: #ede9fe;
  font-size: 24px; display: flex; align-items: center; justify-content: center;
}
.prep-org { font-size: 15px; font-weight: 700; color: #1f2937; }
.prep-pos { font-size: 12px; color: #9ca3af; }
.prep-title { font-size: 26px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
.prep-desc { font-size: 14px; color: #6b7280; margin-bottom: 24px; }
.step-card {
  background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.step-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.step-num {
  width: 26px; height: 26px; border-radius: 50%; background: #6d28d9; color: #fff;
  font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center;
}
.step-name { font-size: 16px; font-weight: 600; color: #1f2937; flex: 1; }
.step-done { font-size: 12px; color: #10b981; font-weight: 600; }
.check-list { display: flex; flex-direction: column; gap: 10px; }
.check-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #f9fafb; border-radius: 10px; }
.check-icon {
  width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
}
.check-icon.pending { background: #e0e7ff; }
.check-icon.pass { background: #d1fae5; color: #059669; }
.check-icon.fail { background: #fee2e2; color: #dc2626; }
.mini-spin {
  width: 12px; height: 12px; border: 2px solid #c7d2fe; border-top-color: #6d28d9;
  border-radius: 50%; animation: spin 1s linear infinite; display: block;
}
@keyframes spin { to { transform: rotate(360deg); } }
.check-label { flex: 1; font-size: 14px; color: #374151; }
.check-status { font-size: 12px; font-weight: 500; }
.check-status.pending { color: #6d28d9; }
.check-status.pass { color: #059669; }
.check-status.fail { color: #dc2626; }
.rule-list { margin: 0; padding-left: 18px; }
.rule-list li { font-size: 13px; color: #4b5563; line-height: 1.9; }
.rule-list li b { color: #1f2937; }
.consent-row { display: flex; gap: 10px; align-items: flex-start; cursor: pointer; }
.consent-row input { margin-top: 3px; width: 16px; height: 16px; accent-color: #6d28d9; }
.consent-text { font-size: 13px; color: #4b5563; line-height: 1.7; }
.consent-text b { color: #6d28d9; }
.btn-start {
  width: 100%; height: 52px; border: none; border-radius: 12px; margin-top: 8px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff;
  font-size: 16px; font-weight: 600; cursor: pointer; transition: all .2s;
}
.btn-start:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,58,237,.4); }
.btn-start:disabled { opacity: .5; cursor: not-allowed; background: #c4b5fd; }
</style>
