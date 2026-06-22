<template>
  <div class="sidebar-container">
    <div class="sidebar-header">
      <div class="sidebar-logo">🏠</div>
      <div v-show="!uiStore.sidebarCollapsed" class="sidebar-brand">
        <div class="sidebar-title">装修助手</div>
        <div class="sidebar-subtitle">系统学装修</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-label" v-show="!uiStore.sidebarCollapsed">主菜单</div>

      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <span class="nav-item-icon">{{ item.icon }}</span>
        <span v-show="!uiStore.sidebarCollapsed" class="nav-item-text">{{ item.label }}</span>
        <span
          v-if="item.badge && !uiStore.sidebarCollapsed"
          class="nav-item-badge"
        >{{ item.badge }}</span>
      </router-link>

      <div class="nav-section-label" v-show="!uiStore.sidebarCollapsed">工具</div>

      <button class="nav-item" @click="handleBackup">
        <span class="nav-item-icon">📤</span>
        <span v-show="!uiStore.sidebarCollapsed" class="nav-item-text">备份数据</span>
      </button>
      <button class="nav-item" @click="handleImport">
        <span class="nav-item-icon">📥</span>
        <span v-show="!uiStore.sidebarCollapsed" class="nav-item-text">导入数据</span>
      </button>
      <button class="nav-item" @click="handleClear">
        <span class="nav-item-icon">🧹</span>
        <span v-show="!uiStore.sidebarCollapsed" class="nav-item-text">清除数据</span>
      </button>
    </nav>

    <div class="sidebar-footer" v-show="!uiStore.sidebarCollapsed">
      <div class="sidebar-local-data">🔒 数据仅保存在当前浏览器</div>
      <div class="sidebar-version">v1.0</div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/uiStore'
import { useBackup } from '@/composables/useBackup'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const backup = useBackup()

const menuItems = [
  { path: '/', label: '仪表盘', icon: '📊' },
  { path: '/workflow', label: '装修流程', icon: '📖', badge: '学习' },
  { path: '/budget', label: '预算管理', icon: '💰' },
  { path: '/materials', label: '材料清单', icon: '📦' },
  { path: '/workers', label: '工人管理', icon: '👷' },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function handleBackup() {
  try {
    backup.exportData()
    uiStore.showToast('数据备份成功！JSON文件已下载', 'success')
  } catch (e) {
    uiStore.showToast('备份失败：' + e.message, 'error')
  }
}

function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await backup.importData(file)
      uiStore.showToast(`导入成功！恢复了 ${result.importedKeys.length} 项数据。请刷新页面`, 'success')
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      uiStore.showToast('导入失败：' + err.message, 'error')
    }
  }
  input.click()
}

function handleClear() {
  if (!backup.hasUserData()) {
    uiStore.showToast('没有需要清除的数据', 'info')
    return
  }
  if (confirm('确定要清除全部数据吗？\n建议先点击"备份数据"导出备份。\n此操作不可撤销！')) {
    if (confirm('再次确认：清除所有本地数据？')) {
      backup.clearAllData()
      uiStore.showToast('数据已清除。请刷新页面', 'success')
      setTimeout(() => window.location.reload(), 1500)
    }
  }
}
</script>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
}

.sidebar-logo {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.sidebar-subtitle {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-section-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-sm) var(--space-md);
  margin-top: var(--space-sm);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-warm-soft);
  color: var(--accent-warm);
  font-weight: 600;
}

.nav-item-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.nav-item-badge {
  margin-left: auto;
  font-size: var(--font-size-xs);
  background: var(--accent-amber-soft);
  color: var(--accent-amber);
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

.sidebar-footer {
  padding: var(--space-md);
  border-top: 1px solid var(--border-color);
}

.sidebar-local-data {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  line-height: 1.4;
}

.sidebar-version {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: var(--space-xs);
  opacity: 0.5;
}
</style>
