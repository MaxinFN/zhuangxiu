<template>
  <div class="workers-view">
    <WorkerList
      @add="openAddModal"
      @edit="openEditModal"
      @add-call="openCallModal"
      @delete="onRequestDelete"
    />

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      :visible="confirmVisible"
      type="danger"
      title="删除工人信息"
      :message="`确认删除「${confirmTarget?.name || '未命名'}」的所有信息？关联的通话记录也会一并删除。`"
      confirm-text="删除"
      @confirm="onDeleteConfirm"
      @cancel="confirmVisible = false"
    />

    <!-- 工人弹窗 -->
    <div v-if="showWorkerModal" class="modal-overlay" @click.self="showWorkerModal = false" @keydown.escape="showWorkerModal = false">
      <div class="modal" role="dialog" aria-modal="true" aria-label="工人信息表单">
        <div class="modal-header">
          <div class="modal-title">{{ editingWorker ? '编辑工人信息' : '添加工人信息' }}</div>
          <button class="modal-close" @click="showWorkerModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">工种 *</label>
            <select v-model="workerForm.type" class="form-select">
              <option v-for="t in workerStore.workerTypes" :key="t.key" :value="t.key">
                {{ t.icon }} {{ t.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">姓名/称呼 *</label>
            <input v-model="workerForm.name" class="form-input" :class="{ 'form-input--error': workerNameError }" placeholder="例如：张师傅" @input="workerNameError = ''">
            <span v-if="workerNameError" class="form-error">{{ workerNameError }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">电话</label>
            <input v-model="workerForm.phone" class="form-input" placeholder="手机号码">
          </div>
          <div class="form-group">
            <label class="form-label">来源渠道</label>
            <input v-model="workerForm.source" class="form-input" placeholder="朋友推荐、小红书、物业推荐">
          </div>
          <div class="form-group">
            <label class="form-label">报价（元）</label>
            <input v-model.number="workerForm.quote" type="number" class="form-input" placeholder="0" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">备注</label>
            <textarea v-model="workerForm.notes" class="form-textarea" placeholder="包工包料、工期约2周等"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">印象评分</label>
            <div class="star-rating">
              <button
                v-for="n in 5" :key="n" class="star-btn"
                :class="{ filled: n <= workerForm.rating }"
                :aria-label="`评分 ${n} 星`"
                @click="workerForm.rating = n"
              >
                ★
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showWorkerModal = false">取消</button>
          <button class="btn btn-primary" @click="saveWorker">
            {{ editingWorker ? '保存' : '添加' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 通话记录弹窗 -->
    <div v-if="showCallModal" class="modal-overlay" @click.self="showCallModal = false" @keydown.escape="showCallModal = false">
      <div class="modal" role="dialog" aria-modal="true" aria-label="通话记录表单">
        <div class="modal-header">
          <div class="modal-title">📞 记录电话沟通 — {{ callTarget?.name }}</div>
          <button class="modal-close" @click="showCallModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">沟通日期</label>
            <input v-model="callForm.date" type="date" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">沟通内容 *</label>
            <textarea v-model="callForm.content" class="form-textarea" :class="{ 'form-input--error': callContentError }" placeholder="记录电话沟通的关键内容..." @input="callContentError = ''"></textarea>
            <span v-if="callContentError" class="form-error">{{ callContentError }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">对方报价（元）</label>
            <input v-model.number="callForm.quote" type="number" class="form-input" placeholder="0" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">附加条件</label>
            <input v-model="callForm.conditions" class="form-input" placeholder="包材料、工期15天、先付30%">
          </div>
          <div class="form-group">
            <label class="form-label">态度评价</label>
            <div class="star-rating">
              <button
                v-for="n in 5" :key="n" class="star-btn"
                :class="{ filled: n <= callForm.attitude }"
                :aria-label="`态度评分 ${n} 星`"
                @click="callForm.attitude = n"
              >
                ★
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCallModal = false">取消</button>
          <button class="btn btn-primary" @click="saveCall">保存记录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useWorkerStore } from '@/stores/workerStore'
import WorkerList from '@/components/workers/WorkerList.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const workerStore = useWorkerStore()

const showWorkerModal = ref(false)
const showCallModal = ref(false)
const editingWorker = ref(null)
const callTarget = ref(null)

// 表单行内错误
const workerNameError = ref('')
const callContentError = ref('')

// 确认对话框
const confirmVisible = ref(false)
const confirmTarget = ref(null)

const workerForm = reactive({
  type: 'other', name: '', phone: '', source: '',
  quote: 0, notes: '', rating: 0,
})

const callForm = reactive({
  date: new Date().toISOString().slice(0, 10),
  content: '', quote: 0, conditions: '', attitude: 0,
})

function openAddModal(type) {
  editingWorker.value = null
  Object.assign(workerForm, {
    type, name: '', phone: '', source: '',
    quote: 0, notes: '', rating: 0,
  })
  showWorkerModal.value = true
}

function openEditModal(worker) {
  editingWorker.value = worker
  Object.assign(workerForm, {
    type: worker.type, name: worker.name, phone: worker.phone,
    source: worker.source, quote: worker.quote,
    notes: worker.notes, rating: worker.rating,
  })
  showWorkerModal.value = true
}

function saveWorker() {
  workerNameError.value = ''
  if (!workerForm.name.trim()) {
    workerNameError.value = '请输入姓名/称呼'
    return
  }
  if (editingWorker.value) {
    workerStore.updateWorker(editingWorker.value.id, { ...workerForm })
  } else {
    workerStore.addWorker({ ...workerForm })
  }
  showWorkerModal.value = false
}

function openCallModal(worker) {
  callTarget.value = worker
  Object.assign(callForm, {
    date: new Date().toISOString().slice(0, 10),
    content: '', quote: 0, conditions: '', attitude: 0,
  })
  showCallModal.value = true
}

function saveCall() {
  callContentError.value = ''
  if (!callForm.content.trim()) {
    callContentError.value = '请输入沟通内容'
    return
  }
  workerStore.addCallRecord({
    workerId: callTarget.value.id,
    ...callForm,
  })
  showCallModal.value = false
}

function onRequestDelete(worker) {
  confirmTarget.value = worker
  confirmVisible.value = true
}

function onDeleteConfirm() {
  if (confirmTarget.value) {
    workerStore.removeWorker(confirmTarget.value.id)
  }
  confirmVisible.value = false
  confirmTarget.value = null
}
</script>

<style scoped>
.star-rating {
  display: flex;
  gap: 2px;
}

.star-btn {
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--border-color);
  padding: 0 2px;
  transition: color var(--transition-fast);
}

.star-btn.filled {
  color: var(--accent-amber);
}
</style>
