import { useMemo, useState } from 'react'
import type { WeeklyPoint } from '../lib/volume'
import { formatWeekLabel } from '../lib/date'

interface Props {
  points: WeeklyPoint[]
  targetVolumeKg?: number
}

const WIDTH = 640
const HEIGHT = 260
const PAD_LEFT = 56
const PAD_RIGHT = 20
const PAD_TOP = 24
const PAD_BOTTOM = 36

function niceMax(value: number): number {
  if (value <= 0) return 100
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const normalized = value / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return step * magnitude
}

export function TrendChart({ points, targetVolumeKg }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const { path, areaPath, coords, yTicks, maxY } = useMemo(() => {
    const allValues = points.map((p) => p.volume).concat(targetVolumeKg ? [targetVolumeKg] : [])
    const rawMax = Math.max(...allValues, 1)
    const maxY = niceMax(rawMax * 1.15)
    const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT
    const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM

    const coords = points.map((p, i) => {
      const x = points.length === 1 ? PAD_LEFT + plotWidth / 2 : PAD_LEFT + (i / (points.length - 1)) * plotWidth
      const y = PAD_TOP + plotHeight - (p.volume / maxY) * plotHeight
      return { x, y, point: p }
    })

    const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
    const areaPath =
      coords.length > 0
        ? `${path} L ${coords[coords.length - 1].x.toFixed(1)} ${PAD_TOP + plotHeight} L ${coords[0].x.toFixed(1)} ${PAD_TOP + plotHeight} Z`
        : ''

    const tickCount = 4
    const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => (maxY / tickCount) * i)

    return { path, areaPath, coords, yTicks, maxY }
  }, [points, targetVolumeKg])

  if (points.length === 0) {
    return (
      <div className="card trend-chart-empty">
        <p className="muted">아직 기록이 없습니다. 이번 주 기록을 저장하면 추세 그래프가 나타납니다.</p>
      </div>
    )
  }

  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM
  const last = coords[coords.length - 1]
  const hovered = hoverIndex !== null ? coords[hoverIndex] : null
  const showEveryLabel = points.length <= 6

  return (
    <div className="card viz-root">
      <h2>주간 총 볼륨 추세</h2>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="주간 총 볼륨 추세 그래프"
        onMouseLeave={() => setHoverIndex(null)}
        onMouseMove={(e) => {
          const svg = e.currentTarget
          const rect = svg.getBoundingClientRect()
          const px = ((e.clientX - rect.left) / rect.width) * WIDTH
          let nearest = 0
          let nearestDist = Infinity
          coords.forEach((c, i) => {
            const d = Math.abs(c.x - px)
            if (d < nearestDist) {
              nearestDist = d
              nearest = i
            }
          })
          setHoverIndex(nearest)
        }}
      >
        {yTicks.map((t, i) => {
          const y = PAD_TOP + plotHeight - (t / maxY) * plotHeight
          return (
            <g key={i}>
              <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y} y2={y} className="gridline" />
              <text x={PAD_LEFT - 10} y={y} className="axis-label" textAnchor="end" dominantBaseline="middle">
                {Math.round(t).toLocaleString()}
              </text>
            </g>
          )
        })}

        <path d={areaPath} className="area-fill" />
        <path d={path} className="trend-line" fill="none" />

        {hovered && (
          <line
            x1={hovered.x}
            x2={hovered.x}
            y1={PAD_TOP}
            y2={PAD_TOP + plotHeight}
            className="crosshair"
          />
        )}

        {coords.map((c, i) => {
          const isLast = i === coords.length - 1
          const isHovered = i === hoverIndex
          return <circle key={i} cx={c.x} cy={c.y} r={isHovered || isLast ? 5 : 3} className="end-marker" />
        })}

        <text x={last.x} y={last.y - 12} className="end-label" textAnchor="end">
          {Math.round(last.point.volume).toLocaleString()}kg
        </text>

        {coords.map((c, i) => {
          if (!showEveryLabel && i !== 0 && i !== coords.length - 1) return null
          return (
            <text key={i} x={c.x} y={HEIGHT - PAD_BOTTOM + 20} className="axis-label" textAnchor="middle">
              {formatWeekLabel(c.point.weekStart)}
            </text>
          )
        })}
      </svg>

      {hovered && (
        <div
          className="chart-tooltip"
          style={{ left: `${(hovered.x / WIDTH) * 100}%`, top: `${(hovered.y / HEIGHT) * 100}%` }}
        >
          <div className="tooltip-value">{Math.round(hovered.point.volume).toLocaleString()}kg</div>
          <div className="tooltip-label">{formatWeekLabel(hovered.point.weekStart)}</div>
        </div>
      )}
    </div>
  )
}
