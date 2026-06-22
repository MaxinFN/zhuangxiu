<template>
  <div class="task-checklist">
    <div class="checklist-header">
      <h3>{{ title }}</h3>
      <span class="checklist-progress">{{ doneCount }}/{{ tasks.length }}</span>
    </div>
    <div class="checklist-items">
      <label
        v-for="task in tasks"
        :key="task.id"
        class="checklist-item"
        :class="{ done: progressStore.isTaskDone(task.id) }"
      >
        <input
          type="checkbox"
          :checked="progressStore.isTaskDone(task.id)"
          @change="progressStore.toggleTask(task.id)"
        />
        <span class="checklist-text">{{ task.text }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progressStore'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  title: { type: String, default: '任务清单' },
})

const progressStore = useProgressStore()

const doneCount = computed(() =>
  props.tasks.filter(t => progressStore.isTaskDone(t.id)).length
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
  color: var(--accent-warm);
  font-weight: 600;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.checklist-item:hover {
  background: var(--bg-hover);
}

.checklist-item.done .checklist-text {
  text-decoration: line-through;
  color: var(--text-muted);
}

.checklist-item input[type="checkbox"] {
  accent-color: var(--accent-warm);
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.checklist-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.5;
}
</style>
