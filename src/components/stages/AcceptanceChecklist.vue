<template>
  <div class="acceptance-checklist">
    <div class="checklist-header">
      <h3>{{ title }}</h3>
      <span class="checklist-progress">{{ doneCount }}/{{ items.length }}</span>
    </div>
    <div class="acceptance-items">
      <label
        v-for="item in items"
        :key="item.id"
        class="acceptance-item"
        :class="{ done: progressStore.isAcceptanceDone(item.id) }"
      >
        <input
          type="checkbox"
          :checked="progressStore.isAcceptanceDone(item.id)"
          @change="progressStore.toggleAcceptance(item.id)"
        />
        <span class="acceptance-text">{{ item.text }}</span>
        <span v-if="progressStore.isAcceptanceDone(item.id)" class="done-mark">✅</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progressStore'

const props = defineProps({
  items: { type: Array, default: () => [] },
  title: { type: String, default: '验收清单' },
})

const progressStore = useProgressStore()

const doneCount = computed(() =>
  props.items.filter(i => progressStore.isAcceptanceDone(i.id)).length
)
</script>

<style scoped>
.checklist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.checklist-header h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.checklist-progress {
  font-size: var(--font-size-xs);
  color: var(--accent-green);
  font-weight: 600;
}

.acceptance-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.acceptance-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.acceptance-item:hover {
  background: var(--bg-hover);
}

.acceptance-item.done .acceptance-text {
  text-decoration: line-through;
  color: var(--text-muted);
}

.acceptance-item input[type="checkbox"] {
  accent-color: var(--accent-green);
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.acceptance-text {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.5;
}

.done-mark {
  font-size: 0.9rem;
}
</style>
