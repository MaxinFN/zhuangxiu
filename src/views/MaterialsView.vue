<template>
  <div class="materials-view">
    <div class="materials-intro card anim-fade-in-up" style="margin-bottom: var(--space-lg);">
      <h2>📦 装修材料清单</h2>
      <p class="intro-text">按装修阶段整理的完整材料清单，含推荐品牌和价格区间。勾选已采购项，跟踪材料准备进度。</p>
    </div>

    <div class="materials-grid">
      <div
        v-for="(stage, idx) in contentStore.stageList"
        :key="stage.id"
        class="material-stage-card card"
        :style="{ animationDelay: (idx * 60) + 'ms' }"
      >
        <div class="stage-card-header">
          <div>
            <h3>{{ stage.icon }} {{ stage.name }}</h3>
            <span class="stage-item-count">{{ getItemCount(stage.id) }} 项材料</span>
          </div>
          <div class="stage-progress-badge" :style="{ background: progressColor(stage.id) }">
            {{ materialStore.getStageProgress(stage.id) }}%
          </div>
        </div>

        <div v-if="getItemCount(stage.id)" class="material-items">
          <label
            v-for="item in materialStore.getMaterials(stage.id)"
            :key="item.id"
            class="material-item"
            :class="{ checked: materialStore.isChecked(item.id) }"
          >
            <input
              type="checkbox"
              :checked="materialStore.isChecked(item.id)"
              @change="materialStore.toggle(item.id)"
            />
            <span class="material-text">
              <span class="material-name">{{ item.text }}</span>
              <span class="material-price">{{ item.price }}</span>
            </span>
            <span v-if="item.note" class="material-note">{{ item.note }}</span>
          </label>
        </div>
        <div v-else class="empty-hint">暂无材料清单</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useContentStore } from '@/stores/contentStore'
import { useMaterialStore } from '@/stores/materialStore'

const contentStore = useContentStore()
const materialStore = useMaterialStore()

function getItemCount(stageId) {
  return materialStore.getMaterials(stageId).length
}

function progressColor(stageId) {
  const p = materialStore.getStageProgress(stageId)
  if (p >= 80) return 'var(--accent-green)'
  if (p >= 40) return 'var(--accent-amber)'
  return 'var(--text-muted)'
}
</script>

<style scoped>
.intro-text {
  color: var(--text-secondary);
  margin-top: var(--space-sm);
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

.material-stage-card {
  animation: fade-in-up 350ms cubic-bezier(0.4, 0, 0.2, 1) both;
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.material-stage-card:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-hover);
}

.stage-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-md);
}

.stage-card-header h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
}

.stage-item-count {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.stage-progress-badge {
  color: white;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.material-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.material-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-xs) 0;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  font-size: var(--font-size-sm);
}

.material-item:hover {
  background: var(--bg-hover);
}

.material-item.checked .material-name {
  text-decoration: line-through;
  color: var(--text-muted);
}

.material-item input[type="checkbox"] {
  accent-color: var(--accent-warm);
  margin-top: 3px;
  flex-shrink: 0;
}

.material-text {
  flex: 1;
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
}

.material-name {
  color: var(--text-primary);
  font-weight: 500;
}

.material-price {
  color: var(--accent-warm);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  font-weight: 500;
}

.material-note {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-top: 1px;
}

.empty-hint {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
  padding: var(--space-md);
}

@media (max-width: 1200px) {
  .materials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .materials-grid {
    grid-template-columns: 1fr;
  }
}
</style>
