import type { TouchChannel, TouchDirection } from "@/types"

interface Touch {
  channel: string
  direction: string
  touched_at: string
}

interface AccountPulseProps {
  touches: Touch[]
  width?: number
  height?: number
}

const CHANNEL_COLORS: Record<string, string> = {
  email: "#3B82F6",
  linkedin_message: "#0A66C2",
  linkedin_connect: "#4D9DE0",
  linkedin_inmail: "#0A66C2",
  call: "#10B981",
  voicemail: "#6EE7B7",
  sequence: "#8B5CF6",
  meeting_booked: "#4F46E5",
  meeting_held: "#4F46E5",
  referral: "#71717A",
}

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  linkedin_message: "LinkedIn DM",
  linkedin_connect: "LinkedIn Connect",
  linkedin_inmail: "LinkedIn InMail",
  call: "Call",
  voicemail: "Voicemail",
  sequence: "Sequence",
  meeting_booked: "Meeting Booked",
  meeting_held: "Meeting Held",
  referral: "Referral",
}

function relativeTime(isoStr: string): string {
  const diffMs = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function mostFrequent(channels: string[]): string {
  const freq: Record<string, number> = {}
  for (const c of channels) freq[c] = (freq[c] ?? 0) + 1
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
}

interface Cluster {
  x: number
  y: number
  count: number
  channel: string
  touchedAt: string
  channels: string[]
}

export function AccountPulse({ touches, width = 120, height = 32 }: AccountPulseProps) {
  const now = Date.now()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  const start = now - sevenDaysMs

  const PAD = 6
  const innerW = width - PAD * 2
  const innerH = height - PAD * 2

  const toX = (ts: number) => PAD + ((ts - start) / sevenDaysMs) * innerW
  const cy = height / 2

  // Filter to touches within the 7-day window
  const valid = touches
    .map((t) => ({ ...t, ts: new Date(t.touched_at).getTime() }))
    .filter((t) => t.ts >= start && t.ts <= now)
    .sort((a, b) => a.ts - b.ts)

  // Build clusters: group touches within ~6 hours of each other
  const SIX_HOURS = 6 * 60 * 60 * 1000
  const clusters: Cluster[] = []
  for (const touch of valid) {
    const last = clusters[clusters.length - 1]
    if (last && touch.ts - new Date(last.touchedAt).getTime() < SIX_HOURS) {
      last.count += 1
      last.channels.push(touch.channel)
      last.channel = mostFrequent(last.channels)
      // X position = average of cluster touch times
      last.x = toX(
        (new Date(last.touchedAt).getTime() * (last.count - 1) + touch.ts) / last.count
      )
    } else {
      clusters.push({
        x: toX(touch.ts),
        y: touch.direction === "outbound" ? height * 0.35 : height * 0.65,
        count: 1,
        channel: touch.channel,
        channels: [touch.channel],
        touchedAt: touch.touched_at,
      })
    }
  }

  // Gridlines: one per day boundary
  const gridLines: number[] = []
  for (let i = 1; i < 7; i++) {
    gridLines.push(toX(start + i * 24 * 60 * 60 * 1000))
  }

  // Tooltip content
  const totalCount = valid.length
  const lastTouch = valid[valid.length - 1]
  const channelBreakdown = Object.entries(
    valid.reduce<Record<string, number>>((acc, t) => {
      acc[t.channel] = (acc[t.channel] ?? 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .map(([ch, n]) => `${CHANNEL_LABELS[ch] ?? ch} ×${n}`)
    .join(", ")

  const tooltipText =
    totalCount === 0
      ? "No activity in last 7 days"
      : `${totalCount} touch${totalCount === 1 ? "" : "es"} · last ${relativeTime(lastTouch.touched_at)} · ${channelBreakdown}`

  if (valid.length === 0) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-label="No activity in last 7 days"
        style={{ overflow: "visible" }}
      >
        <title>{tooltipText}</title>
        {/* Dashed center line */}
        <line
          x1={PAD}
          y1={cy}
          x2={width - PAD}
          y2={cy}
          stroke="#A1A1AA"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text
          x={width / 2}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={7}
          fill="#A1A1AA"
          fontFamily="system-ui, sans-serif"
        >
          No activity 7d
        </text>
      </svg>
    )
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-label={tooltipText}
      style={{ overflow: "visible" }}
    >
      <title>{tooltipText}</title>

      {/* Day gridlines */}
      {gridLines.map((x, i) => (
        <line
          key={i}
          x1={x}
          y1={PAD}
          x2={x}
          y2={height - PAD}
          stroke="#E4E4E7"
          strokeWidth={0.5}
          opacity={0.5}
        />
      ))}

      {/* Center line */}
      <line
        x1={PAD}
        y1={cy}
        x2={width - PAD}
        y2={cy}
        stroke="#E4E4E7"
        strokeWidth={1}
      />

      {/* Touch clusters */}
      {clusters.map((cluster, i) => {
        const r = Math.min(3.5 * Math.sqrt(cluster.count), 12)
        const color = CHANNEL_COLORS[cluster.channel] ?? "#71717A"
        return (
          <circle
            key={i}
            cx={cluster.x}
            cy={cluster.y}
            r={r}
            fill={color}
            opacity={0.85}
          />
        )
      })}
    </svg>
  )
}
