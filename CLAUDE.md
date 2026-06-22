# CLAUDE.md — 装修小白学习助手

## 项目概述

面向刚买房业主、首次装修用户和自装人群的**系统化装修学习 + 实操工具**。零后端、纯前端 SPA，数据仅保存在 localStorage。

## 技术栈

- **框架**: Vue 3.4+（Composition API + `<script setup>`）
- **构建**: Vite 5.4+（`@vitejs/plugin-vue`）
- **路由**: Vue Router 4（Hash 模式 `createWebHashHistory`）
- **状态**: Pinia 2（6 个 Store）
- **UI**: Element Plus 2.7（暖色主题覆盖），Chart.js 4
- **Markdown**: marked 12（自定义 Renderer 注入标题 ID）
- **表格**: SheetJS (xlsx)
- **Node**: ≥18.0，npm ≥9.0

## 项目结构

```
zhuangxiu/
├── content/stages/          # MD 内容（9 阶段 × 5 类型 = 45 篇，~154KB）
│   ├── preparation/         # index.md / materials.md / craft.md / acceptance.md / pitfalls.md
│   ├── demolition/ ... completion/  # 其余 8 阶段同上
├── src/
│   ├── views/               # 6 个路由页面（Dashboard / Workflow / StageDetail / Budget / Materials / Workers）
│   ├── components/
│   │   ├── layout/          # AppHeader / AppSidebar
│   │   ├── dashboard/       # StatsCards / ProgressTimeline
│   │   ├── stages/          # StageList / TaskChecklist / AcceptanceChecklist
│   │   ├── budget/          # BudgetTable / BudgetChart
│   │   ├── workers/         # WorkerList
│   │   └── shared/          # MarkdownViewer / ToastContainer
│   ├── stores/              # progressStore / contentStore / budgetStore / workerStore / materialStore / uiStore
│   ├── composables/         # useMarkdown / useBackup
│   ├── router/index.js
│   └── styles/              # variables.css（暖色设计系统）/ base.css / components.css
├── vite.config.js           # @ alias + @content alias + assetsInclude: ['**/*.md']
└── package.json
```

## 关键架构约定

### 数据流
```
MD 文件 ─→ import.meta.glob('{ as:"raw", eager:false }') ─→ loadContent() ─→ useMarkdown().parse() ─→ MarkdownViewer
用户操作 ─→ Pinia Store ─→ localStorage（自动持久化）──→ 响应式 UI
```

### 路由（Hash 模式）
| 路径 | 名称 | 组件 |
|------|------|------|
| `/` | dashboard | DashboardView |
| `/workflow` | workflow | WorkflowView → StageList |
| `/workflow/:stageId` | stage-detail | StageDetailView |
| `/budget` | budget | BudgetView |
| `/materials` | materials | MaterialsView |
| `/workers` | workers | WorkersView |

### localStorage 键（前缀 `reno_`）
`reno_stage_status` / `reno_task_status` / `reno_acceptance` / `reno_budget_v2` / `reno_workers` / `reno_call_records` / `reno_materials` / `reno_house_info` / `reno_reading_progress`

### 内容加载模式
- 使用 `import.meta.glob('/content/stages/**/*.md', { as: 'raw', eager: false })` 动态导入
- 路径构造: `/content/stages/${stageId}/${type}.md`
- 精确匹配失败时自动降级为模糊匹配（glob key 扫描）
- MD 文件含 YAML frontmatter（`stageId` / `type` / `order` / `title`）

### Markdown 渲染
- `src/composables/useMarkdown.js`：自定义 `marked.Renderer.heading` 注入 `id` 属性
- `generateId(text)`: 去特殊字符 → 小写 → 非字母/CJK 字符转连字符
- TOC 提取和 DOM 渲染使用**完全相同**的 `generateId()` 保证 ID 一致
- `MarkdownViewer.vue` 的 `scrollTo()` 在 `.page-content` 容器内滚动（非 window）

### 阶段解锁（已改为软解锁）
- `progressStore.isStageAccessible()` 始终返回 `true`
- `progressStore.ensureInProgress(stageId)`: 首次访问自动标记为 `in-progress`
- 状态: `locked`（未开始）→ `in-progress`（进行中）→ `completed`（已完成）
- 无硬锁定，所有阶段可自由浏览

### 布局
- `.app-container`: `height: 100vh; overflow: hidden`（固定高度，禁止 body 滚动）
- `.sidebar`: `height: 100vh`（独立滚动）
- `.page-content`: `flex: 1; overflow-y: auto`（主内容区内部滚动）
- 面包屑通过 `uiStore.setBreadcrumb([])` 动态注入 Header

### 设计系统
- CSS 变量定义在 `src/styles/variables.css`
- 暖色家居: `--bg-primary: #FFF8F0` / `--accent-warm: #C67B5C` / `--accent-green: #7D9B76`
- 圆角: `--radius-sm: 6px` / `--radius-md: 10px` / `--radius-lg: 16px`
- 侧边栏: `--sidebar-width: 250px` / `--sidebar-collapsed: 68px` / `--header-height: 64px`

## 编码约定

- Vue SFC 使用 `<script setup>` + Composition API
- 组件名 PascalCase，文件名 PascalCase
- Store 使用 Composition API 风格（`defineStore('name', () => { ... })`）
- CSS 使用 scoped 样式 + CSS 变量，不引入额外 CSS 框架
- 引用路径使用 `@/` alias（指向 `src/`）
- 新功能优先复用已有 composables 和 stores，避免重复逻辑

## 常用命令

```bash
npm run dev      # 开发 http://localhost:5173
npm run build    # 构建到 dist/
npm run preview  # 预览构建产物
```
