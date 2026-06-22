<template>
  <div class="workers-view">
    <WorkerList
      @add="openAddModal"
      @edit="openEditModal"
      @add-call="openCallModal"
    />

    <!-- 工人弹窗 -->
    <div class="modal-overlay" v-if="showWorkerModal" @click.self="showWorkerModal = false">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">{{ editingWorker ? '编辑工人信息' : '添加工人信息' }}</div>
          <button class="modal-close" @click="showWorkerModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">工种 *</label>
            <select class="form-select" v-model="workerForm.type">
              <option v-for="t in workerStore.workerTypes" :key="t.key" :value="t.key">
                {{ t.icon }} {{ t.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">姓名/称呼 *</label>
            <input class="form-input" v-model="workerForm.name" placeholder="例如：张师傅">
          </div>
          <div class="form-group">
            <label class="form-label">电话</label>
            <input class="form-input" v-model="workerForm.phone" placeholder="手机号码">
          </div>
          <div class="form-group">
            <label class="form-label">来源渠道</label>
            <input class="form-input" v-model="workerForm.source" placeholder="朋友推荐、小红书、物业推荐">
          </div>
          <div class="form-group">
            <label class="form-label">报价（元）</label>
            <input type="number" class="form-input" v-model.number="workerForm.quote" placeholder="0" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">备注</label>
            <textarea class="form-textarea" v-model="workerForm.notes" placeholder="包工包料、工期约2周等"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">印象评分</label>
            <div class="star-rating">
              <button v-for="n in 5" :key="n" class="star-btn"
                :class="{ filled: n <= workerForm.rating }"
                @click="workerForm.rating = n">★</button>
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
    <div class="modal-overlay" v-if="showCallModal" @click.self="showCallModal = false">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">📞 记录电话沟通 — {{ callTarget?.name }}</div>
          <button class="modal-close" @click="showCallModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">沟通日期</label>
            <input type="date" class="form-input" v-model="callForm.date">
          </div>
          <div class="form-group">
            <label class="form-label">沟通内容</label>
            <textarea class="form-textarea" v-model="callForm.content" placeholder="记录电话沟通的关键内容..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">对方报价（元）</label>
            <input type="number" class="form-input" v-model.number="callForm.quote" placeholder="0" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">附加条件</label>
            <input class="form-input" v-model="callForm.conditions" placeholder="包材料、工期15天、先付30%">
          </div>
          <div class="form-group">
            <label class="form-label">态度评价</label>
            <div class="star-rating">
              <button v-for="n in 5" :key="n" class="star-btn"
                :class="{ filled: n <= callForm.attitude }"
                @click="callForm.attitude = n">★</button>
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

const workerStore = useWorkerStore()

const showWorkerModal = ref(false)
const showCallModal = ref(false)
const editingWorker = ref(null)
const callTarget = ref(null)

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
  if (!workerForm.name.trim()) return alert('请输入姓名')
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
  if (!callForm.content.trim()) return alert('请输入沟通内容')
  workerStore.addCallRecord({
    workerId: callTarget.value.id,
    ...callForm,
  })
  showCallModal.value = false
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
