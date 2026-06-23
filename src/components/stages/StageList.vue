<template>
  <div class="stage-list">
    <!-- 进度概览 -->
    <div class="stage-progress-bar">
      <div class="progress-info">
        <span>装修总进度</span>
        <span class="progress-text">{{ progressStore.completedCount }} / {{ progressStore.totalStages }} 阶段完成</span>
      </div>
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{ width: progressStore.progressPercent + '%' }"
        ></div>
      </div>
    </div>

    <!-- 阶段时间轴 -->
    <div class="timeline">
      <div
        v-for="(stage, idx) in contentStore.stageList"
        :key="stage.id"
        class="timeline-item"
        :class="{
          completed: progressStore.getStageStatus(stage.id) === 'completed',
          active: progressStore.getStageStatus(stage.id) === 'in-progress',
        }"
        :style="{ animationDelay: (idx * 60) + 'ms' }"
        @click="selectStage(stage)"
        @keydown.enter="selectStage(stage)"
        @keydown.space.prevent="selectStage(stage)"
        tabindex="0"
        role="button"
        :aria-label="`进入${stage.name}阶段`"
      >
        <!-- 时间轴线条 -->
        <div class="timeline-line">
          <div class="timeline-dot">
            <span v-if="progressStore.getStageStatus(stage.id) === 'completed'">✅</span>
            <span v-else-if="progressStore.getStageStatus(stage.id) === 'in-progress'">🔄</span>
            <span v-else>{{ stage.icon }}</span>
          </div>
          <div
            v-if="idx < contentStore.stageList.length - 1" class="timeline-connector"
            :class="{ filled: progressStore.getStageStatus(stage.id) === 'completed' }"
          ></div>
        </div>

        <!-- 阶段内容 -->
        <div class="timeline-content">
          <div class="timeline-card">
            <div class="stage-header">
              <h3>{{ stage.name }}</h3>
              <span class="stage-duration">{{ stage.duration }}</span>
            </div>
            <p class="stage-desc">{{ getStageDesc(stage.id) }}</p>
            <div class="stage-meta">
              <span class="stage-reading">
                📖 {{ contentStore.getStageReadCount(stage.id) }}/4 篇已读
              </span>
              <span class="stage-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useContentStore } from '@/stores/contentStore'
import { useProgressStore } from '@/stores/progressStore'

const router = useRouter()
const contentStore = useContentStore()
const progressStore = useProgressStore()

const descMap = {
  preparation: '量房、定风格、做预算、找施工队、签合同、办许可证',
  demolition: '拆除非承重墙、新建墙体、铲墙皮、垃圾清运',
  'plumbing-electric': '水电定位、开槽布线、水管铺设、打压测试',
  tiling: '防水施工、贴砖、石材铺贴、美缝',
  woodwork: '吊顶施工、柜体制作、背景墙、门窗套',
  painting: '墙面找平、批腻子、刷漆/贴壁纸',
  installation: '橱柜、卫浴、灯具、开关面板、五金安装',
  'soft-furnishing': '家具进场、窗帘安装、家电摆放、装饰布置',
  completion: '全面验收、问题整改、尾款结算、入住准备',
}

function getStageDesc(stageId) {
  return descMap[stageId] || ''
}

function selectStage(stage) {
  router.push({ name: 'stage-detail', params: { stageId: stage.id } })
}
</script>

<style scoped>
.stage-progress-bar {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  box-shadow: var(--shadow-card);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.progress-text {
  font-weight: 600;
  color: var(--accent-warm);
}

.progress-track {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-warm), var(--accent-amber));
  border-radius: 4px;
  transition: width var(--transition-slow);
}

/* 时间轴 */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: var(--space-lg);
  cursor: pointer;
  animation: fade-in-up 350ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

/* 时间轴线条 */
.timeline-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 48px;
  flex-shrink: 0;
}

.timeline-dot {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: var(--bg-card);
  border: 3px solid var(--border-color);
  position: relative;
  z-index: 1;
  transition: all var(--transition-normal);
}

.timeline-item.completed .timeline-dot {
  border-color: var(--accent-green);
  background: var(--accent-green-soft);
}

.timeline-item.active .timeline-dot {
  border-color: var(--accent-warm);
  background: var(--accent-warm-soft);
  box-shadow: 0 0 0 4px var(--accent-warm-soft);
  animation: pulse 2.5s ease infinite;
}

.timeline-connector {
  width: 3px;
  flex: 1;
  min-height: 24px;
  background: var(--border-color);
}

.timeline-connector.filled {
  background: var(--accent-green);
}

/* 时间轴卡片 */
.timeline-content {
  flex: 1;
  padding-bottom: var(--space-lg);
}

.timeline-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-md) var(--space-lg);
  box-shadow: var(--shadow-card);
  transition: all var(--transition-normal);
}

.timeline-card:hover {
  box-shadow: var(--shadow-hover);
  border-color: var(--accent-warm);
  transform: translateX(4px);
}

.timeline-item.completed .timeline-card {
  border-left: 3px solid var(--accent-green);
}

.timeline-item.active .timeline-card {
  border-left: 3px solid var(--accent-warm);
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xs);
}

.stage-header h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.stage-duration {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.stage-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.stage-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-sm);
}

.stage-reading {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.stage-arrow {
  color: var(--text-muted);
  font-size: var(--font-size-lg);
}
</style>
