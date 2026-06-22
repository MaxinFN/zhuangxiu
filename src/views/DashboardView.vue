<template>
  <div class="dashboard">
    <!-- 数据隐私提醒 -->
    <div class="privacy-banner">
      <span class="privacy-icon">🔒</span>
      <span>你的数据仅保存在当前浏览器，不会上传服务器。更换设备或浏览器前请先备份。</span>
    </div>

    <!-- 统计卡片 -->
    <StatsCards />

    <!-- 装修进度：全宽 -->
    <div class="card progress-card">
      <ProgressTimeline />
    </div>

    <!-- 下半部分：最近学习 + 预算速览 两列 -->
    <div class="dashboard-grid">
      <div class="card learning-card">
        <h3 class="section-title">📖 最近学习</h3>
        <div class="recent-learning" v-if="recentStages.length">
          <div
            v-for="stage in recentStages"
            :key="stage.id"
            class="recent-item"
          >
            <span class="recent-icon">{{ stage.icon }}</span>
            <div class="recent-info">
              <div class="recent-name">{{ stage.name }}</div>
              <div class="recent-meta">{{ contentStore.getStageReadCount(stage.id) }}/4 篇已读</div>
            </div>
            <router-link
              :to="{ name: 'stage-detail', params: { stageId: stage.id } }"
              class="recent-link"
            >
              继续学习 →
            </router-link>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="empty-state-icon">📖</div>
          <div class="empty-state-text">从"装修流程"开始你的学习之旅</div>
          <router-link to="/workflow" class="btn btn-primary btn-sm" style="margin-top: var(--space-md);">
            开始学习
          </router-link>
        </div>
      </div>

      <div class="card budget-card">
        <h3 class="section-title">🧾 预算速览</h3>
        <div class="budget-snapshot" v-if="totalBudget > 0">
          <div class="budget-bar">
            <div class="budget-bar-fill" :style="{ width: budgetPercent + '%' }"></div>
          </div>
          <div class="budget-overview-numbers">
            <div class="budget-overview-item">
              <span class="budget-overview-value">{{ formatMoney(totalBudget) }}</span>
              <span class="budget-overview-label">总预算</span>
            </div>
            <div class="budget-overview-divider"></div>
            <div class="budget-overview-item">
              <span class="budget-overview-value spend">{{ formatMoney(totalActual) }}</span>
              <span class="budget-overview-label">已花费</span>
            </div>
            <div class="budget-overview-divider"></div>
            <div class="budget-overview-item">
              <span class="budget-overview-value remain">{{ formatMoney(Math.max(0, totalBudget - totalActual)) }}</span>
              <span class="budget-overview-label">剩余</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="empty-state-icon">💰</div>
          <div class="empty-state-text">还没有预算数据</div>
          <router-link to="/budget" class="btn btn-primary btn-sm" style="margin-top: var(--space-md);">
            去设置预算
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useContentStore } from '@/stores/contentStore'
import { useProgressStore } from '@/stores/progressStore'
import StatsCards from '@/components/dashboard/StatsCards.vue'
import ProgressTimeline from '@/components/dashboard/ProgressTimeline.vue'

const contentStore = useContentStore()
const progressStore = useProgressStore()

// 最近学习（按阶段顺序取前几个有进度或进行中的）
const recentStages = computed(() => {
  return contentStore.stageList.filter(s => {
    const status = progressStore.getStageStatus(s.id)
    return status === 'in-progress' || status === 'completed'
  }).slice(0, 3)
})

// 预算数据
const totalBudget = computed(() => {
  try {
    const budget = JSON.parse(localStorage.getItem('reno_budget_v2') || '[]')
    return budget.reduce((sum, item) => sum + (parseFloat(item.budget) || 0), 0)
  } catch { return 0 }
})

const totalActual = computed(() => {
  try {
    const budget = JSON.parse(localStorage.getItem('reno_budget_v2') || '[]')
    return budget.reduce((sum, item) => sum + (parseFloat(item.actual) || 0), 0)
  } catch { return 0 }
})

const budgetPercent = computed(() => {
  if (totalBudget.value === 0) return 0
  return Math.min(100, Math.round((totalActual.value / totalBudget.value) * 100))
})

function formatMoney(val) {
  if (!val) return '¥0'
  return '¥' + Number(val).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}
</script>

<style scoped>
.privacy-banner {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--accent-amber-soft);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-bottom: var(--space-lg);
}

.privacy-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

/* 进度卡片：全宽 */
.progress-card {
  margin-bottom: var(--space-md);
}

/* 下半部分：最近学习 + 预算速览 两列 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--space-lg);
  color: var(--text-primary);
}

/* 最近学习 */
.recent-learning {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.recent-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  transition: background var(--transition-fast);
}

.recent-item:hover {
  background: var(--bg-hover);
}

.recent-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.recent-info {
  flex: 1;
  min-width: 0;
}

.recent-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.recent-meta {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-top: 2px;
}

.recent-link {
  font-size: var(--font-size-xs);
  color: var(--accent-warm);
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 预算速览 */
.budget-snapshot {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.budget-bar {
  height: 10px;
  background: var(--bg-tertiary);
  border-radius: 5px;
  overflow: hidden;
}

.budget-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-amber), var(--accent-warm));
  border-radius: 5px;
  transition: width var(--transition-slow);
}

/* 三个数字水平排列 */
.budget-overview-numbers {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.budget-overview-item {
  text-align: center;
  flex: 1;
}

.budget-overview-value {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.budget-overview-value.spend {
  color: var(--color-danger);
}

.budget-overview-value.remain {
  color: var(--accent-green);
}

.budget-overview-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-top: 2px;
}

.budget-overview-divider {
  width: 1px;
  height: 36px;
  background: var(--border-color);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .budget-overview-numbers {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .budget-overview-divider {
    width: 100%;
    height: 1px;
  }
}
</style>
