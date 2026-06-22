# AGENTS.md — 装修小白学习助手

AI 编码助手的项目上下文文件。详细的架构说明请参阅 [CLAUDE.md](./CLAUDE.md)。

## 项目概述

面向首次装修用户的系统化学习 + 实操工具。Vue 3.4+ SPA，零后端，localStorage 持久化，Markdown 内容驱动。

## 技术栈

Vue 3.4+ (Composition API + `<script setup>`) · Vite 5.4 · Vue Router 4 (Hash) · Pinia 2 · Element Plus 2.7 · Chart.js 4 · marked 12 · xlsx · Node ≥18.0

## 核心文件

| 路径 | 职责 |
|------|------|
| `src/App.vue` | 根布局（sidebar + header + page-content 滚动区） |
| `src/router/index.js` | 6 条路由（Hash 模式） |
| `src/stores/progressStore.js` | 阶段状态、任务勾选、`ensureInProgress()` |
| `src/stores/contentStore.js` | 阶段元数据、阅读进度 |
| `src/stores/uiStore.js` | 侧边栏、Toast、面包屑 |
| `src/composables/useMarkdown.js` | MD 解析 + 自定义 Renderer + TOC 提取 |
| `src/components/shared/MarkdownViewer.vue` | MD 渲染 + TOC 导航 + 容器内滚动 |
| `content/stages/*/` | 45 篇 MD（9 阶段 × 5 类型） |

## 关键约定

1. **MD 内容加载**: `import.meta.glob('/content/stages/**/*.md', { as: 'raw', eager: false })` → 精确匹配降级为模糊匹配
2. **标题 ID**: `generateId()` 在 useMarkdown 的 TOC 和 marked Renderer 中必须一致
3. **滚动**: `.page-content` 容器内滚动（非 window），`scrollTo()` 需计算容器相对偏移
4. **阶段状态**: 软解锁（全部可浏览），首次访问自动 `in-progress`
5. **CSS 变量**: `variables.css` 定义暖色系统，组件用 scoped 样式 + 变量
6. **引用**: `@/` → `src/`，`@content/` → `content/`
7. **localStorage**: 所有持久化键前缀 `reno_`

## 常用命令

```bash
npm run dev     # 启动 http://localhost:5173
npm run build   # 构建到 dist/
npm run preview # 预览生产构建
```
