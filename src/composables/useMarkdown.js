import { ref } from 'vue'
import { marked, Renderer } from 'marked'

/**
 * 生成标题 ID：去掉特殊字符，中文保留，空格转连字符
 * TOC 链接和 marked 渲染的 DOM id 必须使用完全相同的逻辑
 */
function generateId(text) {
  let cleaned = text
    .replace(/[`*_~[\]()（）【】《》、，。！？：；""''…—]/g, '')
    .toLowerCase()
    .replace(/[^\w一-鿿-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
  return cleaned || 'heading'
}

/**
 * 自定义 marked Renderer：为标题注入 id 属性
 * marked v12 中 heading 签名为 heading(htmlText, depth, rawText)
 * rawText 是未转义的纯文本，正好用于生成 ID
 */
const renderer = new Renderer()
const originalHeading = renderer.heading
renderer.heading = function (text, depth, raw) {
  const id = generateId(raw || text)
  return `<h${depth} id="${id}">${text}</h${depth}>\n`
}

marked.setOptions({
  breaks: true,
  gfm: true,
  renderer,
})

/**
 * 解析 Markdown 文件原始内容
 * @param {string} raw - 原始 MD 字符串（含 frontmatter）
 */
export function useMarkdown() {
  const html = ref('')
  const frontmatter = ref({})
  const headings = ref([])
  const loading = ref(false)
  const error = ref(null)

  function parseFrontmatter(raw) {
    const fm = {}
    const match = raw.match(/^---\n([\s\S]*?)\n---\n?/)
    if (!match) return { fm, content: raw }

    const fmText = match[1]
    fmText.split('\n').forEach(line => {
      const colonIdx = line.indexOf(':')
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim()
        let value = line.slice(colonIdx + 1).trim()
        if (value === 'true') value = true
        else if (value === 'false') value = false
        else if (!isNaN(value) && value !== '') value = Number(value)
        fm[key] = value
      }
    })

    const content = raw.slice(match[0].length)
    return { fm, content }
  }

  /**
   * 提取标题生成 TOC 目录，使用与 renderer 完全相同的 generateId
   */
  function extractHeadings(mdText) {
    const h = []
    const lines = mdText.split('\n')
    lines.forEach(line => {
      const match = line.match(/^(#{1,4})\s+(.+)/)
      if (match) {
        const rawText = match[2].trim()
        // 去掉行内 markdown 格式标记得到纯文本
        const plainText = rawText.replace(/[`*_~[\]()]/g, '').trim()
        const id = generateId(plainText)
        h.push({
          level: match[1].length,
          text: plainText,
          id,
        })
      }
    })
    return h
  }

  function parse(raw) {
    loading.value = true
    error.value = null
    try {
      const { fm, content } = parseFrontmatter(raw)
      frontmatter.value = fm
      headings.value = extractHeadings(content)
      html.value = marked.parse(content)
    } catch (e) {
      error.value = e.message
      html.value = ''
      frontmatter.value = {}
      headings.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    html,
    frontmatter,
    headings,
    loading,
    error,
    parse,
  }
}
