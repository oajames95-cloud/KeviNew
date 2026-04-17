"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { DailyActivity } from "@/types"

interface ActivityTimelineProps {
  activity: DailyActivity[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-md">
      <p className="font-medium mb-2 text-foreground">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="font-mono font-semibold" style={{ color: entry.color }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ActivityTimeline({ activity }: ActivityTimelineProps) {
  const data = activity.map((a) => ({
    date: formatDate(a.date),
    Calls: a.callsDialed,
    Emails: a.emailsSent,
    "Focus (min)": a.focusBlockMinutes,
  }))

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Daily Activity Pattern</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Calls, emails, and focus blocks over the last 5 days
        </p>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barGap={2} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 10, paddingTop: "12px" }}
              iconType="square"
              iconSize={8}
            />
            <Bar dataKey="Calls" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Emails" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Focus (min)" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
