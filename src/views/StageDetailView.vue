<template>
  <div v-if="stage" class="stage-detail">
    <!-- 阶段头部 -->
    <div class="stage-hero">
      <div class="stage-hero-info">
        <h1>{{ stage.icon }} {{ stage.name }}</h1>
        <p class="stage-hero-duration">⏱ 预计工期：{{ stage.duration }}</p>
        <div class="stage-hero-actions">
          <button
            v-if="progressStore.getStageStatus(stage.id) === 'in-progress'"
            class="btn btn-secondary"
            @click="completeStage"
          >
            ✅ 标记完成
          </button>
          <span v-else-if="progressStore.getStageStatus(stage.id) === 'completed'" class="stage-completed-badge">
            ✅ 已完成
          </span>
        </div>
      </div>
      <div class="stage-hero-progress">
        <div class="hero-stat">
          <span class="hero-stat-value">{{ doneTasks }}/{{ totalTasks }}</span>
          <span class="hero-stat-label">任务完成</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-value">{{ contentStore.getStageReadCount(stage.id) }}/4</span>
          <span class="hero-stat-label">知识已读</span>
        </div>
      </div>
    </div>

    <!-- 内容Tab -->
    <div class="content-tabs" role="tablist" :aria-label="`${stage?.name || ''}内容标签`">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="content-tab"
        :class="{
          active: activeTab === tab.key,
          read: contentStore.isRead(stage.id, tab.key),
        }"
        role="tab"
        :aria-selected="activeTab === tab.key"
        @click="switchTab(tab.key)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="contentStore.isRead(stage.id, tab.key)" class="tab-read">✓</span>
      </button>
    </div>

    <!-- Tab内容 -->
    <div class="content-area">
      <div v-if="tabLoading" class="tab-loading">加载内容中...</div>
      <div v-else-if="tabError" class="tab-error">{{ tabError }}</div>
      <template v-else>
        <!-- 概述Tab -->
        <div v-if="activeTab === 'index'">
          <div class="card">
            <MarkdownViewer :content="currentMdContent" @ready="onMdReady" />
          </div>

          <!-- 本阶段任务清单 -->
          <div class="card" style="margin-top: var(--space-lg);">
            <Checklist
              title="📋 本阶段任务"
              :items="stageTasks"
              mode="task"
            />
          </div>
        </div>

        <!-- 知识Tab (材料/工艺/验收/避坑) -->
        <div v-else class="card">
          <MarkdownViewer :content="currentMdContent" @ready="onContentReady" />
        </div>
      </template>
    </div>

    <!-- 返回顶部 -->
    <button
      v-show="showBackTop"
      class="back-to-top"
      title="返回顶部"
      aria-label="返回页面顶部"
      @click="scrollToTop"
    >
      ↑
    </button>
  </div>

  <!-- 阶段未找到 -->
  <div v-else class="empty-state">
    <div class="empty-state-icon">🤷</div>
    <div class="empty-state-text">未找到该阶段</div>
    <router-link to="/workflow" class="btn btn-secondary" style="margin-top: var(--space-md);">
      返回装修流程
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useContentStore } from '@/stores/contentStore'
import { useProgressStore } from '@/stores/progressStore'
import { useUiStore } from '@/stores/uiStore'
import MarkdownViewer from '@/components/shared/MarkdownViewer.vue'
import Checklist from '@/components/stages/Checklist.vue'

const route = useRoute()
const contentStore = useContentStore()
const progressStore = useProgressStore()
const uiStore = useUiStore()

const activeTab = ref('index')
const tabLoading = ref(false)
const tabError = ref('')
const currentMdContent = ref('')
const showBackTop = ref(false)

let scrollContainer = null

function onPageScroll() {
  showBackTop.value = scrollContainer ? scrollContainer.scrollTop > 300 : false
}

