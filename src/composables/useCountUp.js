import { ref, watch, onBeforeUnmount } from 'vue'

/**
 * 数字滚动动画 composable
 * @param {import('vue').Ref<number>|import('vue').ComputedRef<number>} source - 目标值
 * @param {object} options
 * @param {number} options.duration - 动画时长(ms)，默认 600
 * @param {boolean} options.format - 是否格式化（添加千分位），默认 false
 * @returns {import('vue').Ref<number|string>}
 */
export function useCountUp(source, { duration = 600, format = false } = {}) {
  const display = ref(typeof source.value === 'number' ? source.value : 0)
  let rafId = null
  let startTime = null
  let startVal = 0
  let targetVal = 0

  function animate(timestamp) {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1)

    // easeOutExpo - 自然减速
    const eased = progress === 1 ? 1 : 1 - Math.pow(1 - progress, 3)

    const current = Math.round(startVal + (targetVal - startVal) * eased)
    display.value = format ? current.toLocaleString() : current

    if (progress < 1) {
      rafId = requestAnimationFrame(animate)
    } else {
      // 确保最终值精确
      display.value = format ? targetVal.toLocaleString() : targetVal
    }
  }

  function startAnimation() {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    startTime = null
    startVal = typeof display.value === 'string' ? 0 : display.value
    targetVal = source.value || 0
    rafId = requestAnimationFrame(animate)
  }

  watch(source, () => {
    startAnimation()
  }, { immediate: true })

  onBeforeUnmount(() => {
    if (rafId) {
      cancelAnimationFrame(rafId)
    }
  })

  return display
}
