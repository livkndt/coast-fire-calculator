<template>
  <div class="chart-panel">
    <h2 class="chart-panel__title">
      Portfolio projection
    </h2>

    <div class="chart-canvas">
      <Line
        :data="chartData"
        :options="chartOptions"
      />
    </div>

    <!-- Sensitivity slider -->
    <div class="chart-slider">
      <label
        class="chart-slider__label"
        for="retirementSlider"
      >
        Drag to change retirement age
      </label>
      <div class="chart-slider__track">
        <span class="chart-slider__bound">30</span>
        <input
          id="retirementSlider"
          v-model.number="store.inputs.retirementAge"
          type="range"
          min="30"
          max="85"
          step="1"
          class="chart-slider__input"
        >
        <span class="chart-slider__bound">85</span>
      </div>
      <div class="chart-slider__value">
        Retire at <strong>age {{ store.inputs.retirementAge }}</strong>
        &nbsp;·&nbsp; Coast number: <strong>{{ fmt(store.results.coastFireNumber) }}</strong>
      </div>
    </div>

    <!-- Legend: milestone key -->
    <div class="chart-legend">
      <span class="chart-legend__item chart-legend__item--coast">
        <span class="chart-legend__dot" />
        Coast FIRE reached
      </span>
      <span class="chart-legend__item chart-legend__item--retire">
        <span class="chart-legend__dot" />
        Retirement
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { useCalculatorStore } from '@/stores/calculator'
import { buildChartData } from '@/composables/useChartData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const store = useCalculatorStore()
const { rows, results } = storeToRefs(store)

const chartData = computed(() =>
  buildChartData(rows.value, results.value.coastFireNumber, results.value.fireNumber),
)

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  scales: {
    x: {
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { font: { size: 11 } },
    },
    y: {
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: {
        font: { size: 11 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: (value: any) => {
          const v = Number(value)
          if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}m`
          if (v >= 1_000)     return `£${(v / 1_000).toFixed(0)}k`
          return `£${v}`
        },
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: { boxWidth: 12, font: { size: 12 } },
    },
    tooltip: {
      callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: (items: any[]) => {
          const idx = items[0]?.dataIndex ?? 0
          const r = rows.value[idx]
          return r ? `Age ${r.age}  ·  ${r.year}` : items[0]?.label ?? ''
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        label: (item: any) => {
          const v = item.parsed?.y
          if (v === undefined || v === null) return ''
          const f = new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            maximumFractionDigits: 0,
          }).format(v)
          return `${item.dataset.label}: ${f}`
        },
      },
    },
  },
}))

function fmt(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<style scoped>
.chart-panel {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.chart-panel__title {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin: 0 0 1.25rem;
}

.chart-canvas {
  position: relative;
  height: 340px;
}

/* ── Sensitivity slider ──────────────────────────────────────────────── */

.chart-slider {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f3f4f6;
}

.chart-slider__label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.chart-slider__track {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chart-slider__bound {
  font-size: 0.8rem;
  color: #9ca3af;
  min-width: 20px;
  text-align: center;
}

.chart-slider__input {
  flex: 1;
  accent-color: #4f46e5;
  height: 4px;
  cursor: pointer;
}

.chart-slider__value {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #374151;
  text-align: center;
}

.chart-slider__value strong { color: #4f46e5; }

/* ── Milestone legend ────────────────────────────────────────────────── */

.chart-legend {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  justify-content: center;
}

.chart-legend__item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #6b7280;
}

.chart-legend__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.chart-legend__item--coast .chart-legend__dot { background: #10b981; }
.chart-legend__item--retire .chart-legend__dot { background: #f59e0b; }
</style>
