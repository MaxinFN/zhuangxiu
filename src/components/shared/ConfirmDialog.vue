<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="confirm-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      @click.self="onCancel"
      @keydown.escape="onCancel"
    >
      <div class="confirm-box">
        <div class="confirm-header">
          <span class="confirm-icon" aria-hidden="true">{{ icon }}</span>
          <strong>{{ title }}</strong>
        </div>
        <p class="confirm-message">{{ message }}</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary btn-sm" ref="cancelBtn" @click="onCancel">
            {{ cancelText }}
          </button>
          <button
            class="btn btn-sm"
            :class="confirmClass"
            ref="confirmBtn"
            @click="onConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  visible: Boolean,
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '确定要执行此操作吗？' },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
  type: {
    type: String,
    default: 'warning',
    validator: v => ['warning', 'danger', 'info'].includes(v),
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const confirmBtn = ref(null)
const cancelBtn = ref(null)

const icon = { warning: '⚠️', danger: '🗑️', info: 'ℹ️' }[props.type] || '⚠️'
const confirmClass = {
  warning: 'btn-primary',
  danger: 'btn-danger',
  info: 'btn-primary',
}[props.type]

function onConfirm() {
  emit('confirm')
}

function onCancel() {
  emit('cancel')
}

// 打开时自动聚焦取消按钮（安全的默认行为）
watch(
  () => props.visible,
  async v => {
    if (v) {
      await nextTick()
      cancelBtn.value?.focus()
    }
  },
)
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn var(--transition-fast) ease;
}

.confirm-box {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  max-width: 400px;
  width: 90%;
  box-shadow: var(--shadow-card);
  animation: slideUp var(--transition-fast) ease;
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.confirm-icon {
  font-size: 1.25rem;
}

.confirm-message {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  margin-bottom: var(--space-lg);
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
