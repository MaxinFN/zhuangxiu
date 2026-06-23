import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadJSON, saveJSON } from '@/utils/storage'

const STORAGE_KEY_STAGE = 'reno_stage_status'
const STORAGE_KEY_TASK = 'reno_task_status'
const STORAGE_KEY_ACCEPTANCE = 'reno_acceptance'

export const useProgressStore = defineStore('progress', () => {
  // 阶段状态: { stageId: 'locked' | 'in-progress' | 'completed' }
  const stageStatus = ref(loadJSON(STORAGE_KEY_STAGE, {}))

  // 任务勾选: { taskId: true }
  const taskStatus = ref(loadJSON(STORAGE_KEY_TASK, {}))

  // 验收勾选: { checkId: true }
  const acceptanceStatus = ref(loadJSON(STORAGE_KEY_ACCEPTANCE, {}))

  // 计算属性
  const completedStages = computed(() =>
    Object.keys(stageStatus.value).filter(id => stageStatus.value[id] === 'completed')
  )

  const completedCount = computed(() => completedStages.value.length)

  const totalStages = 9

  const progressPercent = computed(() =>
    Math.round((completedCount.value / totalStages) * 100)
  )

  // 阶段操作
  function setStageStatus(stageId, status) {
    stageStatus.value[stageId] = status
    saveJSON(STORAGE_KEY_STAGE, stageStatus.value)
  }

  function getStageStatus(stageId) {
    return stageStatus.value[stageId] || 'locked'
  }

  // 所有阶段始终可浏览，不再需要硬锁定
  function isStageAccessible() {
    return true
  }

  // 首次访问阶段时自动标记为"进行中"
  function ensureInProgress(stageId) {
    if (getStageStatus(stageId) === 'locked') {
      setStageStatus(stageId, 'in-progress')
    }
  }

  // 任务操作
  function toggleTask(taskId) {
    taskStatus.value[taskId] = !taskStatus.value[taskId]
    if (!taskStatus.value[taskId]) {
      delete taskStatus.value[taskId]
    }
    saveJSON(STORAGE_KEY_TASK, taskStatus.value)
  }

  function isTaskDone(taskId) {
    return !!taskStatus.value[taskId]
  }

  // 验收操作
  function toggleAcceptance(checkId) {
    acceptanceStatus.value[checkId] = !acceptanceStatus.value[checkId]
    if (!acceptanceStatus.value[checkId]) {
      delete acceptanceStatus.value[checkId]
    }
    saveJSON(STORAGE_KEY_ACCEPTANCE, acceptanceStatus.value)
  }

  function isAcceptanceDone(checkId) {
    return !!acceptanceStatus.value[checkId]
  }

  return {
    stageStatus,
    taskStatus,
    acceptanceStatus,
    completedStages,
    completedCount,
    totalStages,
    progressPercent,
    setStageStatus,
    getStageStatus,
    isStageAccessible,
    ensureInProgress,
    toggleTask,
    isTaskDone,
    toggleAcceptance,
    isAcceptanceDone,
  }
})
