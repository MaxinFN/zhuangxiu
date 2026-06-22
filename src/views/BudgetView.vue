<template>
  <div class="budget-view">
    <!-- 房屋信息设置 -->
    <div class="card" style="margin-bottom: var(--space-lg);">
      <div class="card-header">
        <div class="card-title">🏡 基本信息</div>
      </div>
      <div class="house-setup">
        <div class="form-group">
          <label class="form-label">房屋面积（㎡）</label>
          <input
            type="number"
            class="form-input"
            :value="budgetStore.houseInfo.area"
            @change="e => budgetStore.updateHouseInfo({ area: Number(e.target.value) })"
            placeholder="例如：100"
            min="1"
          />
        </div>
        <div class="form-group">
          <label class="form-label">总预算（元）</label>
          <input
            type="number"
            class="form-input"
            :value="budgetStore.houseInfo.totalBudget"
            @change="e => budgetStore.updateHouseInfo({ totalBudget: Number(e.target.value) })"
            placeholder="例如：150000"
            min="0"
          />
        </div>
        <div class="form-group">
          <label class="form-label">装修档次参考</label>
          <div class="tier-badges">
            <span class="tier-badge" :class="{ active: budgetStore.houseInfo.totalBudget && budgetStore.houseInfo.area && budgetStore.houseInfo.totalBudget / budgetStore.houseInfo.area < 1000 }">
              经济型 ~800元/㎡
            </span>
            <span class="tier-badge" :class="{ active: budgetStore.houseInfo.totalBudget && budgetStore.houseInfo.area && budgetStore.houseInfo.totalBudget / budgetStore.houseInfo.area >= 1000 && budgetStore.houseInfo.totalBudget / budgetStore.houseInfo.area < 2000 }">
              舒适型 ~1500元/㎡
            </span>
            <span class="tier-badge" :class="{ active: budgetStore.houseInfo.totalBudget && budgetStore.houseInfo.area && budgetStore.houseInfo.totalBudget / budgetStore.houseInfo.area >= 2000 }">
              品质型 ~2500元/㎡+
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表 -->
    <BudgetChart />

    <!-- 表格 -->
    <div class="card">
      <BudgetTable @add="openAddModal" @edit="openEditModal" @import="handleImport" />
    </div>

    <!-- 添加/编辑弹窗 -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <div class="modal-title">{{ editingItem ? '编辑预算项目' : '添加预算项目' }}</div>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="budget-form-grid">
            <div class="form-group">
              <label class="form-label">一级分类 *</label>
              <select class="form-select" v-model="form.cat">
                <option v-for="c in budgetStore.categories" :key="c.key" :value="c.key">
                  {{ c.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">房间</label>
              <input class="form-input" v-model="form.room" placeholder="客厅、主卧、厨房">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label">项目名称 *</label>
              <input class="form-input" v-model="form.name" placeholder="例如：地砖铺贴、防水施工">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label">品牌型号</label>
              <input class="form-input" v-model="form.brand" placeholder="例如：马可波罗 600×600">
            </div>
            <div class="form-group">
              <label class="form-label">单位</label>
              <input class="form-input" v-model="form.unit" placeholder="㎡ / 套 / 个">
            </div>
            <div class="form-group">
              <label class="form-label">工程量</label>
              <input type="number" class="form-input" v-model.number="form.quantity" placeholder="0" min="0" step="0.01">
            </div>
            <div class="form-group">
              <label class="form-label">单价（元）</label>
              <input type="number" class="form-input" v-model.number="form.unitPrice" placeholder="0" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">预算总价（元）</label>
              <input type="number" class="form-input" v-model.number="form.budget" placeholder="自动计算或手填" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">实际支出（元）</label>
              <input type="number" class="form-input" v-model.number="form.actual" placeholder="0" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">优先级</label>
              <select class="form-select" v-model="form.priority">
                <option value="must">🔴 刚需不可省</option>
                <option value="optional">🟡 可减配</option>
                <option value="nice">🟢 锦上添花</option>
              </select>
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label">施工工艺 & 验收标准</label>
              <textarea class="form-textarea" v-model="form.craft" placeholder="施工要点和验收标准..." rows="2"></textarea>
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label">备注</label>
              <textarea class="form-textarea" v-model="form.note" placeholder="附加说明、供应商联系方式等" rows="2"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">取消</button>
          <button class="btn btn-primary" @click="saveItem">
            {{ editingItem ? '保存修改' : '添加' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useBudgetStore } from '@/stores/budgetStore'
import BudgetTable from '@/components/budget/BudgetTable.vue'
import BudgetChart from '@/components/budget/BudgetChart.vue'

const budgetStore = useBudgetStore()
const showModal = ref(false)
const editingItem = ref(null)

const form = reactive({
  cat: 'hardwork',
  room: '',
  name: '',
  brand: '',
  unit: '',
  quantity: 0,
  unitPrice: 0,
  budget: 0,
  actual: 0,
  priority: 'must',
  craft: '',
  note: '',
})

function resetForm() {
  Object.assign(form, {
    cat: 'hardwork', room: '', name: '', brand: '', unit: '',
    quantity: 0, unitPrice: 0, budget: 0, actual: 0,
    priority: 'must', craft: '', note: '',
  })
}

function openAddModal() {
  editingItem.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(item) {
  editingItem.value = item
  Object.assign(form, {
    cat: item.cat, room: item.room, name: item.name, brand: item.brand,
    unit: item.unit, quantity: item.quantity, unitPrice: item.unitPrice,
    budget: item.budget, actual: item.actual, priority: item.priority,
    craft: item.craft, note: item.note,
  })
  showModal.value = true
}

function saveItem() {
  if (!form.name.trim()) {
    alert('请输入项目名称')
    return
  }
  if (editingItem.value) {
    budgetStore.updateItem(editingItem.value.id, { ...form })
  } else {
    budgetStore.addItem({ ...form })
  }
  showModal.value = false
}

function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls,.csv'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const XLSX = window.XLSX
    if (!XLSX) return alert('Excel库未加载')
    try {
      const data = await file.arrayBuffer()
      const wb = XLSX.read(data)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws)

      const items = rows.map(row => ({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        cat: mapCatFromLabel(row['分类'] || ''),
        room: row['房间'] || '',
        name: row['项目名称'] || '',
        brand: row['品牌型号'] || '',
        unit: row['单位'] || '',
        quantity: parseFloat(row['工程量']) || 0,
        unitPrice: parseFloat(row['单价']) || 0,
        budget: parseFloat(row['预算总价']) || 0,
        actual: parseFloat(row['实际支出']) || 0,
        priority: 'must',
        craft: row['施工工艺'] || '',
        note: row['备注'] || '',
      }))

      budgetStore.importItems(items)
    } catch (e) {
      alert('导入失败：' + e.message)
    }
  }
  input.click()
}

function mapCatFromLabel(label) {
  const map = {
    '拆改/设计': 'demolition', '硬装施工': 'hardwork',
    '门窗设备': 'doors', '定制柜': 'custom',
    '厨卫五金': 'sanitary', '灯具家电': 'lighting', '软装家具': 'soft',
  }
  for (const [key, val] of Object.entries(map)) {
    if (label.includes(key)) return val
  }
  return 'hardwork'
}
</script>

<style scoped>
.house-setup {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-end;
  flex-wrap: wrap;
}

.tier-badges {
  display: flex;
  gap: var(--space-sm);
}

.tier-badge {
  font-size: var(--font-size-xs);
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: var(--bg-tertiary);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.tier-badge.active {
  background: var(--accent-warm-soft);
  color: var(--accent-warm);
  border-color: var(--accent-warm);
  font-weight: 600;
}

.budget-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}
</style>
