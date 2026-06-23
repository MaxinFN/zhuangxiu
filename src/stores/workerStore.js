import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadJSON, generateId } from '@/utils/storage'

const STORAGE_KEY_WORKERS = 'reno_workers'
const STORAGE_KEY_CALLS = 'reno_call_records'

export const useWorkerStore = defineStore('worker', () => {
  const workers = ref(loadJSON(STORAGE_KEY_WORKERS, []))
  const callRecords = ref(loadJSON(STORAGE_KEY_CALLS, []))

  // 工种列表
  const workerTypes = [
    { key: 'demolition', name: '拆改工', icon: '🔨' },
    { key: 'plumber', name: '水电工', icon: '⚡' },
    { key: 'tiler', name: '瓦工', icon: '🧱' },
    { key: 'carpenter', name: '木工', icon: '🪚' },
    { key: 'painter', name: '油漆工', icon: '🎨' },
    { key: 'installer', name: '安装工', icon: '🔧' },
    { key: 'designer', name: '设计师', icon: '📐' },
    { key: 'other', name: '其他', icon: '👷' },
  ]

  // 按工种分组
  const workersByType = computed(() => {
    const grouped = {}
    workerTypes.forEach(t => {
      grouped[t.key] = {
        ...t,
        workers: workers.value.filter(w => w.type === t.key),
      }
    })
    return grouped
  })

  const totalWorkers = computed(() => workers.value.length)

  // Worker CRUD
  function addWorker(worker) {
    const newWorker = {
      id: generateId(),
      type: worker.type || 'other',
      name: worker.name || '',
      phone: worker.phone || '',
      source: worker.source || '',
      quote: parseFloat(worker.quote) || 0,
      notes: worker.notes || '',
      rating: parseInt(worker.rating) || 0,
      createdAt: new Date().toISOString(),
    }
    workers.value.push(newWorker)
    save()
    return newWorker
  }

  function updateWorker(id, updates) {
    const idx = workers.value.findIndex(w => w.id === id)
    if (idx === -1) return null
    workers.value[idx] = { ...workers.value[idx], ...updates }
    save()
    return workers.value[idx]
  }

  function removeWorker(id) {
    const idx = workers.value.findIndex(w => w.id === id)
    if (idx === -1) return
    workers.value.splice(idx, 1)
    // 同时删除相关通话记录
    callRecords.value = callRecords.value.filter(c => c.workerId !== id)
    save()
  }

  function getWorkersByType(type) {
    return workers.value.filter(w => w.type === type)
  }

  // Call records CRUD
  function addCallRecord(record) {
    const newRecord = {
      id: generateId(),
      workerId: record.workerId || '',
      date: record.date || new Date().toISOString().slice(0, 10),
      content: record.content || '',
      quote: parseFloat(record.quote) || 0,
      conditions: record.conditions || '',
      attitude: parseInt(record.attitude) || 0,
    }
    callRecords.value.push(newRecord)
    save()
    return newRecord
  }

  function getCallRecords(workerId) {
    return callRecords.value.filter(c => c.workerId === workerId)
  }

  function save() {
    localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(workers.value))
    localStorage.setItem(STORAGE_KEY_CALLS, JSON.stringify(callRecords.value))
  }

  return {
    workers,
    callRecords,
    workerTypes,
    workersByType,
    totalWorkers,
    addWorker,
    updateWorker,
    removeWorker,
    getWorkersByType,
    addCallRecord,
    getCallRecords,
  }
})
