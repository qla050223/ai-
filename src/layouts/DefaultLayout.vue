<script setup>
import { computed, ref, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NIcon } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { organization } from '@/mock/data'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const collapsed = ref(false)

const menuOptions = [
  {
    label: '数据看板',
    key: '/dashboard',
    icon: () => h(NIcon, null, { default: () => '📊' })
  },
  {
    label: '岗位与候选人',
    key: 'group-candidate',
    type: 'group',
    children: [
      { label: '岗位 JD 管理', key: '/position', icon: () => h(NIcon, null, { default: () => '💼' }) },
      { label: '候选人档案', key: '/candidate', icon: () => h(NIcon, null, { default: () => '👥' }) }
    ]
  },
  {
    label: '面试管理',
    key: '/interview',
    icon: () => h(NIcon, null, { default: () => '🎯' })
  },
  {
    label: '题库中心',
    key: '/question',
    icon: () => h(NIcon, null, { default: () => '📚' })
  },
  {
    label: '评估报告',
    key: '/report',
    icon: () => h(NIcon, null, { default: () => '📋' })
  },
  {
    label: '组织与成员',
    key: 'group-org',
    type: 'group',
    children: [
      { label: '成员管理', key: '/member', icon: () => h(NIcon, null, { default: () => '⚙️' }) }
    ]
  }
]

const activeKey = computed(() => {
  const p = route.path
  if (p.startsWith('/position')) return '/position'
  if (p.startsWith('/candidate')) return '/candidate'
  if (p.startsWith('/interview')) return '/interview'
  if (p.startsWith('/question')) return '/question'
  if (p.startsWith('/report')) return '/report'
  if (p.startsWith('/member')) return '/member'
  return p
})

const breadcrumb = computed(() => {
  const items = [{ title: 'AI 智能面试平台' }]
  if (route.meta.title) items.push({ title: route.meta.title })
  return items
})

const userMenuOptions = [
  { label: '个人中心', key: 'profile' },
  { label: '账户设置', key: 'settings' },
  { type: 'divider', key: 'd1' },
  { label: '退出登录', key: 'logout' }
]

function handleSelect(key) { router.push(key) }
function onUserMenu(key) {
  if (key === 'logout') {
    auth.logout()
    router.push('/login')
  }
}
</script>

<template>
  <n-layout has-sider style="height: 100vh">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="230"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
      :native-scrollbar="false"
      style="background: #001428"
    >
      <div class="logo" :class="{ collapsed }">
        <span class="logo-icon">🎯</span>
        <span v-if="!collapsed" class="logo-text">AI Interview Pro</span>
      </div>
      <n-menu
        :value="activeKey"
        :options="menuOptions"
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="18"
        :indent="20"
        @update:value="handleSelect"
        :inverted="true"
      />
      <div v-if="!collapsed" class="org-info">
        <n-ellipsis style="color: #ffffffa0; font-size: 12px">{{ organization.name }}</n-ellipsis>
        <n-tag size="tiny" :bordered="false" type="info" style="margin-top: 4px">{{ organization.plan }}</n-tag>
      </div>
    </n-layout-sider>

    <n-layout>
      <n-layout-header bordered style="height: 56px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; background: #fff">
        <n-breadcrumb>
          <n-breadcrumb-item v-for="item in breadcrumb" :key="item.title">{{ item.title }}</n-breadcrumb-item>
        </n-breadcrumb>
        <n-space :size="16" align="center">
          <n-badge :value="3" :max="9">
            <span style="font-size: 18px">🔔</span>
          </n-badge>
          <n-dropdown :options="userMenuOptions" @select="onUserMenu">
            <n-space :size="8" align="center" style="cursor: pointer">
              <n-avatar round size="small" :src="auth.user?.avatar" color="#5B8FF9">{{ auth.displayName?.[0] }}</n-avatar>
              <div style="display: flex; flex-direction: column; line-height: 1.2">
                <span style="font-size: 13px; font-weight: 500">{{ auth.displayName }}</span>
                <span style="font-size: 11px; color: #86909c">{{ auth.roleText }}</span>
              </div>
            </n-space>
          </n-dropdown>
        </n-space>
      </n-layout-header>

      <n-layout-content content-style="background: #f5f7fa">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped>
.logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  color: #fff;
  border-bottom: 1px solid #ffffff15;
}
.logo.collapsed { justify-content: center; padding: 0; }
.logo-icon { font-size: 24px; }
.logo-text { font-size: 15px; font-weight: 600; margin-left: 10px; white-space: nowrap; }
.org-info { position: absolute; bottom: 16px; left: 16px; right: 16px; }
:deep(.n-layout-sider-scroll-container) { position: relative; }
:deep(.n-menu .n-menu-item-content) { color: #ffffffc0; }
:deep(.n-menu .n-menu-item-content--selected) { color: #fff; }
.fade-enter-active, .fade-leave-active { transition: opacity .15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
