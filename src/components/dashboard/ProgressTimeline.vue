<template>
  <div class="progress-mini">
    <h3 class="section-title">📋 装修进度</h3>
    <div class="mini-timeline">
      <div
        v-for="(stage, idx) in contentStore.stageList"
        :key="stage.id"
        class="mini-item"
        :class="{
          completed: progressStore.getStageStatus(stage.id) === 'completed',
          active: progressStore.getStageStatus(stage.id) === 'in-progress',
        }"
      >
        <div class="mini-dot">
          <span v-if="progressStore.getStageStatus(stage.id) === 'completed'">✓</span>
          <span v-else-if="progressStore.getStageStatus(stage.id) === 'in-progress'">{{ stage.icon }}</span>
          <span v-else>{{ idx + 1 }}</span>
        </div>
        <div class="mini-name">{{ stage.name }}</div>
        <div
          v-if="idx < contentStore.stageList.length - 1" class="mini-line"
          :class="{ filled: progressStore.getStageStatus(stage.id) === 'completed' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useContentStore } from '@/stores/contentStore'
import { useProgressStore } from '@/stores/progressStore'

const contentStore = useContentStore()
const progressStore = useProgressStore()
</script>

<style scoped>
.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--space-md);
  color: var(--text-primary);
}

.mini-timeline {
  display: flex;
  align-items: flex-start;
  overflow-x: auto;
  padding: var(--space-sm) 0;
  gap: 0;
}

.mini-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 80px;
  position: relative;
}

.mini-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  margin-bottom: var(--space-xs);
  z-index: 1;
  transition: all var(--transition-normal);
}

.mini-item.completed .mini-dot {
  background: var(--accent-green-soft);
  border-color: var(--accent-green);
  color: var(--accent-green);
}

.mini-item.active .mini-dot {
  background: var(--accent-warm-soft);
  border-color: var(--accent-warm);
}

.mini-name {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-align: center;
  line-height: 1.3;
  max-width: 80px;
}

.mini-item.completed .mini-name,
.mini-item.active .mini-name {
  color: var(--text-primary);
  font-weight: 500;
}

.mini-line {
  position: absolute;
  top: 16px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-color);
  z-index: 0;
}

.mini-line.filled {
  background: var(--accent-green);
}
</style>