function scrollToTop() {
  if (scrollContainer) {
    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const stage = computed(() =>
  contentStore.stageList.find(s => s.id === route.params.stageId)
)

const tabs = [
  { key: 'index', label: '概述', icon: '📖' },
  { key: 'materials', label: '材料', icon: '🧱' },
  { key: 'craft', label: '工艺', icon: '🔧' },
  { key: 'acceptance', label: '验收', icon: '✅' },
  { key: 'pitfalls', label: '避坑', icon: '⚠️' },
]

// 各阶段任务清单
const tasksMap = {
  preparation: [
    { id: 'prep-t1', text: '实地量房并绘制户型图' },
    { id: 'prep-t2', text: '确定装修风格和需求清单' },
    { id: 'prep-t3', text: '制定装修预算总框架' },
    { id: 'prep-t4', text: '选择装修模式（清包/半包/全包）' },
    { id: 'prep-t5', text: '寻找并对比装修公司或施工队（至少3家）' },
    { id: 'prep-t6', text: '签订装修合同（明确工期、材料、付款方式）' },
    { id: 'prep-t7', text: '办理小区装修许可证' },
    { id: 'prep-t8', text: '与邻居提前沟通装修时间' },
  ],
  demolition: [
    { id: 'dem-t1', text: '确认拆除范围，标注承重墙位置' },
    { id: 'dem-t2', text: '做好保留设施的保护（门、窗、水电管口封堵）' },
    { id: 'dem-t3', text: '拆除非承重墙，清理建筑垃圾' },
    { id: 'dem-t4', text: '铲除旧墙皮到水泥砂浆层' },
    { id: 'dem-t5', text: '新建隔墙（植筋+砌砖+挂网+抹灰）' },
    { id: 'dem-t6', text: '新建墙体养护3-7天' },
    { id: 'dem-t7', text: '验收：确认墙体垂直、平整、无空鼓' },
  ],
  'plumbing-electric': [
    { id: 'pe-t1', text: '水电定位：用粉笔在墙上画出所有插座/开关/水嘴位置' },
    { id: 'pe-t2', text: '确认各回路分配（照明、插座、厨卫、空调独立回路）' },
    { id: 'pe-t3', text: '墙面开槽、铺设线管水管' },
    { id: 'pe-t4', text: '穿线布线，强弱电分离（间距≥300mm）' },
    { id: 'pe-t5', text: '水管焊接，冷热水管区分' },
    { id: 'pe-t6', text: '水管打压测试（0.8MPa，30分钟压降<0.05MPa）' },
    { id: 'pe-t7', text: '电路摇表测试（绝缘电阻≥0.5MΩ）' },
    { id: 'pe-t8', text: '拍照留底：所有墙面管线走向' },
    { id: 'pe-t9', text: '验收通过后封槽' },
  ],
  tiling: [
    { id: 'til-t1', text: '卫生间/阳台/厨房防水施工（≥2遍）' },
    { id: 'til-t2', text: '闭水试验48小时，到楼下邻居家检查' },
    { id: 'til-t3', text: '瓷砖预排版，避免窄条砖' },
    { id: 'til-t4', text: '铺贴墙砖（厨卫墙面）' },
    { id: 'til-t5', text: '铺贴地砖（全屋）' },
    { id: 'til-t6', text: '地漏安装（回字形切割，确保最低点）' },
    { id: 'til-t7', text: '过门石/窗台石安装' },
    { id: 'til-t8', text: '验收：空鼓检查、平整度、坡度测试' },
    { id: 'til-t9', text: '美缝施工（可后期做）' },
  ],
  woodwork: [
    { id: 'woo-t1', text: '吊顶弹线定位，确定下吊高度' },
    { id: 'woo-t2', text: '安装吊杆+轻钢龙骨' },
    { id: 'woo-t3', text: '封石膏板（转角L型整板）' },
    { id: 'woo-t4', text: '石膏板接缝处理+螺丝防锈漆' },
    { id: 'woo-t5', text: '窗帘盒制作（预留宽度≥150mm）' },
    { id: 'woo-t6', text: '背景墙造型打底' },
    { id: 'woo-t7', text: '现场柜体制作（如有）' },
    { id: 'woo-t8', text: '验收：龙骨间距、板面平整、转角整板检查' },
  ],
  painting: [
    { id: 'pai-t1', text: '墙面基层处理：刷界面剂/墙固' },
    { id: 'pai-t2', text: '阴阳角安装护角条' },
    { id: 'pai-t3', text: '第一遍腻子（找平）+ 干燥打磨' },
    { id: 'pai-t4', text: '第二遍腻子（整体找平）+ 干燥打磨' },
    { id: 'pai-t5', text: '第三遍腻子（精细收光）+ 精细打磨' },
    { id: 'pai-t6', text: '刷底漆（1遍）' },
    { id: 'pai-t7', text: '刷面漆（2遍），关窗阴干' },
    { id: 'pai-t8', text: '验收：灯光侧照无波浪纹，无色差，分色线清晰' },
  ],
  installation: [
    { id: 'ins-t1', text: '橱柜柜体安装+水平调整' },
    { id: 'ins-t2', text: '橱柜台面复尺+安装+挡水条' },
    { id: 'ins-t3', text: '室内门安装（门框→门扇→门锁→门吸）' },
    { id: 'ins-t4', text: '地板铺设（防潮膜+地垫+地板+踢脚线）' },
    { id: 'ins-t5', text: '马桶安装+24小时禁用法兰圈固定' },
    { id: 'ins-t6', text: '浴室柜+花洒+浴霸安装' },
    { id: 'ins-t7', text: '开关面板+全屋灯具安装' },
    { id: 'ins-t8', text: '热水器+烟机灶具安装' },
    { id: 'ins-t9', text: '验收：所有器具运转正常，无漏水漏电' },
  ],
  'soft-furnishing': [
    { id: 'soft-t1', text: '大件家具进场（沙发、床、餐桌椅）' },
    { id: 'soft-t2', text: '窗帘安装（确认落地长度或窗台高度）' },
    { id: 'soft-t3', text: '大家电进场（电视、冰箱、洗衣机、空调）' },
    { id: 'soft-t4', text: '装饰布置（挂画、地毯、绿植、摆件）' },
    { id: 'soft-t5', text: '灯光调整（色温统一，层次照明）' },
    { id: 'soft-t6', text: '验收：检查家具稳固、无划痕，动线通畅' },
  ],
  completion: [
    { id: 'com-t1', text: '逐项验收：墙面、地面、门窗、水电、厨卫' },
    { id: 'com-t2', text: '记录问题并制作整改清单（拍照+标注）' },
    { id: 'com-t3', text: '施工方限期整改' },
    { id: 'com-t4', text: '复验：确认所有问题已整改' },
    { id: 'com-t5', text: '甲醛检测（CMA机构或自测）' },
    { id: 'com-t6', text: '开荒保洁' },
    { id: 'com-t7', text: '整理归档：水电照片、保修卡、说明书、合同' },
    { id: 'com-t8', text: '结算尾款，签字确认' },
  ],
}

const stageTasks = computed(() => tasksMap[route.params.stageId] || [])

const totalTasks = computed(() => stageTasks.value.length)
const doneTasks = computed(() =>
  stageTasks.value.filter(t => progressStore.isTaskDone(t.id)).length
)

// 内容加载：使用 Vite 5 原生 raw 导入
const mdModules = import.meta.glob('/content/stages/**/*.md', { as: 'raw', eager: false })

async function loadContent(stageId, type) {
  tabLoading.value = true
  tabError.value = ''
  try {
    const filePath = type === 'index'
      ? `/content/stages/${stageId}/index.md`
      : `/content/stages/${stageId}/${type}.md`

    // 尝试精确匹配，如果找不到则尝试模糊匹配
    let loader = mdModules[filePath]
    if (!loader) {
      // 某些 Vite 版本 glob key 格式可能不同，尝试查找包含 stageId 和 type 的 key
      const fallbackKey = Object.keys(mdModules).find(k =>
        k.includes(`${stageId}/`) && k.endsWith(`${type}.md`)
      )
      if (fallbackKey) loader = mdModules[fallbackKey]
    }

    if (!loader) {
      currentMdContent.value = `# 内容建设中\n\n该阶段的${getTabLabel(type)}内容正在编写中，敬请期待。`
      tabLoading.value = false
      return
    }
    currentMdContent.value = await loader()
  } catch (e) {
    console.error('MD load error:', e)
    tabError.value = `内容加载失败：${e.message}`
    currentMdContent.value = ''
  } finally {
    tabLoading.value = false
  }
}

function getTabLabel(key) {
  const t = tabs.find(t => t.key === key)
  return t ? t.label : key
}

function switchTab(key) {
  activeTab.value = key
  if (stage.value) {
    loadContent(stage.value.id, key)
  }
  // 切换tab后回到顶部，重置按钮状态
  scrollToTop()
}

function onMdReady(fm) {
  // 概述内容加载完成
}

function onContentReady(fm) {
  // 知识内容加载完成，标记已读
  if (stage.value && activeTab.value !== 'index') {
    contentStore.markRead(stage.value.id, activeTab.value)
  }
}

function completeStage() {
  progressStore.setStageStatus(stage.value.id, 'completed')
}

function updateBreadcrumb(s) {
  uiStore.setBreadcrumb([
    { label: '装修流程', icon: '📖', to: '/workflow' },
    { label: s.name, icon: s.icon },
  ])
}

// 初始加载
onMounted(() => {
  scrollContainer = document.querySelector('.page-content')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', onPageScroll, { passive: true })
  }
  if (stage.value) {
    updateBreadcrumb(stage.value)
    progressStore.ensureInProgress(stage.value.id)
    loadContent(stage.value.id, 'index')
  }
})

onBeforeUnmount(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', onPageScroll)
    scrollContainer = null
  }
  uiStore.setBreadcrumb([])
})

