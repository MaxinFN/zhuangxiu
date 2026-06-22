<template>
  <div class="toast-container" v-if="uiStore.toasts.length">
    <div
      v-for="toast in uiStore.toasts"
      :key="toast.id"
      class="toast"
      :class="toast.type"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/uiStore'
const uiStore = useUiStore()
</script>
