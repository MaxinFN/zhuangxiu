<template>
  <div class="checklist" :class="`checklist--${mode}`">
    <div class="checklist-header">
      <h3>{{ title }}</h3>
      <span class="checklist-progress">{{ doneCount }}/{{ items.length }}</span>
    </div>
    <div class="checklist-items">
      <label
        v-for="item in items"
        :key="item.id"
        class="checklist-item"
        :class="{ done: isDone(item.id), flashing: flashingIds.has(item.id) }"
      >
        <input
          type="checkbox"
          :checked="isDone(item.id)"
          @change="toggle(item.id)"
        />
        <span class="checklist-text">{{ item.text }}</span>
        <span v-if="mode === 'acceptance' && isDone(item.id)" class="done-mark">✅</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useProgressStore } from '@/stores/progressStore'

const props = defineProps({
  items: { type: Array, default: () => [] },
  title: { type: String, default: '任务清单' },
  mode: {
    type: String,
    default: 'task',
    validator: v => ['task', 'acceptance'].includes(v),
  },
})

const progressStore = useProgressStore()
const flashingIds = ref(new Set())

const isDone = id =>
  props.mode === 'acceptance'
    ? progressStore.isAcceptanceDone(id)
    : progressStore.isTaskDone(id)

const toggle = id => {
  props.mode === 'acceptance'
    ? progressStore.toggleAcceptance(id)
    : progressStore.toggleTask(id)

  // 触发闪烁动画
  flashingIds.value = new Set([...flashingIds.value, id])
  setTimeout(() => {
    const next = new Set(flashingIds.value)
    next.delete(id)
    flashingIds.value = next
  }, 400)
}

const doneCount = computed(() =>
  props.items.filter(i => isDone(i.id)).length,
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

.checklist--task .checklist-progress {
  color: var(--accent-warm);
}

.checklist--acceptance .checklist-progress {
  color: var(--accent-green);
}

.checklist-progress {
  font-size: var(--font-size-xs);
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
  text-decoration-color: var(--text-muted);
  text-decoration-thickness: 1px;
  transition: color var(--transition-normal);
}

/* 勾选闪烁 */
.checklist-item.flashing {
  animation: check-flash 400ms ease;
  border-radius: var(--radius-sm);
}

/* 完成标记弹入 */
.checklist-item .done-mark {
  animation: scale-in 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.checklist-item input[type='checkbox'] {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.checklist--task .checklist-item input[type='checkbox'] {
  accent-color: var(--accent-warm);
}

.checklist--acceptance .checklist-item input[type='checkbox'] {
  accent-color: var(--accent-green);
}

.checklist-text {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.5;
}

.done-mark {
  font-size: 0.9rem;
}
</style>
