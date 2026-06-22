<template>
  <div class="budget-table-wrapper">
    <!-- 摘要栏 -->
    <div class="budget-summary-bar">
      <div class="summary-item">
        <span class="summary-label">🏡 总预算</span>
        <span class="summary-value">{{ formatMoney(budgetStore.totalBudget) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">📋 已规划</span>
        <span class="summary-value">{{ budgetStore.items.length }} 项</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">💰 已花费</span>
        <span class="summary-value spend">{{ formatMoney(budgetStore.totalActual) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">📊 剩余</span>
        <span class="summary-value" :class="budgetStore.remaining >= 0 ? 'remain' : 'over'">
          {{ formatMoney(budgetStore.remaining) }}
        </span>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="table-toolbar">
      <button class="btn btn-primary btn-sm" @click="$emit('add')">+ 添加项目</button>
      <div class="toolbar-right">
        <button class="btn btn-secondary btn-sm" @click="exportExcel">📤 导出Excel</button>
        <button class="btn btn-secondary btn-sm" @click="$emit('import')">📥 导入Excel</button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-scroll">
      <table class="budget-table" v-if="budgetStore.items.length">
        <thead>
          <tr>
            <th>#</th>
            <th>分类</th>
            <th>房间</th>
            <th>项目名称</th>
            <th>品牌型号</th>
            <th>单位</th>
            <th>工程量</th>
            <th>单价</th>
            <th>预算总价</th>
            <th>实际支出</th>
            <th>差价</th>
            <th>优先级</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in budgetStore.items" :key="item.id">
            <td class="row-num">{{ idx + 1 }}</td>
            <td>
              <span class="cat-badge" :style="{ background: getCatColor(item.cat) + '20', color: getCatColor(item.cat) }">
                {{ getCatLabel(item.cat) }}
              </span>
            </td>
            <td>{{ item.room }}</td>
            <td class="name-cell">{{ item.name }}</td>
            <td>{{ item.brand }}</td>
            <td>{{ item.unit }}</td>
            <td class="num-cell">{{ item.quantity || '-' }}</td>
            <td class="num-cell">{{ item.unitPrice ? '¥' + item.unitPrice : '-' }}</td>
            <td class="num-cell budget">{{ formatMoney(item.budget) }}</td>
            <td class="num-cell actual">{{ formatMoney(item.actual) }}</td>
            <td class="num-cell" :class="diffClass(item)">
              {{ formatDiff(item) }}
            </td>
            <td>
              <span class="priority-badge" :class="'p-' + item.priority">
                {{ priorityLabel(item.priority) }}
              </span>
            </td>
            <td>
              <button class="btn-icon" @click="$emit('edit', item)" title="编辑">✏️</button>
              <button class="btn-icon danger" @click="confirmDelete(item)" title="删除">🗑</button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="8"><strong>合计</strong></td>
            <td class="num-cell"><strong>{{ formatMoney(budgetStore.totalBudget) }}</strong></td>
            <td class="num-cell"><strong>{{ formatMoney(budgetStore.totalActual) }}</strong></td>
            <td class="num-cell" :class="budgetStore.remaining >= 0 ? 'positive' : 'negative'">
              <strong>{{ formatMoney(budgetStore.remaining) }}</strong>
            </td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>

      <div v-else class="empty-state">
        <div class="empty-state-icon">💰</div>
        <div class="empty-state-text">还没有预算项目，点击"+ 添加项目"开始规划</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBudgetStore } from '@/stores/budgetStore'

const emit = defineEmits(['add', 'edit', 'import'])

const budgetStore = useBudgetStore()

function getCatColor(key) {
  return budgetStore.categories.find(c => c.key === key)?.color || '#888'
}

function getCatLabel(key) {
  return budgetStore.categories.find(c => c.key === key)?.label || key
}

function formatMoney(val) {
  if (val == null || isNaN(val)) return '¥0'
  return '¥' + Number(val).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

function formatDiff(item) {
  const budget = parseFloat(item.budget) || 0
  const actual = parseFloat(item.actual) || 0
  if (!budget && !actual) return '-'
  const diff = budget - actual
  const sign = diff >= 0 ? '' : ''
  return sign + formatMoney(Math.abs(diff))
}

function diffClass(item) {
  const budget = parseFloat(item.budget) || 0
  const actual = parseFloat(item.actual) || 0
  if (!budget && !actual) return ''
  return budget - actual >= 0 ? 'positive' : 'negative'
}

function priorityLabel(p) {
  const map = { must: '🔴 刚需', optional: '🟡 可减', nice: '🟢 可选' }
  return map[p] || p
}

function confirmDelete(item) {
  if (confirm(`确认删除「${item.name}」？`)) {
    budgetStore.removeItem(item.id)
  }
}

function exportExcel() {
  const XLSX = window.XLSX
  if (!XLSX) return alert('Excel库未加载')

  const data = budgetStore.items.map((item, idx) => ({
    '#': idx + 1,
    '分类': getCatLabel(item.cat),
    '房间': item.room,
    '项目名称': item.name,
    '品牌型号': item.brand,
    '单位': item.unit,
    '工程量': item.quantity,
    '单价': item.unitPrice,
    '预算总价': item.budget,
    '实际支出': item.actual,
    '差价': (parseFloat(item.budget) || 0) - (parseFloat(item.actual) || 0),
    '优先级': priorityLabel(item.priority),
    '施工工艺': item.craft,
    '备注': item.note,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '预算表')
  XLSX.writeFile(wb, `装修预算_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
</script>

<style scoped>
.budget-summary-bar {
  display: flex;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-md);
}

.summary-item {
  text-align: center;
  flex: 1;
}

.summary-label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.summary-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.summary-value.spend { color: var(--color-danger); }
.summary-value.remain { color: var(--accent-green); }
.summary-value.over { color: var(--color-danger); }

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.toolbar-right {
  display: flex;
  gap: var(--space-sm);
}

.table-scroll {
  overflow-x: auto;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.budget-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  min-width: 1200px;
}

.budget-table th {
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
  background: var(--bg-tertiary);
}

.budget-table td {
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.budget-table tr:hover td {
  background: var(--bg-hover);
}

.row-num { color: var(--text-muted); font-size: var(--font-size-xs); }
.num-cell { text-align: right; font-variant-numeric: tabular-nums; }
.name-cell { font-weight: 500; }

.cat-badge {
  font-size: var(--font-size-xs);
  padding: 1px 6px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.priority-badge {
  font-size: var(--font-size-xs);
  white-space: nowrap;
}

.positive { color: var(--accent-green); }
.negative { color: var(--color-danger); }

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 2px 4px;
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}

.btn-icon:hover { opacity: 1; }
.btn-icon.danger:hover { color: var(--color-danger); }

tfoot td {
  font-weight: 600;
  border-top: 2px solid var(--border-color);
}
</style>
