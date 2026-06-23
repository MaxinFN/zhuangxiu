<template>
  <TransitionGroup
    v-if="uiStore.toasts.length"
    tag="div"
    class="toast-container"
    role="status"
    aria-live="polite"
    name="toast-list"
  >
    <div
      v-for="toast in uiStore.toasts"
      :key="toast.id"
      class="toast"
      :class="toast.type"
      role="alert"
    >
      {{ toast.message }}
    </div>
  </TransitionGroup>
</template>

<script setup>
import { useUiStore } from '@/stores/uiStore'
const uiStore = useUiStore()
</script>
