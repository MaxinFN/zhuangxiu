import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadJSON, generateId } from '@/utils/storage'

const STORAGE_KEY_BUDGET = 'reno_budget_v2'
const STORAGE_KEY_HOUSE = 'reno_house_info'

export const useBudgetStore = defineStore('budget', () => {
  const items = ref(loadJSON(STORAGE_KEY_BUDGET, []))

  const houseInfo = ref(loadJSON(STORAGE_KEY_HOUSE, {
    area: null,
    totalBudget: null,
  }))

  // 7个一级分类
  const categories = [
    { key: 'demolition', label: '①拆改/设计', color: '#C67B5C' },
    { key: 'hardwork', label: '②硬装施工', color: '#7D9B76' },
    { key: 'doors', label: '③门窗设备', color: '#8B7355' },
    { key: 'custom', label: '④定制柜', color: '#B8956A' },
    { key: 'sanitary', label: '⑤厨卫五金', color: '#E8A849' },
    { key: 'lighting', label: '⑥灯具家电', color: '#D9756A' },
    { key: 'soft', label: '⑦软装家具', color: '#A0C4A8' },
  ]

  // 计算属性
  const totalBudget = computed(() =>
    items.value.reduce((sum, item) => sum + (parseFloat(item.budget) || 0), 0)
  )

  const totalActual = computed(() =>
    items.value.reduce((sum, item) => sum + (parseFloat(item.actual) || 0), 0)
  )

  const remaining = computed(() => totalBudget.value - totalActual.value)

  const categoryStats = computed(() => {
    const stats = {}
    categories.forEach(c => {
      const catItems = items.value.filter(i => i.cat === c.key)
      stats[c.key] = {
        label: c.label,
        color: c.color,
        budget: catItems.reduce((s, i) => s + (parseFloat(i.budget) || 0), 0),
        actual: catItems.reduce((s, i) => s + (parseFloat(i.actual) || 0), 0),
        count: catItems.length,
      }
    })
    return stats
  })

  // 操作
  function addItem(item) {
    const newItem = {
      id: generateId(),
      cat: item.cat || 'hardwork',
      room: item.room || '',
      name: item.name || '',
      brand: item.brand || '',
      unit: item.unit || '',
      quantity: parseFloat(item.quantity) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0,
      budget: parseFloat(item.budget) || 0,
      actual: parseFloat(item.actual) || 0,
      priority: item.priority || 'must',
      craft: item.craft || '',
      note: item.note || '',
    }
    items.value.push(newItem)
    save()
    return newItem
  }

  function updateItem(id, updates) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx === -1) return null
    items.value[idx] = { ...items.value[idx], ...updates }
    save()
    return items.value[idx]
  }

  function removeItem(id) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx === -1) return
    items.value.splice(idx, 1)
    save()
  }

  function updateHouseInfo(info) {
    houseInfo.value = { ...houseInfo.value, ...info }
    localStorage.setItem(STORAGE_KEY_HOUSE, JSON.stringify(houseInfo.value))
  }

  function save() {
    localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(items.value))
  }

  // 导入导出
  function exportItems() {
    return JSON.parse(JSON.stringify(items.value))
  }

  function importItems(data) {
    items.value = data.map(item => ({
      ...item,
      id: item.id || generateId(),
    }))
    save()
  }

  return {
    items,
    houseInfo,
    categories,
    totalBudget,
    totalActual,
    remaining,
    categoryStats,
    addItem,
    updateItem,
    removeItem,
    updateHouseInfo,
    exportItems,
    importItems,
  }
})