watch(() => route.params.stageId, (newId) => {
  if (newId) {
    activeTab.value = 'index'
    const s = contentStore.stageList.find(s => s.id === newId)
    if (s) {
      updateBreadcrumb(s)
      progressStore.ensureInProgress(s.id)
    }
    loadContent(newId, 'index')
  }
})
</script>

<style scoped>
.stage-detail {
  max-width: 960px;
  margin: 0 auto;
}

/* 阶段头部 */
.stage-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-card);
}

.stage-hero-info h1 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-sm);
}

.stage-hero-duration {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-bottom: var(--space-md);
}

.stage-hero-actions {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.stage-completed-badge {
  font-size: var(--font-size-sm);
  color: var(--accent-green);
  font-weight: 600;
  padding: var(--space-xs) var(--space-sm);
  background: var(--accent-green-soft);
  border-radius: var(--radius-sm);
}

.stage-hero-progress {
  display: flex;
  gap: var(--space-xl);
}

.hero-stat {
  text-align: center;
}

.hero-stat-value {
  display: block;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--accent-warm);
}

.hero-stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

/* Tab导航 */
.content-tabs {
  display: flex;
  gap: 0;
  margin-bottom: var(--space-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.content-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: none;
  border: none;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
  position: relative;
}

.content-tab:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.content-tab.active {
  background: var(--accent-warm-soft);
  color: var(--accent-warm);
  font-weight: 600;
}

.content-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-warm);
  border-radius: 3px 3px 0 0;
}

.content-tab.read {
  color: var(--accent-green);
}

.tab-read {
  font-size: var(--font-size-xs);
  color: var(--accent-green);
}

/* 内容区 */
.content-area {
  min-height: 400px;
}

.tab-loading,
.tab-error {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--text-muted);
}

.tab-error {
  color: var(--color-danger);
}

/* 返回顶部 */
.back-to-top {
  position: fixed;
  bottom: var(--space-xl);
  right: var(--space-xl);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-card);
  color: var(--accent-warm);
  font-size: var(--font-size-xl);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  z-index: 100;
  font-family: inherit;
  line-height: 1;
}

.back-to-top:hover {
  background: var(--accent-warm);
  color: #fff;
  border-color: var(--accent-warm);
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .stage-hero {
    flex-direction: column;
    gap: var(--space-lg);
  }

  .content-tabs {
    flex-wrap: wrap;
  }

  .content-tab {
    flex: 1 1 auto;
    min-width: 33%;
  }
}
</style>
