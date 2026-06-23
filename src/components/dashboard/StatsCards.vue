<template>
  <div class="stats-grid">
    <div class="stat-card warm anim-fade-in-up anim-delay-1">
      <div class="stat-card-top">
        <span class="stat-label">装修进度</span>
        <span class="stat-icon">📋</span>
      </div>
      <div class="stat-value">{{ animatedComplete }}/{{ progressStore.totalStages }}</div>
      <div class="stat-sub">
        {{ progressStore.completedCount === progressStore.totalStages ? '🎉 全部完成！' : progressStore.completedCount === 0 ? '准备开始你的装修之旅' : `${inProgressCount} 个阶段进行中` }}
      </div>
    </div>

    <div class="stat-card green anim-fade-in-up anim-delay-2">
      <div class="stat-card-top">
        <span class="stat-label">知识阅读</span>
        <span class="stat-icon">📖</span>
      </div>
      <div class="stat-value">{{ animatedRead }}/{{ totalArticles }}</div>
      <div class="stat-sub">{{ totalArticles > 0 ? readPercent + '% 已阅读' : '开始学习装修知识' }}</div>
    </div>

    <div class="stat-card amber anim-fade-in-up anim-delay-3">
      <div class="stat-card-top">
        <span class="stat-label">预算概览</span>
        <span class="stat-icon">💰</span>
      </div>
      <div class="stat-value">{{ formatMoney(animatedSpend) }}</div>
      <div class="stat-sub">{{ totalBudget > 0 ? '总预算 ' + formatMoney(totalBudget) : '去预算管理设置预算' }}</div>
    </div>

    <div class="stat-card wood anim-fade-in-up anim-delay-4">
      <div class="stat-card-top">
        <span class="stat-label">工人联系</span>
        <span class="stat-icon">👷</span>
      </div>
      <div class="stat-value">{{ animatedWorker }}</div>
      <div class="stat-sub">{{ workerCount > 0 ? '已记录 ' + workerCount + ' 位工人' : '去工人管理添加信息' }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progressStore'
import { useContentStore } from '@/stores/contentStore'
import { useBudgetStore } from '@/stores/budgetStore'
import { useWorkerStore } from '@/stores/workerStore'
import { formatMoney } from '@/utils/format'
import { useCountUp } from '@/composables/useCountUp'

const progressStore = useProgressStore()
const contentStore = useContentStore()
const budgetStore = useBudgetStore()
const workerStore = useWorkerStore()

const inProgressCount = computed(() => {
  return Object.values(progressStore.stageStatus).filter(s => s === 'in-progress').length
})

const totalArticles = computed(() => contentStore.stageList.length * 4)
const totalRead = computed(() => {
  return contentStore.stageList.reduce((sum, s) => sum + contentStore.getStageReadCount(s.id), 0)
})
const readPercent = computed(() => totalArticles.value > 0 ? Math.round((totalRead.value / totalArticles.value) * 100) : 0)

const totalBudget = computed(() => budgetStore.totalBudget)
const totalActual = computed(() => budgetStore.totalActual)
const workerCount = computed(() => workerStore.totalWorkers)

// 数值滚动动画
const animatedComplete = useCountUp(computed(() => progressStore.completedCount), { duration: 500 })
const animatedRead = useCountUp(totalRead, { duration: 500 })
const animatedSpend = useCountUp(totalActual, { duration: 600 })
const animatedWorker = useCountUp(workerCount, { duration: 500 })

</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
  border-top: 3px solid transparent;
}

.stat-card.warm { border-top-color: var(--accent-warm); }
.stat-card.green { border-top-color: var(--accent-green); }
.stat-card.amber { border-top-color: var(--accent-amber); }
.stat-card.wood { border-top-color: var(--accent-wood); }

.stat-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-icon {
  font-size: 1.25rem;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: var(--space-xs) 0;
}

.stat-sub {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
