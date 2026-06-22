const APP_INFO = {
  id: 'zhuangxiu-helper',
  name: '装修小白学习助手',
  version: '1.0.0',
}

const STORAGE_KEYS = [
  'reno_stage_status',
  'reno_task_status',
  'reno_acceptance',
  'reno_budget_v2',
  'reno_workers',
  'reno_call_records',
  'reno_materials',
  'reno_house_info',
  'reno_reading_progress',
]

export function useBackup() {
  function exportData() {
    const data = {}
    STORAGE_KEYS.forEach(key => {
      try {
        const raw = localStorage.getItem(key)
        data[key] = raw ? JSON.parse(raw) : null
      } catch {
        data[key] = null
      }
    })

    const backup = {
      app: APP_INFO,
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      sourceOrigin: window.location.origin,
      data,
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `装修助手备份_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)

    localStorage.setItem('reno_last_backup_at', new Date().toISOString())
    return true
  }

  function importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result)

          // 验证
          if (!backup.app || backup.app.id !== APP_INFO.id) {
            throw new Error('这不是装修小白学习助手的备份文件')
          }

          const data = backup.data
          if (!data || typeof data !== 'object') {
            throw new Error('备份文件格式不正确')
          }

          // 检查是否有可导入的数据
          const keys = Object.keys(data).filter(k => data[k] !== null && data[k] !== undefined)
          if (keys.length === 0) {
            throw new Error('备份文件中没有可导入的数据')
          }

          // 备份当前数据（以防导入失败回滚）
          const rollback = {}
          keys.forEach(key => {
            rollback[key] = localStorage.getItem(key)
          })

          try {
            keys.forEach(key => {
              localStorage.setItem(key, JSON.stringify(data[key]))
            })
          } catch (storageError) {
            // 回滚
            Object.entries(rollback).forEach(([key, val]) => {
              if (val === null) localStorage.removeItem(key)
              else localStorage.setItem(key, val)
            })
            throw new Error('本地存储空间不足，导入未完成')
          }

          resolve({ importedKeys: keys })
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }

  function clearAllData() {
    STORAGE_KEYS.forEach(key => localStorage.removeItem(key))
    localStorage.removeItem('reno_last_backup_at')
    localStorage.removeItem('reno_backup_reminder_dismissed_at')
  }

  function hasUserData() {
    return STORAGE_KEYS.some(key => {
      const raw = localStorage.getItem(key)
      if (!raw) return false
      try {
        const data = JSON.parse(raw)
        if (Array.isArray(data)) return data.length > 0
        if (typeof data === 'object' && data !== null) return Object.keys(data).length > 0
        return false
      } catch { return !!raw }
    })
  }

  function needsBackupReminder(days = 30) {
    if (!hasUserData()) return false
    const lastBackup = localStorage.getItem('reno_last_backup_at')
    const dismissed = localStorage.getItem('reno_backup_reminder_dismissed_at')
    const ref = lastBackup || dismissed
    if (!ref) return true
    const elapsed = Date.now() - new Date(ref).getTime()
    return elapsed >= days * 24 * 60 * 60 * 1000
  }

  function dismissBackupReminder() {
    localStorage.setItem('reno_backup_reminder_dismissed_at', new Date().toISOString())
  }

  return {
    exportData,
    importData,
    clearAllData,
    hasUserData,
    needsBackupReminder,
    dismissBackupReminder,
  }
}
