/**
 * uiStore 单元测试
 *
 * 覆盖: 侧边栏 / Toast / Modal / 面包屑
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from '../uiStore'

function resetStore() {
  setActivePinia(createPinia())
}

describe('uiStore', () => {
  let uiStore

  beforeEach(() => {
    resetStore()
    uiStore = useUiStore()
  })

  describe('sidebarCollapsed', () => {
    it('默认展开', () => {
      expect(uiStore.sidebarCollapsed).toBe(false)
    })

    it('toggleSidebar 切换状态', () => {
      uiStore.toggleSidebar()
      expect(uiStore.sidebarCollapsed).toBe(true)
      uiStore.toggleSidebar()
      expect(uiStore.sidebarCollapsed).toBe(false)
    })
  })

  describe('toast', () => {
    it('showToast 添加并自动移除', async () => {
      vi.useFakeTimers()
      uiStore.showToast('操作成功', 'success')
      expect(uiStore.toasts).toHaveLength(1)
      expect(uiStore.toasts[0].message).toBe('操作成功')
      expect(uiStore.toasts[0].type).toBe('success')

      vi.advanceTimersByTime(3500)
      expect(uiStore.toasts).toHaveLength(0)
      vi.useRealTimers()
    })

    it('removeToast 手动移除', () => {
      uiStore.showToast('测试')
      const id = uiStore.toasts[0].id
      uiStore.removeToast(id)
      expect(uiStore.toasts).toHaveLength(0)
    })
  })

  describe('modal', () => {
    it('openModal / closeModal', () => {
      uiStore.openModal('add-budget')
      expect(uiStore.activeModal).toBe('add-budget')
      uiStore.closeModal()
      expect(uiStore.activeModal).toBeNull()
    })
  })

  describe('breadcrumb', () => {
    it('setBreadcrumb', () => {
      const items = [
        { label: '装修流程', to: '/workflow' },
        { label: '前期准备' },
      ]
      uiStore.setBreadcrumb(items)
      expect(uiStore.breadcrumb).toEqual(items)
    })

    it('空数组清除面包屑', () => {
      uiStore.setBreadcrumb([{ label: '首页' }])
      uiStore.setBreadcrumb([])
      expect(uiStore.breadcrumb).toEqual([])
    })
  })
})
