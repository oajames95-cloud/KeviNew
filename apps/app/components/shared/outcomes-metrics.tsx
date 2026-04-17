"use client"

import { TrendingUp, Users, Zap } from "lucide-react"
import type { Rep } from "@/types"

interface OutcomesMetricsProps {
  rep: Rep
  topCohortOutcomes: {
    avgMeetingsPerWeek: number
    avgPipelinePerWeek: number
  }
}

export function OutcomesMetrics({ rep, topCohortOutcomes }: OutcomesMetricsProps) {
  // Extract outcomes from last 5 days of activity
  const recentActivity = rep.recentActivity
  const meetings = recentActivity.reduce((sum, day) => sum + day.meetingsBooked, 0)
  const avgMeetingsPerDay = (meetings / recentActivity.length).toFixed(1)
  const avgMeetingsPerWeek = (parseFloat(avgMeetingsPerDay) * 5).toFixed(1)

  // Pipeline created estimate (approximate)
  const avgPipelinePerDay = (avgMeetingsPerDay * 1.8).toFixed(0)
  const avgPipelinePerWeek = (parseFloat(avgPipelinePerDay) * 5).toFixed(0)

  const meetingsDelta = (parseFloat(avgMeetingsPerWeek) / topCohortOutcomes.avgMeetingsPerWeek - 1) * 100
  const pipelineDelta = (parseFloat(avgPipelinePerWeek) / topCohortOutcomes.avgPipelinePerWeek - 1) * 100

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Meetings Booked */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-primary" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Meetings/Week
          </p>
        </div>
        <p className="text-2xl font-bold font-mono text-foreground">{avgMeetingsPerWeek}</p>
        <p className="text-[10px] text-muted-foreground mt-2">
          Top cohort: {topCohortOutcomes.avgMeetingsPerWeek.toFixed(1)}
        </p>
        <p
          className={`text-[10px] font-semibold mt-1 ${meetingsDelta > 0 ? "text-success" : "text-warning"}`}
        >
          {meetingsDelta > 0 ? "+" : ""}{meetingsDelta.toFixed(0)}% vs top
        </p>
      </div>

      {/* Pipeline Created */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-success" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pipeline/Week
          </p>
        </div>
        <p className="text-2xl font-bold font-mono text-foreground">${avgPipelinePerWeek}K</p>
        <p className="text-[10px] text-muted-foreground mt-2">
          Top cohort: ${topCohortOutcomes.avgPipelinePerWeek}K
        </p>
        <p
          className={`text-[10px] font-semibold mt-1 ${pipelineDelta > 0 ? "text-success" : "text-warning"}`}
        >
          {pipelineDelta > 0 ? "+" : ""}{pipelineDelta.toFixed(0)}% vs top
        </p>
      </div>

      {/* Conversion Quality */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-info" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Conversion
          </p>
        </div>
        <p className="text-2xl font-bold font-mono text-foreground">
          {((meetings / recentActivity.reduce((sum, day) => sum + day.callsDialed, 0)) * 100).toFixed(1)}%
        </p>
        <p className="text-[10px] text-muted-foreground mt-2">
          Meetings / calls ratio
        </p>
        <p className="text-[10px] font-semibold mt-1 text-info">
          Quality indicator
        </p>
      </div>
    </div>
  )
}
