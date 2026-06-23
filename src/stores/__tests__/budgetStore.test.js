/**
 * budgetStore 单元测试
 *
 * 测试策略:
 * - 使用假 localStorage 隔离测试环境
 * - 每个测试前清空 store 状态
 * - 覆盖 CRUD / 计算属性 / 导入导出 / 房屋信息
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '../budgetStore'

// 假 localStorage
const store = {}
const mockLocalStorage = {
  getItem: vi.fn(key => store[key] ?? null),
  setItem: vi.fn((key, val) => { store[key] = val }),
  removeItem: vi.fn(key => { delete store[key] }),
}
vi.stubGlobal('localStorage', mockLocalStorage)

function resetStore() {
  Object.keys(store).forEach(k => delete store[k])
  setActivePinia(createPinia())
}

const makeItem = (overrides = {}) => ({
  cat: 'hardwork',
  room: '客厅',
  name: '地砖铺贴',
  brand: '马可波罗',
  unit: '㎡',
  quantity: 50,
  unitPrice: 120,
  budget: 6000,
  actual: 5800,
  priority: 'must',
  craft: '干铺法',
  note: '',
  ...overrides,
})

describe('budgetStore', () => {
  let budgetStore

  beforeEach(() => {
    resetStore()
    budgetStore = useBudgetStore()
  })

  describe('addItem', () => {
    it('应该添加预算项并持久化', () => {
      const item = budgetStore.addItem(makeItem())
      expect(budgetStore.items).toHaveLength(1)
      expect(item.id).toBeTruthy()
      expect(item.name).toBe('地砖铺贴')
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('应该为缺失字段使用默认值', () => {
      const item = budgetStore.addItem({ name: '测试项' })
      expect(item.cat).toBe('hardwork')
      expect(item.room).toBe('')
      expect(item.quantity).toBe(0)
      expect(item.budget).toBe(0)
      expect(item.priority).toBe('must')
    })
  })

  describe('updateItem', () => {
    it('应该更新已有项目', () => {
      const item = budgetStore.addItem(makeItem())
      budgetStore.updateItem(item.id, { name: '木地板', budget: 8000 })
      expect(budgetStore.items[0].name).toBe('木地板')
      expect(budgetStore.items[0].budget).toBe(8000)
    })

    it('不存在的 id 返回 null', () => {
      const result = budgetStore.updateItem('nonexistent', { name: 'x' })
      expect(result).toBeNull()
    })
  })

  describe('removeItem', () => {
    it('应该删除项目', () => {
      const item = budgetStore.addItem(makeItem())
      budgetStore.removeItem(item.id)
      expect(budgetStore.items).toHaveLength(0)
    })

    it('删除不存在的 id 无副作用', () => {
      budgetStore.addItem(makeItem())
      budgetStore.removeItem('nonexistent')
      expect(budgetStore.items).toHaveLength(1)
    })
  })

  describe('totalBudget / totalActual / remaining', () => {
    it('空列表时均为 0', () => {
      expect(budgetStore.totalBudget).toBe(0)
      expect(budgetStore.totalActual).toBe(0)
      expect(budgetStore.remaining).toBe(0)
    })

    it('正确累加多项', () => {
      budgetStore.addItem(makeItem({ budget: 1000, actual: 800 }))
      budgetStore.addItem(makeItem({ budget: 2000, actual: 1500 }))
      expect(budgetStore.totalBudget).toBe(3000)
      expect(budgetStore.totalActual).toBe(2300)
      expect(budgetStore.remaining).toBe(700)
    })
  })

  describe('categoryStats', () => {
    it('按分类分组统计', () => {
      budgetStore.addItem(makeItem({ cat: 'hardwork', budget: 5000, actual: 4000 }))
      budgetStore.addItem(makeItem({ cat: 'soft', budget: 3000, actual: 2000 }))
      budgetStore.addItem(makeItem({ cat: 'hardwork', budget: 1000, actual: 900 }))

      const stats = budgetStore.categoryStats
      expect(stats.hardwork.budget).toBe(6000)
      expect(stats.hardwork.actual).toBe(4900)
      expect(stats.hardwork.count).toBe(2)
      expect(stats.soft.budget).toBe(3000)
      expect(stats.soft.count).toBe(1)
      // 空分类
      expect(stats.lighting.count).toBe(0)
    })
  })

  describe('houseInfo', () => {
    it('默认值为 null', () => {
      expect(budgetStore.houseInfo.area).toBeNull()
      expect(budgetStore.houseInfo.totalBudget).toBeNull()
    })

    it('updateHouseInfo 可以部分更新', () => {
      budgetStore.updateHouseInfo({ area: 100 })
      expect(budgetStore.houseInfo.area).toBe(100)
      expect(budgetStore.houseInfo.totalBudget).toBeNull()

      budgetStore.updateHouseInfo({ totalBudget: 150000 })
      expect(budgetStore.houseInfo.area).toBe(100)
      expect(budgetStore.houseInfo.totalBudget).toBe(150000)
    })
  })

  describe('importItems', () => {
    it('批量导入替换所有项', () => {
      budgetStore.addItem(makeItem({ name: '旧项目' }))
      const data = [
        { name: '新项目A', cat: 'soft', budget: 1000 },
        { name: '新项目B', cat: 'doors', budget: 2000 },
      ]
      budgetStore.importItems(data)
      expect(budgetStore.items).toHaveLength(2)
      expect(budgetStore.items[0].name).toBe('新项目A')
      expect(budgetStore.totalBudget).toBe(3000)
    })

    it('导入时保留已有 id 或生成新 id', () => {
      const data = [
        { id: 'existing-id', name: '已有ID', budget: 1000 },
        { name: '自动ID', budget: 2000 },
      ]
      budgetStore.importItems(data)
      expect(budgetStore.items[0].id).toBe('existing-id')
      expect(budgetStore.items[1].id).toBeTruthy()
      expect(budgetStore.items[1].id).not.toBe('existing-id')
    })
  })

  describe('exportItems', () => {
    it('导出深拷贝', () => {
      budgetStore.addItem(makeItem({ name: 'A' }))
      const exported = budgetStore.exportItems()
      exported[0].name = 'B'
      expect(budgetStore.items[0].name).toBe('A') // 原数据不变
    })
  })

  describe('从 localStorage 恢复', () => {
    it('应从 localStorage 加载已有数据', () => {
      // 先 resetStore 清空内存，再写入假数据，最后创建 store
      resetStore()
      const existing = [makeItem({ name: '已有项目', budget: 9999 })]
      store['reno_budget_v2'] = JSON.stringify(existing)

      const restored = useBudgetStore()
      expect(restored.items).toHaveLength(1)
      expect(restored.items[0].name).toBe('已有项目')
      expect(restored.totalBudget).toBe(9999)
    })

    it('localStorage 数据损坏时应降级为空数组', () => {
      resetStore()
      store['reno_budget_v2'] = 'invalid json{{{'
      const restored = useBudgetStore()
      expect(restored.items).toEqual([])
    })
  })
})
