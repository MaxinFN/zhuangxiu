/**
 * contentStore 单元测试
 *
 * 覆盖: 阶段列表 / 内容存取 / 阅读进度
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useContentStore } from '../contentStore'

const mem = {}
vi.stubGlobal('localStorage', {
  getItem: vi.fn(key => mem[key] ?? null),
  setItem: vi.fn((key, val) => { mem[key] = val }),
  removeItem: vi.fn(key => { delete mem[key] }),
})

function resetStore() {
  Object.keys(mem).forEach(k => delete mem[k])
  setActivePinia(createPinia())
}

describe('contentStore', () => {
  let contentStore

  beforeEach(() => {
    resetStore()
    contentStore = useContentStore()
  })

  describe('stages 元数据', () => {
    it('包含 9 个阶段', () => {
      expect(contentStore.stages).toHaveLength(9)
    })

    it('阶段按 order 排序', () => {
      const orders = contentStore.stages.map(s => s.order)
      const sorted = [...orders].sort((a, b) => a - b)
      expect(orders).toEqual(sorted)
    })

    it('每个阶段有 id / name / icon / order / duration', () => {
      contentStore.stages.forEach(stage => {
        expect(stage).toHaveProperty('id')
        expect(stage).toHaveProperty('name')
        expect(stage).toHaveProperty('icon')
        expect(stage).toHaveProperty('order')
        expect(stage).toHaveProperty('duration')
      })
    })

    it('stageList 是 stages 的排序计算属性', () => {
      expect(contentStore.stageList.length).toBe(9)
      expect(contentStore.stageList[0].id).toBe('preparation')
      expect(contentStore.stageList[8].id).toBe('completion')
    })
  })

  describe('contentFiles', () => {
    it('setContent 接受阶段文件对象', () => {
      contentStore.setContent('preparation', { index: '# 前期准备', materials: '## 材料' })
      const c = contentStore.getContent('preparation')
      expect(c).toEqual({ index: '# 前期准备', materials: '## 材料' })
    })

    it('getContent 对不存在的阶段返回空对象', () => {
      expect(contentStore.getContent('nonexistent')).toEqual({})
    })
  })

  describe('阅读进度', () => {
    it('markRead 标记单篇文章为已读', () => {
      contentStore.markRead('preparation', 'index')
      expect(contentStore.isRead('preparation', 'index')).toBe(true)
    })

    it('getStageReadCount 统计已读文章数（不含 index）', () => {
      contentStore.markRead('preparation', 'materials')
      contentStore.markRead('preparation', 'craft')
      contentStore.markRead('preparation', 'index')

      // index 不计入阅读统计（阅读计数仅计 materials/craft/acceptance/pitfalls）
      const count = contentStore.getStageReadCount('preparation')
      expect(count).toBe(2)
    })

    it('未阅读任何内容时返回 0', () => {
      expect(contentStore.getStageReadCount('preparation')).toBe(0)
    })
  })

  describe('localStorage 恢复', () => {
    it('恢复阅读进度', () => {
      // 注意: 数据在 resetStore() 之后设置，因为 resetStore 会清空 mem
      resetStore()
      mem['reno_reading_progress'] = JSON.stringify({
        preparation: { materials: true, craft: true },
      })

      const restored = useContentStore()
      expect(restored.isRead('preparation', 'materials')).toBe(true)
      expect(restored.isRead('preparation', 'craft')).toBe(true)
      expect(restored.isRead('preparation', 'pitfalls')).toBe(false)
    })
  })
})
