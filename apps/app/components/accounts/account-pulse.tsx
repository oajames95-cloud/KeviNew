"use client"

import type { AccountTouch } from "@/types"

interface AccountPulseProps {
  touches: AccountTouch[]
  width?: number
  height?: number
}

// Channel color palette
const channelColors: Record<string, string> = {
  email: "#3B82F6",      // blue
  linkedin: "#0A66C2",   // dark blue
  call: "#10B981",       // green
  sequence: "#8B5CF6",   // purple
  meeting: "#4F46E5",    // indigo
  sms: "#F59E0B",        // amber
}

export function AccountPulse({ touches, width = 120, height = 32 }: AccountPulseProps) {
  // Filter touches to last 7 days
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const recentTouches = touches.filter(t => {
    const touchDate = new Date(t.timestamp)
    return touchDate >= sevenDaysAgo && touchDate <= now
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // If no touches in last 7 days, show empty state
  if (recentTouches.length === 0) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="inline-block">
        <line x1="5" y1={height / 2} x2={width - 5} y2={height / 2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
        <text x={width / 2} y={height / 2 + 4} fontSize="9" textAnchor="middle" fill="#9ca3af">
          No activity
        </text>
      </svg>
    )
  }

  const padding = 8
  const plotWidth = width - padding * 2
  const centreY = height / 2
  const verticalOffset = 6 // distance from centre line for inbound/outbound

  // Calculate x positions for each touch (time-based)
  const touchPositions = recentTouches.map(touch => {
    const touchDate = new Date(touch.timestamp)
    const daysOld = (now.getTime() - touchDate.getTime()) / (24 * 60 * 60 * 1000)
    const xPercent = (7 - daysOld) / 7 // normalize to 0-1, with today on right
    return {
      touch,
      x: padding + xPercent * plotWidth,
      daysOld,
    }
  })

  // Cluster nearby touches (within 6 hours)
  interface Cluster {
    touches: typeof recentTouches
    x: number
    radius: number
  }
  const clusters: Cluster[] = []
  const usedIndices = new Set<number>()

  touchPositions.forEach((pos, idx) => {
    if (usedIndices.has(idx)) return

    const cluster = [pos.touch]
    usedIndices.add(idx)
    const sixHoursMs = 6 * 60 * 60 * 1000

    touchPositions.forEach((other, otherIdx) => {
      if (otherIdx <= idx || usedIndices.has(otherIdx)) return
      const timeDiff = Math.abs(
        new Date(pos.touch.timestamp).getTime() - new Date(other.touch.timestamp).getTime()
      )
      if (timeDiff < sixHoursMs && Math.abs(pos.x - other.x) < 8) {
        cluster.push(other.touch)
        usedIndices.add(otherIdx)
      }
    })

    const avgX = cluster.reduce((sum, t) => {
      const tp = touchPositions.find(p => p.touch.id === t.id)
      return sum + (tp?.x || 0)
    }, 0) / cluster.length

    const radius = Math.min(6 + cluster.length - 1, 12)
    clusters.push({ touches: cluster, x: avgX, radius })
  })

  // Group touches by direction in each cluster
  const renderCluster = (cluster: Cluster) => {
    const outbound = cluster.touches.filter(t => t.direction === "outbound")
    const inbound = cluster.touches.filter(t => t.direction === "inbound")

    const elements: JSX.Element[] = []
    let key = 0

    // Outbound touches (above centre line)
    outbound.forEach((touch, idx) => {
      const angle = (idx - (outbound.length - 1) / 2) * 60
      const offsetX = Math.sin((angle * Math.PI) / 180) * cluster.radius * 0.6
      const offsetY = -Math.cos((angle * Math.PI) / 180) * verticalOffset

      elements.push(
        <circle
          key={`outbound-${key++}`}
          cx={cluster.x + offsetX}
          cy={centreY + offsetY}
          r={cluster.radius / 2}
          fill={channelColors[touch.channel] || "#6b7280"}
          opacity="0.8"
        />
      )
    })

    // Inbound touches (below centre line)
    inbound.forEach((touch, idx) => {
      const angle = (idx - (inbound.length - 1) / 2) * 60
      const offsetX = Math.sin((angle * Math.PI) / 180) * cluster.radius * 0.6
      const offsetY = Math.cos((angle * Math.PI) / 180) * verticalOffset

      elements.push(
        <circle
          key={`inbound-${key++}`}
          cx={cluster.x + offsetX}
          cy={centreY + offsetY}
          r={cluster.radius / 2}
          fill={channelColors[touch.channel] || "#6b7280"}
          opacity="0.5"
        />
      )
    })

    return elements
  }

  // Calculate channel breakdown for tooltip
  const channelBreakdown = recentTouches.reduce((acc, t) => {
    acc[t.channel] = (acc[t.channel] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const lastTouch = new Date(recentTouches[recentTouches.length - 1].timestamp)
  const timeSince = (() => {
    const hours = Math.floor((now.getTime() - lastTouch.getTime()) / (60 * 60 * 1000))
    if (hours < 1) return "now"
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
  })()

  const tooltipText = `${recentTouches.length} touches · last ${timeSince} · ${Object.entries(channelBreakdown)
    .map(([ch, count]) => `${count} ${ch}`)
    .join(", ")}`

  return (
    <div className="inline-block relative group">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="inline-block">
        {/* Day gridlines */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(day => {
          const x = padding + (day / 7) * plotWidth
          return (
            <line
              key={`grid-${day}`}
              x1={x}
              y1="0"
              x2={x}
              y2={height}
              stroke="#f3f4f6"
              strokeWidth="0.5"
            />
          )
        })}

        {/* Centre line */}
        <line x1={padding} y1={centreY} x2={width - padding} y2={centreY} stroke="#e5e7eb" strokeWidth="0.5" />

        {/* Render clusters */}
        {clusters.map((cluster, idx) => (
          <g key={`cluster-${idx}`}>
            {renderCluster(cluster)}
          </g>
        ))}
      </svg>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
        <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {tooltipText}
        </div>
      </div>
    </div>
  )
}
