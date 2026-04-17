"use client"

import { notFound, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Mail, Calendar, ExternalLink } from "lucide-react"
import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { TrendBadge } from "@/components/shared/trend-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DecisionCard } from "@/components/rep-detail/decision-card"
import { OneOnOnePrep } from "@/components/rep-detail/one-on-one-prep"
import { RepScoreCards } from "@/components/rep-detail/rep-score-cards"
import { WorkflowTimeline } from "@/components/rep-detail/workflow-timeline"
import { RepInsightPanels } from "@/components/rep-detail/rep-insight-panels"
import { CoachingNotes } from "@/components/rep-detail/coaching-notes"
import { OutcomesMetrics } from "@/components/shared/outcomes-metrics"
import { TopPerformerBaseline } from "@/components/shared/top-performer-baseline"
import { mockReps, mockTeams, mockTeamSummary } from "@/lib/mock-data"
import { getRepDetail } from "@/lib/supabase-queries-client"

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

export default function RepDetailPage() {
  const { toggle } = useMobileSidebar()
  const params = useParams()
  const id = params.id as string
  const [rep, setRep] = useState(mockReps.find((r) => r.id === id))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const repData = await getRepDetail(id)
        if (repData) {
          // Transform Supabase data to match app structure
          const transformed = {
            id: repData.id,
            name: repData.name || "Unknown",
            email: repData.email || "",
            avatar: repData.avatar_url || "",
            title: repData.role || "SDR",
            teamId: repData.team_id,
            tenureDays: repData.hire_date ? Math.floor((Date.now() - new Date(repData.hire_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
            hireDate: repData.hire_date,
            scores: {
              topRepSimilarity: repData.score_top_rep_similarity || 0,
              workflowDrift: 0,
              followUpDiscipline: repData.score_follow_up_discipline || 0,
              prospectingFocusTime: repData.score_prospecting_focus_time || 0,
              prepQuality: repData.score_prep_quality || 0,
              signalConfidence: 0,
            },
            recentActivity: (repData.rep_daily_metrics || []).map((metric: any) => ({
              date: metric.date,
              callsDialed: metric.calls_dialed || 0,
              meetingsBooked: metric.meetings_booked || 0,
              timeProspecting: metric.time_prospecting || 0,
              timeResearching: metric.time_researching || 0,
              timeInApollo: metric.time_in_apollo || 0,
              timeInCRM: metric.time_in_crm || 0,
              timeInEmail: metric.time_in_email || 0,
              contextSwitches: metric.context_switches || 0,
              focusBlocksMin: metric.focus_blocks_min || 0,
            })) || [],
            outcomes: (repData.rep_outcomes || []).map((outcome: any) => ({
              date: outcome.date,
              callsDialed: outcome.calls_dialed || 0,
              meetingsBooked: outcome.meetings_booked || 0,
              connectRate: outcome.connect_rate || 0,
              followUpRate: outcome.follow_up_rate || 0,
            }))[0] || {},
            coachingItems: repData.coaching_items || [],
          }
          setRep(transformed)
        } else {
          setRep(mockReps.find((r) => r.id === id))
        }
      } catch (error) {
        console.error("[v0] Error fetching rep detail:", error)
        setRep(mockReps.find((r) => r.id === id))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (!rep) notFound()

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title={rep.name}
        subtitle={`${rep.title} · ${teamName(rep.teamId)}`}
        onMenuClick={toggle}
      />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/reps"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Reps
        </Link>

        {/* Decision Card - Status at a glance */}
        <DecisionCard rep={rep} />

        {/* 1:1 Prep Brief - Manager coaching session readiness */}
        <OneOnOnePrep rep={rep} />

        {/* Outcomes Section - Meetings & Pipeline */}
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

        {/* Top Performer Baseline */}
        <TopPerformerBaseline benchmark={mockTeamSummary.topCohortBenchmark} />

        {/* Rep identity card */}
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
                  <span>{rep.title}</span>
                  <span>{teamName(rep.teamId)}</span>
                  <span>Tenure: {tenureLabel(rep.hireDate)}</span>
                </div>
              </div>
            </div>
            
            {/* Key scores summary */}
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

            {/* Quick actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Schedule 1:1
              </Button>
            </div>
          </div>
        </div>

        {/* Score cards - detailed metrics */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Pattern Scores vs Top Cohort</h3>
          <RepScoreCards
            scores={rep.scores}
            benchmark={mockTeamSummary.topCohortBenchmark}
          />
        </div>

        {/* Insight panels - coaching-focused */}
        <RepInsightPanels rep={rep} />

        {/* Activity timeline */}
        <WorkflowTimeline activity={rep.recentActivity} />

        {/* Coaching notes */}
        <CoachingNotes />
      </main>
    </div>
  )
}
