import type { ProjectionRow } from '@/core/projection'

export interface ProjectionDataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
  fill: boolean
  tension: number
  borderWidth: number
  borderDash?: number[]
  pointRadius: number | number[]
  pointBackgroundColor?: string | string[]
}

export interface ProjectionChartData {
  labels: string[]
  datasets: ProjectionDataset[]
}

/**
 * Transforms a projection row array into Chart.js-compatible dataset config.
 *
 * Three datasets are produced:
 *  [0] Portfolio total value (filled line)
 *  [1] Coast FIRE number (flat dashed reference line)
 *  [2] FIRE number (flat dashed reference line)
 *
 * Key milestones (first coasted row, retirement row) are highlighted with a
 * larger point radius on the portfolio line.
 */
export function buildChartData(
  rows: ProjectionRow[],
  coastFireNumber: number,
  fireNumber: number,
): ProjectionChartData {
  if (rows.length === 0) return { labels: [], datasets: [] }

  const n = rows.length
  const labels = rows.map(r => `Age ${r.age}`)

  // ── Point highlights ────────────────────────────────────────────────────

  const coastIndex     = rows.findIndex(r => r.coastReached)
  const retirementIndex = rows.findIndex(r => r.isRetirementYear)

  const pointRadii = Array<number>(n).fill(0)
  const pointColors = Array<string>(n).fill('#4f46e5')

  if (coastIndex !== -1) {
    pointRadii[coastIndex]  = 7
    pointColors[coastIndex] = '#10b981'  // green
  }
  if (retirementIndex !== -1) {
    pointRadii[retirementIndex]  = 7
    pointColors[retirementIndex] = '#f59e0b'  // amber
  }

  const flat = (v: number) => Array<number>(n).fill(v)

  // ── Datasets ────────────────────────────────────────────────────────────

  return {
    labels,
    datasets: [
      {
        label: 'Portfolio value',
        data: rows.map(r => r.totalValue),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79,70,229,0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: pointRadii,
        pointBackgroundColor: pointColors,
      },
      {
        label: 'Coast FIRE number',
        data: flat(coastFireNumber),
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0,
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
      },
      {
        label: 'FIRE number',
        data: flat(fireNumber),
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0,
        borderWidth: 2,
        borderDash: [4, 4],
        pointRadius: 0,
      },
    ],
  }
}
