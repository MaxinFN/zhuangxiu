import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useContentStore = defineStore('content', () => {
  // 所有阶段元数据
  const stages = ref([
    { id: 'preparation', name: '前期准备', icon: '📋', order: 1, duration: '2-4周' },
    { id: 'demolition', name: '拆改与墙体新建', icon: '🔨', order: 2, duration: '1-3周' },
    { id: 'plumbing-electric', name: '水电改造', icon: '⚡', order: 3, duration: '1-3周' },
    { id: 'tiling', name: '瓦工贴砖', icon: '🧱', order: 4, duration: '2-4周' },
    { id: 'woodwork', name: '木工吊顶/柜体', icon: '🪚', order: 5, duration: '1-3周' },
    { id: 'painting', name: '油漆/墙面', icon: '🎨', order: 6, duration: '2-4周' },
    { id: 'installation', name: '安装阶段', icon: '🔧', order: 7, duration: '2-3周' },
    { id: 'soft-furnishing', name: '软装进场', icon: '🛋️', order: 8, duration: '2-4周' },
    { id: 'completion', name: '竣工验收', icon: '✅', order: 9, duration: '1-2周' },
  ])

  // contentFiles: { 'preparation': { index: 'raw md', materials: 'raw md', ... } }
  const contentFiles = ref({})

  // 阅读进度 { preparation: { materials: true, craft: true } }
  const readingProgress = ref(loadReadingProgress())

  const stageList = computed(() =>
    stages.value.sort((a, b) => a.order - b.order)
  )

  function setContent(stageId, files) {
    contentFiles.value[stageId] = files
  }

  function getContent(stageId) {
    return contentFiles.value[stageId] || {}
  }

  function markRead(stageId, contentType) {
    if (!readingProgress.value[stageId]) {
      readingProgress.value[stageId] = {}
    }
    readingProgress.value[stageId][contentType] = true
    saveReadingProgress()
  }

  function isRead(stageId, contentType) {
    return readingProgress.value[stageId]?.[contentType] || false
  }

  function getStageReadCount(stageId) {
    const types = ['materials', 'craft', 'acceptance', 'pitfalls']
    return types.filter(t => isRead(stageId, t)).length
  }

  function loadReadingProgress() {
    try {
      const raw = localStorage.getItem('reno_reading_progress')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  function saveReadingProgress() {
    localStorage.setItem('reno_reading_progress', JSON.stringify(readingProgress.value))
  }

  return {
    stages,
    stageList,
    contentFiles,
    readingProgress,
    setContent,
    getContent,
    markRead,
    isRead,
    getStageReadCount,
  }
})
