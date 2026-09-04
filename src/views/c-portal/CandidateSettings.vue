<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCandidateAuthStore, useCandidateDataStore } from '@/stores/candidate'

const router = useRouter()
const auth = useCandidateAuthStore()
const dataStore = useCandidateDataStore()

const tab = ref('profile')

const tabs = [
  { label: '个人资料', value: 'profile' },
  { label: '数据授权', value: 'consent' },
  { label: '简历管理', value: 'resume' },
  { label: '账号注销', value: 'cancel' }
]

// 个人资料表单
const profileForm = reactive({
  name: auth.user?.name || '',
  phone: auth.user?.phone || '',
  jobIntention: {
    position: auth.user?.jobIntention?.position || '',
    city: auth.user?.jobIntention?.city || '',
    salary: auth.user?.jobIntention?.salary || '',
    workYears: auth.user?.jobIntention?.workYears || ''
  }
})
const profileSaved = ref(false)
function saveProfile() {
  auth.updateUser({
    name: profileForm.name,
    phone: profileForm.phone,
    jobIntention: { ...profileForm.jobIntention }
  })
  profileSaved.value = true
  setTimeout(() => profileSaved.value = false, 2000)
}

// 数据授权
function revokeConsent(id) {
  if (confirm('确认撤回该企业的数据授权？撤回后企业将无法再访问你的新增数据。')) {
    dataStore.revokeConsent(id)
  }
}

// 简历管理
const resumes = ref(auth.user?.resumes || [])
const showUpload = ref(false)
const newResumeName = ref('')

function setDefault(id) {
  resumes.value.forEach(r => r.isDefault = r.id === id)
  auth.updateUser({ resumes: resumes.value })
}
function deleteResume(id) {
  if (resumes.value.length <= 1) {
    alert('至少保留一份简历')
    return
  }
  if (confirm('确认删除该简历？')) {
    resumes.value = resumes.value.filter(r => r.id !== id)
    auth.updateUser({ resumes: resumes.value })
  }
}
function addResume() {
  if (!newResumeName.value.trim()) return
  const id = 'rs_' + Date.now()
  resumes.value.unshift({
    id, name: newResumeName.value, uploadedAt: new Date().toISOString().slice(0, 10),
    isDefault: false,
    parsed: { education: '-', workYears: 0, lastCompany: '-', skills: [], projects: [] }
  })
  auth.updateUser({ resumes: resumes.value })
  newResumeName.value = ''
  showUpload.value = false
}

// 账号注销
const cancelStep = ref(0)
const cancelAgreed = ref(false)
const cancelReason = ref('')
function confirmCancel() {
  if (!cancelAgreed.value) { alert('请先确认数据归属处理方式'); return }
  if (confirm('最终确认：此操作不可恢复，将删除你的模拟练习数据。企业面试数据按企业策略保留。是否继续？')) {
    dataStore.deleteAccount()
    auth.logout()
    router.push('/c/login')
  }
}
function logout() {
  auth.logout()
  router.push('/c/login')
}
</script>

