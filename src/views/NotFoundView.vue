<template>
  <div class="not-found">
    <div class="not-found-card">
      <span class="not-found-icon" aria-hidden="true">🏗️</span>
      <h1>页面未找到</h1>
      <p class="not-found-desc">这个页面可能还在装修中，或者地址输入有误。</p>
      <div class="not-found-actions">
        <router-link to="/" class="btn btn-primary">返回首页</router-link>
        <router-link to="/workflow" class="btn btn-secondary">查看装修流程</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// 404 兜底页面 — 无额外逻辑
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: var(--space-2xl);
}

.not-found-card {
  text-align: center;
  max-width: 420px;
}

.not-found-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: var(--space-lg);
}

.not-found h1 {
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.not-found-desc {
  color: var(--text-muted);
  margin-bottom: var(--space-xl);
  line-height: 1.6;
}

.not-found-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}
</style>
