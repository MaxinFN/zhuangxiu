<template>
  <div class="budget-charts">
    <div class="chart-card card">
      <h3 class="chart-title">📊 分类占比（预算）</h3>
      <div class="chart-container">
        <canvas ref="pieCanvas"></canvas>
      </div>
    </div>
    <div class="chart-card card">
      <h3 class="chart-title">📈 预算 vs 实际</h3>
      <div class="chart-container">
        <canvas ref="barCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useBudgetStore } from '@/stores/budgetStore'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const budgetStore = useBudgetStore()
const pieCanvas = ref(null)
const barCanvas = ref(null)

let pieChart = null
let barChart = null

function renderCharts() {
  nextTick(() => {
    renderPieChart()
    renderBarChart()
  })
}

function renderPieChart() {
  if (pieChart) pieChart.destroy()
  if (!pieCanvas.value) return

  const stats = budgetStore.categoryStats
  const labels = Object.values(stats).map(s => s.label)
  const data = Object.values(stats).map(s => s.budget)
  const colors = Object.values(stats).map(s => s.color)

  pieChart = new Chart(pieCanvas.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: data.length ? data : [1],
        backgroundColor: data.length ? colors : ['#E8DDD0'],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 16, usePointStyle: true, font: { size: 11 } },
        },
      },
    },
  })
}

function renderBarChart() {
  if (barChart) barChart.destroy()
  if (!barCanvas.value) return

  const stats = budgetStore.categoryStats
  const labels = Object.values(stats).map(s => s.label)
  const budgetData = Object.values(stats).map(s => s.budget)
  const actualData = Object.values(stats).map(s => s.actual)

  barChart = new Chart(barCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '预算',
          data: budgetData,
          backgroundColor: '#C67B5C',
          borderRadius: 4,
        },
        {
          label: '实际',
          data: actualData,
          backgroundColor: '#7D9B76',
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 16, usePointStyle: true },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val) => '¥' + val.toLocaleString(),
          },
        },
      },
    },
  })
}

onMounted(renderCharts)
watch(() => budgetStore.items, renderCharts, { deep: true })
</script>

<style scoped>
.budget-charts {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.chart-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: var(--space-md);
}

.chart-container {
  height: 280px;
  position: relative;
}

@media (max-width: 768px) {
  .budget-charts {
    grid-template-columns: 1fr;
  }
}
</style>
