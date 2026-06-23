<template>
  <div class="app-container">
    <aside class="sidebar" :class="{ collapsed: uiStore.sidebarCollapsed }">
      <AppSidebar />
    </aside>
    <main class="main-content">
      <AppHeader />
      <div class="page-content">
        <router-view v-slot="{ Component, route }">
          <transition
            :name="route.meta.transition || 'page-slide'"
            mode="out-in"
          >
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </div>
    </main>
    <ToastContainer />
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/uiStore'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ToastContainer from '@/components/shared/ToastContainer.vue'

const uiStore = useUiStore()
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
}

.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  height: 100vh;
  overflow: hidden;
  transition: width var(--transition-normal);
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-lg);
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* 路由过渡动画 */
.page-slide-enter-active {
  transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
}

.page-slide-leave-active {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
