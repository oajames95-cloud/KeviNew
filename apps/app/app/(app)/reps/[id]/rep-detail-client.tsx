"use client"

import Link from "next/link"
import { ChevronLeft, Mail, Calendar, BookOpen } from "lucide-react"
import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { TrendBadge } from "@/components/shared/trend-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ActiveCoachingPlan } from "@/components/rep-detail/active-coaching-plan"
import { DecisionCard } from "@/components/rep-detail/decision-card"
import { OneOnOnePrep } from "@/components/rep-detail/one-on-one-prep"
import { RepScoreCards } from "@/components/rep-detail/rep-score-cards"
import { WorkflowTimeline } from "@/components/rep-detail/workflow-timeline"
import { RepInsightPanels } from "@/components/rep-detail/rep-insight-panels"
import { CoachingNotes } from "@/components/rep-detail/coaching-notes"
import { OutcomesMetrics } from "@/components/shared/outcomes-metrics"
import { TopPerformerBaseline } from "@/components/shared/top-performer-baseline"
import { mockTeams, mockTeamSummary } from "@/lib/mock-data"
import type { Rep } from "@/types"

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
}

function teamName(teamId: string) {
  return mockTeams.find((t) => t.id === teamId)?.name ?? "—"
}

function tenureLabel(hireDate: string): string {
  const hire = new Date(hireDate)
  const now = new Date()
  const months = Math.floor((now.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24 * 30))
  if (months < 12) return `${months} months`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return `${years} year${years > 1 ? "s" : ""}`
  return `${years}y ${rem}m`
}

interface RepDetailClientProps {
  rep: Rep
  coachingTargets?: any[]
}

export function RepDetailClient({ rep, coachingTargets = [] }: RepDetailClientProps) {
  const { toggle } = useMobileSidebar()

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title={rep.name}
        subtitle={`${rep.role} · ${teamName(rep.teamId)}`}
        onMenuClick={toggle}
      />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <Link
          href="/reps"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Reps
        </Link>

        <DecisionCard rep={rep} />

        <OneOnOnePrep rep={rep} />

        {/* Active Coaching Plan - positioned prominently */}
        {coachingTargets.length > 0 && (
          <ActiveCoachingPlan targets={coachingTargets} repName={rep.name} />
        )}

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Outcomes (Last 5 Days)</h3>
          <OutcomesMetrics
            rep={rep}
            topCohortOutcomes={{
              avgMeetingsPerWeek: 15,
              avgPipelinePerWeek: 280,
            }}
          />
        </div>

        <TopPerformerBaseline benchmark={mockTeamSummary.topCohortBenchmark} />

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Avatar className="w-14 h-14 shrink-0">
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {initials(rep.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{rep.name}</h2>
                  <TrendBadge trend={rep.trend} />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                  <span>{rep.role}</span>
                  <span>{teamName(rep.teamId)}</span>
                  <span>Tenure: {tenureLabel(rep.hireDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 lg:gap-8 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-foreground">{rep.scores.topRepSimilarity}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Rep Similarity</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-warning">{rep.scores.workflowDrift}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Workflow Drift</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-foreground">{rep.scores.signalConfidence}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Data Coverage</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email
              </Button>
              <Link href={`/coaching/${rep.id}`}>
                <Button size="sm" className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700">
                  <BookOpen className="w-3.5 h-3.5" />
                  Open Coaching Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Pattern Scores vs Top Cohort</h3>
          <RepScoreCards
            scores={rep.scores}
            benchmark={mockTeamSummary.topCohortBenchmark}
          />
        </div>

        <RepInsightPanels rep={rep} />

        <WorkflowTimeline activity={rep.recentActivity} />

        <CoachingNotes />
      </main>
    </div>
  )
}
