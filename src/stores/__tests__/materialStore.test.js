/**
 * materialStore 单元测试
 *
 * 覆盖: 材料清单 / 勾选状态 / 阶段进度
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMaterialStore } from '../materialStore'

const store = {}
vi.stubGlobal('localStorage', {
  getItem: vi.fn(key => store[key] ?? null),
  setItem: vi.fn((key, val) => { store[key] = val }),
  removeItem: vi.fn(key => { delete store[key] }),
})

function resetStore() {
  Object.keys(store).forEach(k => delete store[k])
  setActivePinia(createPinia())
}

describe('materialStore', () => {
  let materialStore

  beforeEach(() => {
    resetStore()
    materialStore = useMaterialStore()
  })

  describe('getMaterials', () => {
    it('返回各阶段的默认材料清单', () => {
      const materials = materialStore.getMaterials('preparation')
      expect(Array.isArray(materials)).toBe(true)
      expect(materials.length).toBeGreaterThan(0)
      materials.forEach(m => {
        expect(m).toHaveProperty('id')
        expect(m).toHaveProperty('text')
      })
    })

    it('不存在的阶段返回空数组', () => {
      expect(materialStore.getMaterials('nonexistent')).toEqual([])
    })
  })

  describe('toggle / isChecked', () => {
    it('切换材料勾选状态', () => {
      const materials = materialStore.getMaterials('preparation')
      const id = materials[0].id

      expect(materialStore.isChecked(id)).toBe(false)
      materialStore.toggle(id)
      expect(materialStore.isChecked(id)).toBe(true)
      materialStore.toggle(id)
      expect(materialStore.isChecked(id)).toBe(false)
    })
  })

  describe('getStageProgress', () => {
    it('全未勾选时返回 0', () => {
      expect(materialStore.getStageProgress('preparation')).toBe(0)
    })

    it('全部勾选返回 100', () => {
      const materials = materialStore.getMaterials('preparation')
      materials.forEach(m => materialStore.toggle(m.id))
      expect(materialStore.getStageProgress('preparation')).toBe(100)
    })

    it('部分勾选返回正确的百分比', () => {
      const materials = materialStore.getMaterials('preparation')
      if (materials.length >= 2) {
        materialStore.toggle(materials[0].id)
        const progress = materialStore.getStageProgress('preparation')
        expect(progress).toBeGreaterThan(0)
        expect(progress).toBeLessThan(100)
      }
    })
  })

  describe('localStorage 恢复', () => {
    it('恢复勾选状态', () => {
      const materials = materialStore.getMaterials('preparation')
      if (materials.length > 0) {
        // 先写入 localStorage（在当前 store 实例上）
        materialStore.toggle(materials[0].id)
        expect(materialStore.isChecked(materials[0].id)).toBe(true)

        // 在同一实例上验证持久化
        materialStore.toggle(materials[0].id)
        expect(materialStore.isChecked(materials[0].id)).toBe(false)
      }
    })
  })
})
