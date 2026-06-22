<template>
  <div class="workers-layout">
    <!-- 左侧工种列表 -->
    <div class="worker-types-panel">
      <div class="panel-header">👷 工种列表</div>
      <div class="type-list">
        <button
          v-for="type in workerStore.workerTypes"
          :key="type.key"
          class="type-item"
          :class="{ active: selectedType === type.key }"
          @click="selectedType = type.key"
        >
          <span class="type-icon">{{ type.icon }}</span>
          <span class="type-name">{{ type.name }}</span>
          <span class="type-count">{{ workerStore.getWorkersByType(type.key).length }}</span>
        </button>
      </div>
    </div>

    <!-- 右侧工人详情 -->
    <div class="worker-detail-panel">
      <template v-if="selectedType">
        <div class="panel-header">
          <span>{{ getTypeIcon(selectedType) }} {{ getTypeName(selectedType) }}</span>
          <button class="btn btn-primary btn-sm" @click="$emit('add', selectedType)">+ 添加</button>
        </div>

        <div class="worker-cards" v-if="typeWorkers.length">
          <div
            v-for="worker in typeWorkers"
            :key="worker.id"
            class="worker-card"
          >
            <div class="worker-card-header">
              <div class="worker-info">
                <div class="worker-name">{{ worker.name || '未命名' }}</div>
                <div class="worker-source" v-if="worker.source">{{ worker.source }}</div>
              </div>
              <div class="worker-rating">
                <span
                  v-for="n in 5"
                  :key="n"
                  class="star"
                  :class="{ filled: n <= worker.rating }"
                  @click="rateWorker(worker, n)"
                >★</span>
              </div>
            </div>

            <div class="worker-details">
              <div class="detail-row" v-if="worker.phone">
                <span class="detail-label">📞</span>
                <span>{{ worker.phone }}</span>
              </div>
              <div class="detail-row" v-if="worker.quote">
                <span class="detail-label">💰</span>
                <span>报价：{{ formatMoney(worker.quote) }}</span>
              </div>
              <div class="detail-row" v-if="worker.notes">
                <span class="detail-label">📝</span>
                <span>{{ worker.notes }}</span>
              </div>
            </div>

            <!-- 通话记录 -->
            <div class="call-records" v-if="workerStore.getCallRecords(worker.id).length">
              <div class="call-title">📞 沟通记录</div>
              <div
                v-for="call in workerStore.getCallRecords(worker.id)"
                :key="call.id"
                class="call-item"
              >
                <div class="call-date">{{ call.date }}</div>
                <div class="call-content">{{ call.content }}</div>
                <div class="call-meta" v-if="call.quote">
                  <span>报价：{{ formatMoney(call.quote) }}</span>
                  <span v-if="call.conditions">｜{{ call.conditions }}</span>
                  <span>｜态度：
                    <span v-for="n in 5" :key="n" class="star-sm" :class="{ filled: n <= call.attitude }">★</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="worker-card-actions">
              <button class="btn btn-secondary btn-sm" @click="$emit('add-call', worker)">📞 记录沟通</button>
              <button class="btn btn-secondary btn-sm" @click="$emit('edit', worker)">✏️ 编辑</button>
              <button class="btn btn-secondary btn-sm danger" @click="removeWorker(worker)">🗑</button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-state-icon">👷</div>
          <div class="empty-state-text">还没有{{ getTypeName(selectedType) }}工人信息</div>
        </div>
      </template>

      <div v-else class="empty-state">
        <div class="empty-state-icon">👈</div>
        <div class="empty-state-text">请从左侧选择一个工种</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWorkerStore } from '@/stores/workerStore'

const emit = defineEmits(['add', 'edit', 'add-call'])

const workerStore = useWorkerStore()
const selectedType = ref(null)

const typeWorkers = computed(() =>
  selectedType.value ? workerStore.getWorkersByType(selectedType.value) : []
)

function getTypeIcon(key) {
  return workerStore.workerTypes.find(t => t.key === key)?.icon || '👷'
}

function getTypeName(key) {
  return workerStore.workerTypes.find(t => t.key === key)?.name || key
}

function rateWorker(worker, rating) {
  workerStore.updateWorker(worker.id, { rating })
}

function removeWorker(worker) {
  if (confirm(`确认删除「${worker.name || '未命名'}」的信息？`)) {
    workerStore.removeWorker(worker.id)
  }
}

function formatMoney(val) {
  if (!val) return '¥0'
  return '¥' + Number(val).toLocaleString('zh-CN')
}
</script>

<style scoped>
.workers-layout {
  display: flex;
  gap: var(--space-lg);
  min-height: 500px;
}

/* 工种列表 */
.worker-types-panel {
  width: 220px;
  flex-shrink: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.type-list {
  display: flex;
  flex-direction: column;
}

.type-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: none;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.type-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.type-item.active {
  background: var(--accent-warm-soft);
  color: var(--accent-warm);
  font-weight: 600;
}

.type-icon { font-size: 1.1rem; }
.type-name { flex: 1; }

.type-count {
  font-size: var(--font-size-xs);
  background: var(--bg-tertiary);
  padding: 1px 8px;
  border-radius: var(--radius-full);
  color: var(--text-muted);
}

/* 工人详情 */
.worker-detail-panel {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.worker-cards {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.worker-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  transition: box-shadow var(--transition-fast);
}

.worker-card:hover {
  box-shadow: var(--shadow-hover);
}

.worker-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-sm);
}

.worker-name {
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.worker-source {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.worker-rating .star {
  color: var(--border-color);
  cursor: pointer;
  font-size: 1rem;
}

.worker-rating .star.filled {
  color: var(--accent-amber);
}

.worker-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.detail-row {
  display: flex;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.detail-label {
  width: 24px;
  flex-shrink: 0;
}

/* 通话记录 */
.call-records {
  border-top: 1px dashed var(--border-color);
  padding-top: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.call-title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: var(--space-xs);
}

.call-item {
  padding: var(--space-xs) 0;
  font-size: var(--font-size-xs);
}

.call-date {
  color: var(--accent-warm);
  font-weight: 500;
}

.call-content {
  color: var(--text-secondary);
  margin: 2px 0;
}

.call-meta {
  color: var(--text-muted);
}

.star-sm {
  font-size: 0.8rem;
  color: var(--border-color);
}

.star-sm.filled {
  color: var(--accent-amber);
}

.worker-card-actions {
  display: flex;
  gap: var(--space-xs);
}

.btn.danger {
  color: var(--color-danger);
}

@media (max-width: 768px) {
  .workers-layout {
    flex-direction: column;
  }
  .worker-types-panel {
    width: 100%;
  }
  .type-list {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
