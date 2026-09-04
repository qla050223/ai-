<script setup>
import { computed } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
import { useCandidateAuthStore } from '@/stores/candidate'

const router = useRouter()
const route = useRoute()
const auth = useCandidateAuthStore()

const navItems = [
  { path: '/c/mock', label: '模拟面试', icon: '🎯' },
  { path: '/c/my', label: '我的面试', icon: '📋' },
  { path: '/c/ability', label: '能力档案', icon: '📊' },
  { path: '/c/settings', label: '设置', icon: '⚙️' }
]

const activePath = computed(() => {
  const p = route.path
  return navItems.find(n => p.startsWith(n.path))?.path || '/c/mock'
})

function go(path) {
  router.push(path)
}

function logout() {
  auth.logout()
  router.push('/c/login')
}
</script>

<template>
  <div class="c-layout">
    <header class="c-header">
      <div class="c-header-inner">
        <div class="c-brand" @click="go('/c/mock')">
          <span class="c-brand-mark">AI</span>
          <span class="c-brand-text">面试助手 · 候选人端</span>
        </div>
        <nav class="c-nav">
          <button
            v-for="item in navItems"
            :key="item.path"
            class="c-nav-item"
            :class="{ active: activePath === item.path }"
            @click="go(item.path)"
          >
            <span class="c-nav-icon">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </nav>
        <div class="c-user">
          <div class="c-user-avatar">
            {{ auth.user?.name?.charAt(0) || 'U' }}
          </div>
          <div class="c-user-info">
            <div class="c-user-name">{{ auth.displayName }}</div>
            <div class="c-user-role">求职者</div>
          </div>
          <button class="c-logout-btn" title="退出登录" @click="logout">退出</button>
        </div>
      </div>
    </header>
    <main class="c-main">
      <RouterView />
    </main>
    <footer class="c-footer">
      <span>© 2026 AI 面试助手 · 候选人端 V1.0</span>
      <span class="c-footer-tip">数据为演示 Mock，AI 对话由前端模拟</span>
    </footer>
  </div>
</template>

<style scoped>
.c-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f8fb;
}
.c-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1px solid #ebedf0;
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
}
.c-header-inner {
  max-width: 1280px;
  margin: 0 auto;
  height: 64px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 48px;
}
.c-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}
.c-brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6d28d9, #4f46e5);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 1px;
}
.c-brand-text {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
}
.c-nav {
  display: flex;
  gap: 4px;
  flex: 1;
}
.c-nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all .2s;
}
.c-nav-item:hover {
  background: #f3f4f6;
  color: #1f2937;
}
.c-nav-item.active {
  background: #eef2ff;
  color: #4f46e5;
}
.c-nav-icon { font-size: 15px; }
.c-user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.c-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.c-user-info { line-height: 1.3; }
.c-user-name { font-size: 13px; font-weight: 600; color: #1f2937; }
.c-user-role { font-size: 12px; color: #9ca3af; }
.c-logout-btn {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all .2s;
}
.c-logout-btn:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
.c-main {
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 32px;
  box-sizing: border-box;
}
.c-footer {
  border-top: 1px solid #ebedf0;
  background: #fff;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #9ca3af;
}
</style>
