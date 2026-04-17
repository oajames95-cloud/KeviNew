"use client"

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import type { TopCohortBenchmark, PatternScore } from "@/types"

interface CohortComparisonProps {
  topCohort: TopCohortBenchmark
  teamMedian: PatternScore
}

const REMAP: { key: keyof PatternScore; label: string }[] = [
  { key: "topRepSimilarity", label: "Rep Similarity" },
  { key: "prospectingFocusTime", label: "Prospecting" },
  { key: "followUpDiscipline", label: "Follow-up" },
  { key: "outboundVelocity", label: "Outbound" },
  { key: "signalConfidence", label: "Data Coverage" },
]

export function CohortComparison({ topCohort, teamMedian }: CohortComparisonProps) {
  const data = REMAP.map(({ key, label }) => ({
    metric: label,
    topCohort: topCohort[key as keyof TopCohortBenchmark],
    teamMedian: teamMedian[key],
  }))

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Workflow Shape: Top Reps vs. Team</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Radar view of workflow behavior gaps</p>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-primary inline-block" />
            Top cohort
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
            Team median
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "11px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Radar
              name="Top Cohort"
              dataKey="topCohort"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.15}
              strokeWidth={1.5}
            />
            <Radar
              name="Team Median"
              dataKey="teamMedian"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.08}
              strokeWidth={1.5}
              strokeDasharray="4 2"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