<template>
  <div class="set-page">
    <div class="set-layout">
      <!-- 侧边 Tab -->
      <aside class="set-side">
        <div class="set-user-card">
          <div class="su-avatar">{{ auth.user?.name?.charAt(0) || 'U' }}</div>
          <div class="su-info">
            <div class="su-name">{{ auth.displayName }}</div>
            <div class="su-email">{{ auth.user?.email }}</div>
          </div>
        </div>
        <div class="set-tabs">
          <button v-for="t in tabs" :key="t.value" class="set-tab" :class="{ active: tab === t.value }" @click="tab = t.value">
            {{ t.label }}
          </button>
        </div>
        <button class="set-logout" @click="logout">退出登录</button>
      </aside>

      <!-- 内容 -->
      <div class="set-content">
        <!-- 个人资料 -->
        <div v-if="tab === 'profile'" class="panel">
          <h2>个人资料</h2>
          <p class="panel-desc">完善资料后，AI 可更精准推荐匹配岗位题库。</p>
          <div class="form-grid">
            <div class="form-field">
              <label>姓名</label>
              <input v-model="profileForm.name" class="form-input" placeholder="你的称呼" />
            </div>
            <div class="form-field">
              <label>手机</label>
              <input v-model="profileForm.phone" class="form-input" placeholder="联系电话" />
            </div>
          </div>
          <h3 class="form-sub-title">求职意向</h3>
          <div class="form-grid">
            <div class="form-field">
              <label>目标岗位</label>
              <input v-model="profileForm.jobIntention.position" class="form-input" placeholder="如：高级前端工程师" />
            </div>
            <div class="form-field">
              <label>城市</label>
              <input v-model="profileForm.jobIntention.city" class="form-input" placeholder="如：杭州" />
            </div>
            <div class="form-field">
              <label>期望薪资</label>
              <input v-model="profileForm.jobIntention.salary" class="form-input" placeholder="如：25-40K" />
            </div>
            <div class="form-field">
              <label>工作年限</label>
              <input v-model.number="profileForm.jobIntention.workYears" type="number" class="form-input" placeholder="如：4" />
            </div>
          </div>
          <div class="form-actions">
            <button class="save-btn" @click="saveProfile">{{ profileSaved ? '✓ 已保存' : '保存' }}</button>
          </div>
        </div>

        <!-- 数据授权 -->
        <div v-if="tab === 'consent'" class="panel">
          <h2>数据授权管理</h2>
          <p class="panel-desc">管理你授权给企业的数据访问权限，可随时撤回。</p>
          <div class="consent-list">
            <div v-for="c in dataStore.consents" :key="c.id" class="consent-card">
              <div class="cc-main">
                <div class="cc-head">
                  <span class="cc-org">{{ c.orgName }}</span>
                  <span class="cc-type">{{ c.type }}</span>
                  <span class="cc-status" :class="c.status">{{ c.status === 'active' ? '● 授权中' : '已撤回' }}</span>
                </div>
                <div class="cc-meta">
                  <span>授权时间：{{ c.consentAt }}</span>
                  <span v-if="c.revokedAt">撤回时间：{{ c.revokedAt }}</span>
                </div>
                <div class="cc-scope">授权范围：{{ c.scope }}</div>
              </div>
              <button v-if="c.canRevoke" class="revoke-btn" @click="revokeConsent(c.id)">撤回</button>
              <span v-else class="revoke-disabled">—</span>
            </div>
            <div v-if="!dataStore.consents.length" class="empty-inline">暂无授权记录</div>
          </div>
        </div>

        <!-- 简历管理 -->
        <div v-if="tab === 'resume'" class="panel">
          <div class="panel-head">
            <h2>简历管理</h2>
            <button class="add-btn" @click="showUpload = !showUpload">+ 新增简历</button>
          </div>
          <p class="panel-desc">多版本简历管理，模拟练习时可选择作为出题依据。</p>

          <div v-if="showUpload" class="upload-box">
            <input v-model="newResumeName" class="form-input" placeholder="简历名称（如：前端版）" />
            <button class="save-btn" @click="addResume">添加</button>
          </div>

          <div class="resume-list">
            <div v-for="r in resumes" :key="r.id" class="resume-card">
              <div class="rc-main">
                <div class="rc-head">
                  <span class="rc-icon">📄</span>
                  <span class="rc-name">{{ r.name }}</span>
                  <span v-if="r.isDefault" class="rc-default">默认</span>
                </div>
                <div class="rc-meta">
                  <span>上传：{{ r.uploadedAt }}</span>
                  <span>技能：{{ r.parsed.skills?.join(' / ') || '—' }}</span>
                </div>
                <div class="rc-parsed">
                  <span>教育：{{ r.parsed.education }}</span>
                  <span>最近公司：{{ r.parsed.lastCompany }}</span>
                </div>
              </div>
              <div class="rc-actions">
                <button v-if="!r.isDefault" class="rc-btn" @click="setDefault(r.id)">设默认</button>
                <button class="rc-btn danger" @click="deleteResume(r.id)">删除</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 账号注销 -->
        <div v-if="tab === 'cancel'" class="panel">
          <h2>账号注销</h2>
          <p class="panel-desc warn">注销后不可恢复，请谨慎操作。</p>

          <div class="cancel-flow">
            <div class="cf-step" :class="{ active: cancelStep >= 0, done: cancelStep > 0 }">
              <span class="cf-num">{{ cancelStep > 0 ? '✓' : '1' }}</span>
              <div>
                <div class="cf-title">数据归属确认</div>
                <p class="cf-desc">注销后：模拟练习数据将被删除；企业面试数据按企业策略保留。</p>
              </div>
            </div>
            <div class="cf-step" :class="{ active: cancelStep >= 1, done: cancelStep > 1 }">
              <span class="cf-num">{{ cancelStep > 1 ? '✓' : '2' }}</span>
              <div>
                <div class="cf-title">二次确认</div>
                <p class="cf-desc">勾选下方确认后点击"确认注销"。</p>
              </div>
            </div>
          </div>

          <label class="cancel-agree">
            <input v-model="cancelAgreed" type="checkbox" @change="cancelStep = cancelAgreed ? 1 : 0" />
            <span>我已知晓注销后果，确认处理数据归属，同意注销账号。</span>
          </label>

          <div class="form-actions">
            <button class="cancel-btn" :disabled="!cancelAgreed" @click="confirmCancel">确认注销</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.set-page { }
