# 🏠 装修小白学习助手

面向刚买房业主、首次装修用户和自装人群的**系统化装修学习 + 实操工具**。零后端、纯前端，数据仅保存在本地浏览器。

## ✨ 功能

### 📖 装修流程学习（9 阶段 × 5 知识维度）

按装修真实顺序组织 9 个阶段，每阶段 5 类 Markdown 驱动的内容（总计 45 篇，约 150KB）：

| 阶段 | 内容覆盖 |
|------|---------|
| 前期准备 | 量房工具、装修模式（清包/半包/全包）、合同签订、设计规划 |
| 拆改与墙体 | 砌块规格、水泥/砂浆标准、植筋加固、结构安全法规 |
| 水电改造 | 电线规格与回路、PPR水管及管件、配电系统、开关插座规划 |
| 瓦工贴砖 | 防水涂料体系、瓷砖分类与选购、铺贴辅材、美缝材料 |
| 木工吊顶 | 轻钢龙骨系统、石膏板类型、柜体板材环保等级、封边工艺 |
| 油漆墙面 | 界面剂→石膏→腻子→底漆→面漆体系、乳胶漆标准、施工环境 |
| 安装阶段 | 橱柜材质与五金、室内门类型、卫浴洁具、地板选购 |
| 软装进场 | 沙发框架与面料、床垫类型、窗帘尺寸、家电能效标准 |
| 竣工验收 | 检测工具箱、室内空气质量标准（GB/T 18883）、逐项验收清单 |

每篇材料知识均包含：**规格参数、执行标准（GB/ISO）、品牌系列推荐、价格区间、选购检验方法**。

### 📊 仪表盘

- 4 统计卡片（装修进度 / 知识阅读 / 预算概览 / 工人联系）
- 9 阶段进度时间轴
- 最近学习追踪（自动记录）
- 预算速览（进度条 + 三栏数字）

### 💰 预算管理

- Excel 风格可编辑预算表（7 大分类）
- 预算 vs 实际支出对比
- Chart.js 饼图/柱状图可视化
- Excel 导入/导出（xlsx）

### 📦 材料清单

- 按阶段组织的材料 Checklist
- 品牌/规格/价格记录
- 与预算数据联动

### 👷 工人管理

- 8 大工种（水电工、瓦工、木工、油漆工等）
- 工人信息卡片 + 比价记录
- 联系记录追踪

### 🔧 工具功能

- **JSON 备份/导入**：一键导出全部数据，跨设备迁移
- **数据清除**：双确认防误删
- **备份提醒**：30 天未备份自动提醒

## 🛠 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Vue 3.4+（Composition API，`<script setup>`） |
| 构建 | Vite 5 |
| 路由 | Vue Router 4（Hash 模式） |
| 状态管理 | Pinia 2（6 个 Store） |
| UI 组件 | Element Plus 2 |
| 图表 | Chart.js 4 |
| Markdown 解析 | marked 12（自定义渲染器注入标题 ID + TOC 导航） |
| 表格处理 | SheetJS (xlsx) |
| 数据持久化 | localStorage（零后端） |
| 设计风格 | 暖色家居风（CSS 自定义属性） |

## 📁 项目结构

```
zhuangxiu/
├── content/stages/          # Markdown 内容（核心资产，45篇）
│   ├── preparation/         # 前期准备
│   ├── demolition/          # 拆改与墙体
│   ├── plumbing-electric/   # 水电改造
│   ├── tiling/              # 瓦工贴砖
│   ├── woodwork/            # 木工吊顶/柜体
│   ├── painting/            # 油漆/墙面
│   ├── installation/        # 安装阶段
│   ├── soft-furnishing/     # 软装进场
│   └── completion/          # 竣工验收
│       └── index.md / materials.md / craft.md / acceptance.md / pitfalls.md
├── src/
│   ├── views/               # 6 个路由页面
│   │   ├── DashboardView.vue
│   │   ├── WorkflowView.vue
│   │   ├── StageDetailView.vue
│   │   ├── BudgetView.vue
│   │   ├── MaterialsView.vue
│   │   └── WorkersView.vue
│   ├── components/
│   │   ├── layout/          # AppHeader / AppSidebar
│   │   ├── dashboard/       # StatsCards / ProgressTimeline
│   │   ├── stages/          # StageList / TaskChecklist / AcceptanceChecklist
│   │   ├── budget/          # BudgetTable / BudgetChart
│   │   ├── workers/         # WorkerList
│   │   └── shared/          # MarkdownViewer / ToastContainer
│   ├── stores/              # 6 个 Pinia Store
│   │   ├── progressStore.js # 阶段状态 + 任务勾选
│   │   ├── contentStore.js  # 阶段索引 + 阅读进度
│   │   ├── budgetStore.js   # 预算 CRUD + 统计
│   │   ├── workerStore.js   # 工人信息 + 联系记录
│   │   ├── materialStore.js # 材料清单
│   │   └── uiStore.js       # 侧边栏/Toast/面包屑
│   ├── composables/         # 组合式函数
│   │   ├── useMarkdown.js   # MD 解析 + frontmatter + TOC
│   │   └── useBackup.js     # JSON 导入/导出/清除
│   ├── router/index.js
│   ├── styles/              # 暖色设计系统 CSS 变量
│   ├── App.vue
│   └── main.js
├── vite.config.js
└── package.json
```

## 🚀 快速开始

### 开发环境要求

- **Node.js** ≥ 18.0（推荐 20 LTS）
- **npm** ≥ 9.0（Node.js 20 自带）或 **pnpm** ≥ 8.0
- 现代浏览器（Chrome / Firefox / Safari / Edge 最新两个大版本）

### 安装与运行

```bash
# 克隆项目
git clone <repo-url> && cd zhuangxiu

# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 🎨 设计系统

暖色家居风格，CSS 自定义属性贯穿全局：

- `--bg-primary: #FFF8F0`（米白主背景）
- `--accent-warm: #C67B5C`（陶土橙强调色）
- `--accent-green: #7D9B76`（鼠尾草绿——完成状态）
- `--accent-amber: #E8A849`（琥珀金——预算进度）
- `--radius-lg: 16px`（大圆角卡片）
- `--shadow-card: 0 2px 12px rgba(61,46,31,0.06)`（柔和阴影）

## 🔒 数据隐私

**所有数据仅保存在当前浏览器的 localStorage 中**，不会上传到任何服务器。更换设备或浏览器前请使用"备份数据"功能导出 JSON 文件。

## 📝 许可

MIT
