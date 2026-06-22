# 装修小白学习助手 — 设计与实施计划

## 背景

用户希望创建一个面向装修小白的学习+实操结合工具，类似 xyzz2508.xyz 但更侧重教育属性。目标用户：刚买房的业主、第一次装修的用户、自装用户。

## 核心决策汇总

| 决策项 | 选择 |
|--------|------|
| 产品定位 | 学习 + 实操工具结合 |
| 技术栈 | Vue 3.4+ (Composition API) + Vite + Pinia |
| 数据存储 | localStorage（零后端） |
| 内容策略 | Markdown 文件驱动（`content/stages/`） |
| 内容组织 | 按 9 个装修阶段组织 |
| 实操功能 | 进度跟踪+验收清单、预算管理、工人比价、材料清单 |
| 设计风格 | 暖色家居风（米白/奶油色 + 陶土橙/木色点缀） |
| UI 组件库 | Element Plus（中文生态好，上手快） |

---

## 一、项目文件结构

```
zhuangxiu/
├── public/
│   ├── favicon.ico
│   └── images/
├── content/                       # Markdown内容（核心资产）
│   └── stages/
│       ├── 01-preparation/        # 前期准备
│       ├── 02-demolition/         # 拆改与墙体新建
│       ├── 03-plumbing-electric/  # 水电改造
│       ├── 04-tiling/             # 瓦工贴砖
│       ├── 05-woodwork/           # 木工吊顶/柜体
│       ├── 06-painting/           # 油漆/墙面
│       ├── 07-installation/       # 安装阶段
│       ├── 08-soft-furnishing/    # 软装进场
│       └── 09-completion/         # 竣工验收
│       # 每个阶段下含:
│       # index.md (概述) / materials.md (材料) / craft.md (工艺)
│       # acceptance.md (验收) / pitfalls.md (避坑)
├── src/
│   ├── App.vue
│   ├── main.js
│   ├── router/index.js
│   ├── stores/                    # Pinia状态管理
│   │   ├── progressStore.js
│   │   ├── budgetStore.js
│   │   ├── workerStore.js
│   │   ├── materialStore.js
│   │   ├── contentStore.js
│   │   └── uiStore.js
│   ├── composables/               # 组合式函数
│   │   ├── useStorage.js          # localStorage封装
│   │   ├── useMarkdown.js         # MD解析+frontmatter
│   │   ├── useBackup.js           # 导入导出
│   │   └── useChart.js            # Chart.js封装
│   ├── components/
│   │   ├── layout/                # AppSidebar, AppHeader
│   │   ├── dashboard/             # StatsCards, ProgressTimeline
│   │   ├── stages/                # StageList, StageDetail, TaskChecklist, AcceptanceChecklist
│   │   ├── budget/                # BudgetTable, BudgetChart
│   │   ├── workers/               # WorkerList, WorkerCard
│   │   └── shared/                # MarkdownViewer, ToastContainer, ModalBase, BackupReminder
│   ├── views/
│   │   ├── DashboardView.vue
│   │   ├── WorkflowView.vue
│   │   ├── BudgetView.vue
│   │   └── WorkersView.vue
│   └── styles/
│       ├── variables.css          # 暖色CSS变量
│       ├── base.css
│       └── components.css
├── index.html
├── vite.config.js
└── package.json
```

---

## 二、页面与路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 仪表盘 | 总进度、预算概览、最近学习/活动 |
| `/workflow` | 装修流程 | 9阶段列表 + 学习内容 + 任务跟踪 |
| `/workflow/:stageId` | 阶段详情 | 材料/工艺/验收/避坑 4个子Tab |
| `/budget` | 预算管理 | Excel式表格 + 图表 + 材料联动 |
| `/workers` | 工人管理 | 工种列表 + 比价 + 沟通记录 |

---

## 三、整体布局

```
┌──────────────────────────────────────────────┐
│  侧边栏 (Sidebar)     │    主内容区 (Main)     │
│                       │                       │
│  🏠 Logo + 名称       │  ┌─ 页面标题 + 面包屑 ─┐│
│  ───────────────      │  │                    ││
│  📊 仪表盘            │  │  <router-view>     ││
│  📖 装修流程 · 学习    │  │                    ││
│  💰 预算管理           │  │   各页面内容区      ││
│  📦 材料清单           │  │                    ││
│  👷 工人管理           │  │                    ││
│  ───────────────      │  │                    ││
│  备份/导入/清除        │  └────────────────────┘│
│  ❤️ 支持作者          │                       │
└──────────────────────────────────────────────┘
```

---

## 四、数据流与状态管理

### Pinia Store 设计

```
stores/
├── progressStore    # 阶段进度 + 任务勾选 + 验收清单
├── budgetStore      # 预算表数据(数组) + 房屋信息
├── workerStore      # 工人信息数组 + 沟通记录
├── materialStore    # 材料清单勾选状态
├── contentStore     # Markdown内容索引 + 阅读进度
└── uiStore          # 侧边栏状态、Toast队列、弹窗状态
```

### localStorage 键设计

