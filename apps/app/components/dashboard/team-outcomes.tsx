"use client"

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Cell } from "recharts"
import type { Rep } from "@/types"

interface TeamOutcomesProps {
  reps: Rep[]
}

export function TeamOutcomes({ reps }: TeamOutcomesProps) {
  // Prepare scatter plot data
  const scatterData = reps.map((rep) => {
    const meetings = rep.recentActivity.reduce((sum, day) => sum + day.meetingsBooked, 0)
    const prospectTime = rep.recentActivity.reduce((sum, day) => sum + day.timeProspecting, 0)
    const prospectingHours = prospectTime / 60

    return {
      x: prospectingHours,
      y: meetings,
      name: rep.name.split(" ")[0],
      fullName: rep.name,
      efficiency: meetings > 0 ? (meetings / Math.max(prospectingHours, 1)).toFixed(2) : 0,
      topRepSimilarity: rep.scores.topRepSimilarity,
      followUpDiscipline: rep.scores.followUpDiscipline,
    }
  })

  // Calculate medians for quadrant lines
  const medianProspecting = scatterData.length > 0 
    ? scatterData.map(d => d.x).sort((a, b) => a - b)[Math.floor(scatterData.length / 2)]
    : 0
  const medianMeetings = scatterData.length > 0
    ? scatterData.map(d => d.y).sort((a, b) => a - b)[Math.floor(scatterData.length / 2)]
    : 0

  // Categorize reps by quadrant
  const getQuadrantColor = (x: number, y: number) => {
    const highActivity = x >= medianProspecting
    const highOutcome = y >= medianMeetings

    if (highActivity && highOutcome) return "hsl(var(--success))" // Top-right: Efficient high performers
    if (highActivity && !highOutcome) return "hsl(var(--warning))" // Bottom-right: High activity, low outcome (needs coaching)
    if (!highActivity && highOutcome) return "hsl(var(--chart-2))" // Top-left: High outcome, low activity (anomaly/natural closer)
    return "hsl(var(--muted-foreground))" // Bottom-left: Low on both (at-risk)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const data = payload[0].payload
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="font-semibold text-foreground text-sm">{data.fullName}</p>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-muted-foreground">
            Prospecting: <span className="font-mono font-semibold text-primary">{data.x.toFixed(1)}h</span>
          </p>
          <p className="text-muted-foreground">
            Meetings: <span className="font-mono font-semibold text-success">{data.y}</span>
          </p>
          <p className="text-muted-foreground">
            Efficiency: <span className="font-mono font-semibold">{data.efficiency} meetings/h</span>
          </p>
          <p className="text-muted-foreground">
            Top Rep Match: <span className="font-mono font-semibold">{data.topRepSimilarity}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Team Performance Quadrants</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Prospecting hours vs. meetings booked: identify efficiency patterns and coaching needs
        </p>
      </div>

      <div className="p-5">
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
            {/* Quadrant background zones */}
            <defs>
              <pattern id="gridPattern" patternUnits="userSpaceOnUse" width="40" height="40">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.1" />
              </pattern>
            </defs>

            <CartesianGrid 
              strokeDasharray="0" 
              stroke="hsl(var(--border))" 
              opacity={0.15}
              vertical={true}
              horizontalPoints={[medianMeetings]}
              verticalPoints={[medianProspecting]}
            />

            {/* Reference lines at medians */}
            <ReferenceLine 
              x={medianProspecting} 
              stroke="hsl(var(--border))" 
              strokeDasharray="4 4"
              opacity={0.4}
            />
            <ReferenceLine 
              y={medianMeetings} 
              stroke="hsl(var(--border))" 
              strokeDasharray="4 4"
              opacity={0.4}
            />

            <XAxis 
              dataKey="x" 
              type="number"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))", opacity: 0.5 }}
              tickLine={false}
              label={{ value: "Prospecting Hours (5d avg)", position: "bottom", offset: 10, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              dataKey="y" 
              type="number"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))", opacity: 0.5 }}
              tickLine={false}
              label={{ value: "Meetings Booked (5d total)", angle: -90, position: "insideLeft", offset: -10, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent))", opacity: 0.1 }} />

            <Scatter 
              name="Rep Performance" 
              data={scatterData}
              fill="hsl(var(--primary))"
            >
              {scatterData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getQuadrantColor(entry.x, entry.y)}
                  opacity={0.8}
                />
              ))}
            </Scatter>

            {/* Rep name labels on points */}
            {scatterData.map((entry, index) => (
              <text
                key={`label-${index}`}
                x={0}
                y={0}
                fill="hsl(var(--foreground))"
                fontSize={10}
                fontWeight={500}
                textAnchor="middle"
                className="pointer-events-none"
              >
                {entry.name}
              </text>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Quadrant legend and coaching insights */}
      <div className="px-5 py-4 border-t border-border bg-muted/30 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-success" />
              <span className="font-semibold text-foreground">Efficient High Performers</span>
            </div>
            <p className="text-muted-foreground ml-4">High prospecting + high outcomes. Your baseline.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-warning" />
              <span className="font-semibold text-foreground">High Activity, Low Outcome</span>
            </div>
            <p className="text-muted-foreground ml-4">Needs coaching on prospecting quality or follow-up.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
              <span className="font-semibold text-foreground">Natural Closers</span>
            </div>
            <p className="text-muted-foreground ml-4">Low activity but high outcomes. Monitor burn-in risk.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
              <span className="font-semibold text-foreground">At-Risk</span>
            </div>
            <p className="text-muted-foreground ml-4">Low on both metrics. Requires immediate coaching.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
