import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const toasts = ref([])
  const activeModal = ref(null)
  const breadcrumb = ref([])  // [{ label, icon?, to? }]

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setBreadcrumb(items) {
    breadcrumb.value = items
  }

  function showToast(message, type = 'info', duration = 3000) {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 4)
    toasts.value.push({ id, message, type })
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }

  function removeToast(id) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx > -1) toasts.value.splice(idx, 1)
  }

  function openModal(name) {
    activeModal.value = name
  }

  function closeModal() {
    activeModal.value = null
  }

  return {
    sidebarCollapsed,
    toasts,
    activeModal,
    breadcrumb,
    toggleSidebar,
    setBreadcrumb,
    showToast,
    removeToast,
    openModal,
    closeModal,
  }
})
