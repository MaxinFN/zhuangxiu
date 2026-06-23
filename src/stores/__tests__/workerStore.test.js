/**
 * workerStore 单元测试
 *
 * 覆盖: worker CRUD / callRecords CRUD / workersByType / totalWorkers
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWorkerStore } from '../workerStore'

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

const makeWorker = (overrides = {}) => ({
  type: 'tiler',
  name: '李师傅',
  phone: '13800138000',
  source: '朋友推荐',
  quote: 8000,
  notes: '手艺好',
  rating: 4,
  ...overrides,
})

describe('workerStore', () => {
  let workerStore

  beforeEach(() => {
    resetStore()
    workerStore = useWorkerStore()
  })

  describe('addWorker', () => {
    it('添加工人并自动生成 id 和 createdAt', () => {
      const w = workerStore.addWorker(makeWorker())
      expect(w.id).toBeTruthy()
      expect(w.createdAt).toBeTruthy()
      expect(workerStore.totalWorkers).toBe(1)
    })

    it('默认值处理', () => {
      const w = workerStore.addWorker({ name: '无名' })
      expect(w.type).toBe('other')
      expect(w.phone).toBe('')
      expect(w.quote).toBe(0)
      expect(w.rating).toBe(0)
    })
  })

  describe('updateWorker', () => {
    it('更新已有工人信息', () => {
      const w = workerStore.addWorker(makeWorker())
      workerStore.updateWorker(w.id, { name: '王师傅', quote: 10000 })
      expect(workerStore.workers[0].name).toBe('王师傅')
      expect(workerStore.workers[0].quote).toBe(10000)
    })
  })

  describe('removeWorker', () => {
    it('删除工人及其通话记录', () => {
      const w = workerStore.addWorker(makeWorker())
      workerStore.addCallRecord({ workerId: w.id, content: '已沟通' })
      expect(workerStore.totalWorkers).toBe(1)
      expect(workerStore.callRecords).toHaveLength(1)

      workerStore.removeWorker(w.id)
      expect(workerStore.totalWorkers).toBe(0)
      expect(workerStore.callRecords).toHaveLength(0)
    })
  })

  describe('workersByType', () => {
    it('按工种分类', () => {
      workerStore.addWorker(makeWorker({ type: 'tiler', name: 'A' }))
      workerStore.addWorker(makeWorker({ type: 'tiler', name: 'B' }))
      workerStore.addWorker(makeWorker({ type: 'plumber', name: 'C' }))

      const grouped = workerStore.workersByType
      expect(grouped.tiler.workers).toHaveLength(2)
      expect(grouped.plumber.workers).toHaveLength(1)
      expect(grouped.painter.workers).toHaveLength(0)
    })
  })

  describe('callRecords', () => {
    it('addCallRecord 关联工人', () => {
      const w = workerStore.addWorker(makeWorker())
      workerStore.addCallRecord({
        workerId: w.id,
        date: '2025-01-15',
        content: '报价8000，含辅料',
        quote: 8000,
        conditions: '先付30%',
        attitude: 5,
      })

      const records = workerStore.getCallRecords(w.id)
      expect(records).toHaveLength(1)
      expect(records[0].content).toBe('报价8000，含辅料')
    })

    it('getCallRecords 只返回对应工人的记录', () => {
      const w1 = workerStore.addWorker(makeWorker({ name: '工人1' }))
      const w2 = workerStore.addWorker(makeWorker({ name: '工人2' }))
      workerStore.addCallRecord({ workerId: w1.id, content: 'A' })
      workerStore.addCallRecord({ workerId: w2.id, content: 'B' })

      expect(workerStore.getCallRecords(w1.id)).toHaveLength(1)
      expect(workerStore.getCallRecords(w1.id)[0].content).toBe('A')
    })
  })

  describe('totalWorkers', () => {
    it('空列表返回 0', () => {
      expect(workerStore.totalWorkers).toBe(0)
    })

    it('正确计数', () => {
      workerStore.addWorker(makeWorker())
      workerStore.addWorker(makeWorker())
      expect(workerStore.totalWorkers).toBe(2)
    })
  })

  describe('localStorage 恢复', () => {
    it('从 localStorage 加载已有数据', () => {
      resetStore()
      store['reno_workers'] = JSON.stringify([makeWorker({ name: '已有工人' })])
      store['reno_call_records'] = JSON.stringify([{ id: 'c1', workerId: 'w1', content: '旧记录' }])

      const restored = useWorkerStore()
      expect(restored.totalWorkers).toBe(1)
      expect(restored.workers[0].name).toBe('已有工人')
      expect(restored.callRecords).toHaveLength(1)
    })
  })
})
