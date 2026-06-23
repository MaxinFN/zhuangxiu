<template>
  <div v-if="uiStore.toasts.length" class="toast-container" role="status" aria-live="polite">
    <div
      v-for="toast in uiStore.toasts"
      :key="toast.id"
      class="toast"
      :class="toast.type"
      role="alert"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/uiStore'
const uiStore = useUiStore()
</script>
