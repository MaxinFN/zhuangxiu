<template>
  <header class="header">
    <div class="header-left">
      <button class="mobile-menu-btn" @click="uiStore.toggleSidebar" title="菜单">
        <span>☰</span>
      </button>
      <div class="header-title">
        <!-- 面包屑导航 -->
        <nav v-if="uiStore.breadcrumb.length" class="header-breadcrumb">
          <template v-for="(item, idx) in uiStore.breadcrumb" :key="idx">
            <span v-if="idx > 0" class="header-breadcrumb-sep">›</span>
            <router-link
              v-if="item.to"
              :to="item.to"
              class="header-breadcrumb-link"
            >{{ item.icon }} {{ item.label }}</router-link>
            <span v-else class="header-breadcrumb-current">{{ item.icon }} {{ item.label }}</span>
          </template>
        </nav>
        <h1>{{ pageTitle }}</h1>
        <p>{{ pageSubtitle }}</p>
      </div>
    </div>
    <div class="header-actions">
      <slot />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/stores/uiStore'

const route = useRoute()
const uiStore = useUiStore()

const pageTitle = computed(() => {
  const meta = route.meta
  return meta.icon ? `${meta.icon} ${meta.title}` : meta.title
})

const pageSubtitle = computed(() => {
  const map = {
    dashboard: '装修进度一览',
    workflow: '按阶段系统学习装修知识',
    budget: '精细化预算管理与支出追踪',
    materials: '各阶段材料清单与选购指南',
    workers: '工人比价与沟通记录管理',
  }
  return map[route.name] || ''
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--space-lg);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.mobile-menu-btn {
  display: none;
  font-size: 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  padding: var(--space-xs);
}

/* 面包屑 */
.header-breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: 2px;
  font-size: var(--font-size-xs);
}

.header-breadcrumb-link {
  color: var(--accent-warm);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.header-breadcrumb-link:hover {
  color: var(--accent-wood);
  text-decoration: underline;
}

.header-breadcrumb-current {
  color: var(--text-primary);
  font-weight: 500;
}

.header-breadcrumb-sep {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.header-title h1 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.header-title p {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin: 2px 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }
  .header-title h1 {
    font-size: var(--font-size-lg);
  }
}
</style>
