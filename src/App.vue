<script setup>
import { darkTheme } from 'naive-ui'
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-dialog-provider>
          <n-notification-provider>
            <router-view />
          </n-notification-provider>
        </n-dialog-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script>
// Naive UI 主题定制
export default {
  data() {
    return {
      themeOverrides: {
        common: {
          primaryColor: '#5B8FF9',
          primaryColorHover: '#6C9BFA',
          primaryColorPressed: '#4A7FE8',
          borderRadius: '6px',
          fontFamily: "'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }
      }
    }
  }
}
</script>
