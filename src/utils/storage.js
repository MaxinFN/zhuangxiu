/**
 * localStorage 工具：安全读取 JSON
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

/**
 * localStorage 工具：写入 JSON
 * @param {string} key
 * @param {*} value
 */
export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

/**
 * 生成简短唯一 ID
 * @returns {string}
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}
