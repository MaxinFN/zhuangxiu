<template>
  <div class="markdown-viewer">
    <!-- 加载中 -->
    <div v-if="loading" class="md-loading">加载中...</div>

    <!-- 错误 -->
    <div v-else-if="error" class="md-error">
      <p>内容加载失败：{{ error }}</p>
    </div>

    <!-- 内容 -->
    <div v-else class="md-layout">
      <!-- 侧边目录导航 -->
      <nav v-if="headings.length > 1" class="md-toc">
        <div class="md-toc-title">目录</div>
        <a
          v-for="h in headings"
          :key="h.id"
          :href="`#${h.id}`"
          class="md-toc-item"
          :class="`md-toc-level-${h.level}`"
          @click.prevent="scrollTo(h.id)"
        >
          {{ h.text }}
        </a>
      </nav>

      <!-- Markdown 渲染内容 -->
      <article class="md-body" v-html="html"></article>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted } from 'vue'
import { useMarkdown } from '@/composables/useMarkdown'

const props = defineProps({
  content: { type: String, required: true },
})

const emit = defineEmits(['ready'])

const { html, frontmatter, headings, loading, error, parse } = useMarkdown()

onMounted(() => {
  parse(props.content)
  emit('ready', frontmatter.value)
})

watch(() => props.content, (newVal) => {
  if (newVal) {
    parse(newVal)
    emit('ready', frontmatter.value)
  }
})

function scrollTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  // 找到最近的滚动容器（.page-content），在其内部滚动
  const container = el.closest('.page-content')
  const headerHeight = 80
  if (container) {
    const offset = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
    container.scrollTo({ top: offset - headerHeight, behavior: 'smooth' })
  } else {
    // 回退：滚动 window
    const top = el.getBoundingClientRect().top + window.scrollY - headerHeight
    window.scrollTo({ top, behavior: 'smooth' })
  }
}
</script>

<style scoped>
.markdown-viewer {
  width: 100%;
}

.md-loading,
.md-error {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--text-muted);
}

.md-error {
  color: var(--color-danger);
}

.md-layout {
  display: flex;
  gap: var(--space-xl);
}

/* 目录 */
.md-toc {
  width: 200px;
  flex-shrink: 0;
  position: sticky;
  top: var(--space-lg);
  align-self: flex-start;
  max-height: calc(100vh - var(--header-height) - var(--space-2xl));
  overflow-y: auto;
  padding: var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.md-toc-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.md-toc-item {
  display: block;
  padding: 2px 0;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
  line-height: 1.5;
}

.md-toc-item:hover {
  color: var(--accent-warm);
}

.md-toc-level-1 { font-weight: 600; }
.md-toc-level-2 { padding-left: var(--space-sm); }
.md-toc-level-3 { padding-left: var(--space-md); }
.md-toc-level-4 { padding-left: var(--space-lg); }

/* 正文 */
.md-body {
  flex: 1;
  min-width: 0;
  line-height: 1.8;
  color: var(--text-primary);
}

/* Markdown 元素样式 */
.md-body :deep(h1) {
  font-size: var(--font-size-2xl);
  margin: var(--space-xl) 0 var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 2px solid var(--border-color);
}

.md-body :deep(h2) {
  font-size: var(--font-size-xl);
  margin: var(--space-lg) 0 var(--space-sm);
  color: var(--accent-warm);
}

.md-body :deep(h3) {
  font-size: var(--font-size-lg);
  margin: var(--space-md) 0 var(--space-sm);
}

.md-body :deep(h4) {
  font-size: var(--font-size-base);
  margin: var(--space-sm) 0;
  color: var(--text-secondary);
}

.md-body :deep(p) {
  margin: var(--space-sm) 0;
}

.md-body :deep(ul),
.md-body :deep(ol) {
  padding-left: var(--space-lg);
  margin: var(--space-sm) 0;
}

.md-body :deep(li) {
  margin: var(--space-xs) 0;
}

.md-body :deep(blockquote) {
  border-left: 3px solid var(--accent-amber);
  padding: var(--space-sm) var(--space-md);
  margin: var(--space-md) 0;
  background: var(--accent-amber-soft);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--text-secondary);
}

.md-body :deep(code) {
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.md-body :deep(pre) {
  background: #3D2E1F;
  color: #F5EDE3;
  padding: var(--space-md);
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: var(--space-md) 0;
}

.md-body :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.md-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: var(--space-md) 0;
  font-size: var(--font-size-sm);
}

.md-body :deep(th) {
  background: var(--bg-tertiary);
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  font-weight: 600;
  border: 1px solid var(--border-color);
}

.md-body :deep(td) {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--border-color);
}

.md-body :deep(tr:hover td) {
  background: var(--bg-hover);
}

.md-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: var(--space-xl) 0;
}

.md-body :deep(a) {
  color: var(--accent-warm);
  text-decoration: underline;
}

.md-body :deep(strong) {
  color: var(--text-primary);
}

.md-body :deep(input[type="checkbox"]) {
  margin-right: var(--space-xs);
  accent-color: var(--accent-warm);
}

@media (max-width: 768px) {
  .md-layout {
    flex-direction: column;
  }

  .md-toc {
    position: static;
    width: 100%;
    max-height: none;
  }
}
</style>