.set-layout { display: flex; gap: 20px; align-items: flex-start; }
.set-side { width: 240px; display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }
.set-user-card {
  background: #fff; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.su-avatar {
  width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: #fff; font-weight: 600; font-size: 18px; display: flex; align-items: center; justify-content: center;
}
.su-name { font-size: 14px; font-weight: 600; color: #1f2937; }
.su-email { font-size: 12px; color: #9ca3af; }
.set-tabs { background: #fff; border-radius: 16px; padding: 8px; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.set-tab { padding: 10px 16px; border: none; background: transparent; color: #6b7280; font-size: 13px; text-align: left; border-radius: 8px; cursor: pointer; transition: all .2s; }
.set-tab:hover { background: #f9fafb; }
.set-tab.active { background: #ede9fe; color: #6d28d9; font-weight: 600; }
.set-logout { padding: 10px 16px; border: 1px solid #e5e7eb; background: #fff; color: #6b7280; border-radius: 12px; font-size: 13px; cursor: pointer; transition: all .2s; }
.set-logout:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }

.set-content { flex: 1; }
.panel { background: #fff; border-radius: 16px; padding: 28px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.panel h2 { font-size: 20px; color: #1f2937; margin-bottom: 8px; }
.panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.panel-head h2 { margin-bottom: 0; }
.add-btn { padding: 8px 16px; border: none; border-radius: 8px; background: #7c3aed; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; }
.panel-desc { font-size: 13px; color: #9ca3af; margin-bottom: 24px; }
.panel-desc.warn { color: #dc2626; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field label { font-size: 13px; color: #374151; font-weight: 500; }
.form-input {
  height: 40px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 8px;
  font-size: 13px; outline: none; background: #fafafa; transition: all .2s; box-sizing: border-box;
}
.form-input:focus { border-color: #7c3aed; background: #fff; box-shadow: 0 0 0 3px rgba(124,58,237,.1); }
.form-sub-title { font-size: 14px; color: #1f2937; font-weight: 600; margin: 12px 0 16px; padding-top: 12px; border-top: 1px solid #f3f4f6; }
.form-actions { margin-top: 20px; }
.save-btn { padding: 10px 28px; border: none; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }
.save-btn:hover { box-shadow: 0 6px 20px rgba(124,58,237,.3); }

.consent-list { display: flex; flex-direction: column; gap: 12px; }
.consent-card { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f9fafb; border-radius: 12px; }
.cc-main { flex: 1; }
.cc-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.cc-org { font-size: 14px; font-weight: 600; color: #1f2937; }
.cc-type { padding: 2px 8px; background: #ede9fe; color: #6d28d9; border-radius: 4px; font-size: 11px; }
.cc-status { font-size: 12px; margin-left: auto; }
.cc-status.active { color: #059669; }
.cc-status.revoked { color: #9ca3af; }
.cc-meta { display: flex; gap: 16px; font-size: 12px; color: #9ca3af; margin-bottom: 4px; }
.cc-scope { font-size: 12px; color: #4b5563; }
.revoke-btn { padding: 8px 16px; border: 1px solid #fecaca; background: #fff; color: #ef4444; border-radius: 8px; font-size: 12px; cursor: pointer; }
.revoke-btn:hover { background: #fef2f2; }
.revoke-disabled { color: #d1d5db; }
.empty-inline { text-align: center; padding: 40px; color: #9ca3af; font-size: 13px; }

.upload-box { display: flex; gap: 10px; margin-bottom: 16px; }
.upload-box .form-input { flex: 1; }

.resume-list { display: flex; flex-direction: column; gap: 12px; }
.resume-card { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f9fafb; border-radius: 12px; border: 1px solid #f3f4f6; }
.rc-main { flex: 1; }
.rc-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.rc-icon { font-size: 20px; }
.rc-name { font-size: 14px; font-weight: 600; color: #1f2937; }
.rc-default { padding: 2px 8px; background: #d1fae5; color: #059669; border-radius: 4px; font-size: 11px; font-weight: 600; }
.rc-meta { display: flex; gap: 16px; font-size: 12px; color: #9ca3af; margin-bottom: 4px; }
.rc-parsed { display: flex; gap: 16px; font-size: 12px; color: #4b5563; }
.rc-actions { display: flex; flex-direction: column; gap: 6px; }
.rc-btn { padding: 6px 12px; border: 1px solid #e5e7eb; background: #fff; color: #6b7280; border-radius: 6px; font-size: 11px; cursor: pointer; }
.rc-btn.danger { color: #ef4444; border-color: #fecaca; }
.rc-btn:hover { background: #f9fafb; }

.cancel-flow { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
.cf-step { display: flex; gap: 14px; align-items: flex-start; opacity: .5; }
.cf-step.active, .cf-step.done { opacity: 1; }
.cf-num {
  width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; color: #6b7280;
  font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cf-step.active .cf-num { background: #7c3aed; color: #fff; }
.cf-step.done .cf-num { background: #10b981; color: #fff; }
.cf-title { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 4px; }
.cf-desc { font-size: 12px; color: #6b7280; line-height: 1.6; margin: 0; }
.cancel-agree { display: flex; gap: 10px; align-items: flex-start; padding: 16px; background: #fef2f2; border-radius: 10px; cursor: pointer; margin-bottom: 20px; }
.cancel-agree input { margin-top: 3px; width: 16px; height: 16px; accent-color: #ef4444; }
.cancel-agree span { font-size: 13px; color: #991b1b; line-height: 1.6; }
.cancel-btn { padding: 12px 28px; border: none; border-radius: 10px; background: #ef4444; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }
.cancel-btn:disabled { opacity: .4; cursor: not-allowed; background: #fca5a5; }
</style>
