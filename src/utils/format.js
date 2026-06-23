/**
 * 格式化金额为 ¥xxx 中文数字格式
 * @param {number|null|undefined} val
 * @returns {string}
 */
export function formatMoney(val) {
  if (val == null || isNaN(val) || !val) return '¥0'
  return '¥' + Number(val).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}