```js
reno_stage_status:     { stageId: 'completed'|'in-progress'|'locked' }
reno_task_status:      { taskId: true }
reno_acceptance:       { checkId: true }
reno_budget_v2:        [ ... ]   // 预算条目
reno_workers:          [ ... ]   // 工人列表
reno_call_records:     [ ... ]   // 沟通记录
reno_materials:        { materialId: true }
reno_house_info:       { area, totalBudget }
reno_reading_progress: { stageId: { materials: true, craft: true, ... } }
```

### 数据流

```
Markdown文件 ──→ Vite Glob Import ──→ contentStore ──→ MarkdownViewer
                                                          │
用户操作 ──→ Pinia Store ──→ localStorage (自动同步)      │
                │                    │                    │
                └──→ 响应式更新UI ←──┘                    │
                                                          │
用户勾选任务 ──→ progressStore ──→ 更新仪表盘统计 ←───────┘
```

---

## 五、Markdown 内容系统

- 使用 `marked` 解析 + `highlight.js` 代码高亮
- 每个 `.md` 文件支持 YAML frontmatter（title, stage, type, order）
- Vite `import.meta.glob` 在构建时收集所有内容文件
- `useMarkdown` composable 提供：解析MD、提取目录、交叉引用链接
- `MarkdownViewer` 组件：渲染内容 + 侧边目录导航 + 知识点间链接

---

## 六、暖色家居设计系统 (CSS Variables)

```css
:root {
  /* 背景 */
  --bg-primary: #FFF8F0;        /* 米白主背景 */
  --bg-secondary: #FFFDF9;      /* 卡片白 */
  --bg-tertiary: #F5EDE3;       /* 暖灰底 */

  /* 文字 */
  --text-primary: #3D2E1F;      /* 深棕主文字 */
  --text-secondary: #8B7355;    /* 暖灰次文字 */
  --text-muted: #B8A088;        /* 浅暖灰 */

  /* 强调色 */
  --accent-warm: #C67B5C;       /* 陶土橙 */
  --accent-wood: #B8956A;       /* 木色 */
  --accent-green: #7D9B76;      /* 鼠尾草绿 */
  --accent-amber: #E8A849;      /* 琥珀金 */

  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  /* 侧边栏 */
  --sidebar-width: 260px;
  --header-height: 64px;

  /* 字体 */
  --font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, sans-serif;

  /* 阴影 */
  --shadow-card: 0 2px 12px rgba(61, 46, 31, 0.06);
  --shadow-hover: 0 4px 20px rgba(61, 46, 31, 0.10);
}
```

---

## 七、实施计划（分阶段）

### Phase 1：项目脚手架
- `npm create vite@latest zhuangxiu -- --template vue`
- 安装依赖：`vue-router`, `pinia`, `element-plus`, `marked`, `highlight.js`, `chart.js`, `xlsx`
- 配置 Vite（路径别名、glob 导入）
- 搭建基础布局：AppSidebar + AppHeader + router-view
- 产出：可运行的空壳应用，侧边栏导航切换路由

### Phase 2：设计系统落地
- 编写 `variables.css`（暖色CSS变量）
- 编写 `base.css`（重置样式、排版）
- 配置 Element Plus 主题覆盖
- 产出：暖色主题全局生效

### Phase 3：内容系统
- 创建 `content/stages/01-preparation/` 作为模板样例（含5个MD文件）
- 实现 `useMarkdown` composable
- 实现 `MarkdownViewer` 组件
- 实现 `contentStore`
- 产出：可以渲染第一篇装修知识内容

### Phase 4：装修流程页
- `WorkflowView.vue` — 9阶段列表
- `StageList.vue` — 时间轴展示各阶段
- `StageDetail.vue` — 阶段详情页（材料/工艺/验收/避坑Tab切换）
- `TaskChecklist.vue` — 可勾选任务清单
- `AcceptanceChecklist.vue` — 验收清单
- `progressStore` — 进度状态持久化
- 产出：用户可以浏览装修流程、学习知识、勾选完成状态

### Phase 5：仪表盘
- `DashboardView.vue` — 组合所有统计组件
- `StatsCards.vue` — 4个统计卡片
- `ProgressTimeline.vue` — 阶段进度可视化
- 预算概览迷你图表
- 产出：首页展示装修全局进度

### Phase 6：预算管理
- `BudgetView.vue` + `BudgetTable.vue`（可编辑表格）
- `BudgetChart.vue`（饼图+柱状图）
- `budgetStore` — 预算CRUD + 计算属性（总计、差值）
- Excel 导入导出
- 产出：完整的预算管理功能

### Phase 7：工人管理
- `WorkersView.vue` + `WorkerList.vue` + `WorkerCard.vue`
- 报价对比、沟通记录
- `workerStore`
- 产出：工人比价管理功能

### Phase 8：材料清单
- 与预算/阶段联动
- `MaterialChecklist.vue`
- `materialStore`
- 产出：材料清单工具

### Phase 9：数据管理 & 打磨
- 备份/导入/清除功能
- 备份提醒
- Toast 通知系统
- 移动端响应式适配
- 产出：完整可用的产品

---

## 八、验证方式

1. `npm run dev` 启动开发服务器，确认无报错
2. 每个 Phase 完成后手动验证页面渲染、交互、数据持久化
3. 刷新页面验证 localStorage 数据不丢失
4. 备份导出 → 清除数据 → 导入恢复，验证数据完整性
5. 移动端视口验证响应式布局
