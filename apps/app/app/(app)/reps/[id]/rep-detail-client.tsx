"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ChevronLeft, Mail, Calendar, BookOpen, TrendingUp, Phone, Clock, Zap, Building2, ExternalLink } from "lucide-react"
import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { TrendBadge } from "@/components/shared/trend-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ActiveCoachingPlan } from "@/components/rep-detail/active-coaching-plan"
import { DecisionCard } from "@/components/rep-detail/decision-card"
import { OneOnOnePrep } from "@/components/rep-detail/one-on-one-prep"
import { RepScoreCards } from "@/components/rep-detail/rep-score-cards"
import { WorkflowTimeline } from "@/components/rep-detail/workflow-timeline"
import { RepInsightPanels } from "@/components/rep-detail/rep-insight-panels"
import { CoachingNotes } from "@/components/rep-detail/coaching-notes"
import { HourlyHeatmap } from "@/components/rep-detail/hourly-heatmap"
import { OutcomesMetrics } from "@/components/shared/outcomes-metrics"
import { TopPerformerBaseline } from "@/components/shared/top-performer-baseline"
import { AccountPulse } from "@/components/accounts/account-pulse"
import { mockCoachingInsights } from "@/lib/mock-data"
import { STATUS_LABELS, STATUS_COLORS, STATUS_ORDER, heatLabel, HEAT_DOT } from "@/lib/account-status"
import { cn } from "@/lib/utils"
import type { Rep, Account, AccountTouch, TopCohortBenchmark, AccountStatus } from "@/types"

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
}

function tenureLabel(hireDate: string): string {
  if (!hireDate) return "—"
  const hire = new Date(hireDate)
  const now = new Date()
  const months = Math.floor((now.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24 * 30))
  if (months < 12) return `${months}m`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return `${years}y`
  return `${years}y ${rem}m`
}

function fmt(n: number, unit = "") {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `£${(n / 1_000).toFixed(0)}K`
  return `${n}${unit}`
}

interface RepDetailClientProps {
  rep: Rep
  coachingTargets?: any[]
  teamName?: string
  benchmark?: TopCohortBenchmark
  repAccounts?: Account[]
  repTouches?: AccountTouch[]
  pipelineCreated?: number
}

const DEFAULT_BENCHMARK: TopCohortBenchmark = {
  topRepSimilarity: 80,
  workflowDrift: 15,
  prospectingFocusTime: 75,
  followUpDiscipline: 78,
  outboundVelocity: 72,
  signalConfidence: 85,
}

export function RepDetailClient({
  rep,
  coachingTargets = [],
  teamName = "—",
  benchmark = DEFAULT_BENCHMARK,
  repAccounts = [],
  repTouches = [],
  pipelineCreated = 0,
}: RepDetailClientProps) {
  const { toggle } = useMobileSidebar()

  const activeInsight = mockCoachingInsights.find(
    (ci) => ci.repId === rep.id && ci.status !== "coached"
  )

  // ── Pipeline & activity stats from recentActivity ──────────────────────────
  const activity = rep.recentActivity
  const totalMeetings = activity.reduce((s, d) => s + d.meetingsBooked, 0)
  const totalCalls = activity.reduce((s, d) => s + d.callsDialed, 0)
  const avgProspectingMin = activity.length
    ? Math.round(activity.reduce((s, d) => s + d.timeProspecting, 0) / activity.length)
    : 0
  const avgFocusBlocks = activity.length
    ? (activity.reduce((s, d) => s + d.focusBlocksMin, 0) / activity.length).toFixed(1)
    : "0"
  const topCohortMeetingsWeek = benchmark.prospectingFocusTime > 0 ? 15 : 12
  const topCohortPipelineWeek = 280

  // ── Touches bucketed by day-of-week for heatmap (use recentActivity) ───────
  // HourlyHeatmap takes DailyActivity[] — pass rep.recentActivity directly

  // ── Group repTouches by accountId (O(1) map) ──────────────────────────────
  const touchesByAccount = useMemo(() => {
    const map = new Map<string, AccountTouch[]>()
    for (const t of repTouches) {
      const existing = map.get(t.accountId)
      if (existing) existing.push(t)
      else map.set(t.accountId, [t])
    }
    return map
  }, [repTouches])

  // ── Group accounts by status (using STATUS_ORDER for display order) ────────
  const accountsByStatus = useMemo(() => {
    const grouped = new Map<AccountStatus, Account[]>()
    for (const status of STATUS_ORDER) grouped.set(status, [])
    for (const acct of repAccounts) {
      const bucket = grouped.get(acct.status as AccountStatus)
      if (bucket) bucket.push(acct)
    }
    // Sort within each group by heat_score desc
    for (const [, list] of grouped) {
      list.sort((a, b) => b.heatScore - a.heatScore)
    }
    return grouped
  }, [repAccounts])

  // ── Flatten active statuses (skip closed_lost unless user wants it) ────────
  const activeStatuses = STATUS_ORDER.filter(s => s !== "closed_lost")
  const totalActiveAccounts = activeStatuses.reduce(
    (s, status) => s + (accountsByStatus.get(status)?.length ?? 0), 0
  )

  // Convert AccountTouch[] to the shape AccountPulse expects (touched_at field)
  const pulseTouches = (touches: AccountTouch[]) =>
    touches.map(t => ({
      channel: t.channel,
      direction: t.direction,
      touched_at: t.touchedAt,
    }))

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title={rep.name}
        subtitle={`${rep.role} · ${teamName}`}
        onMenuClick={toggle}
      />

      {/* Accounts count strip */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-2 border-b border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">{totalActiveAccounts} active accounts</p>
        {totalActiveAccounts > 10 && (
          <Link
            href={`/reps/${rep.id}/accounts`}
            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            View all accounts
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>

      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <Link
          href="/reps"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Reps
        </Link>

        {/* Decision card + coaching */}
        <DecisionCard rep={rep} insight={activeInsight} />
        <OneOnOnePrep rep={rep} activeInsight={activeInsight} />
        {coachingTargets.length > 0 && (
          <ActiveCoachingPlan targets={coachingTargets} repName={rep.name} />
        )}

        {/* ── PIPELINE & ACTIVITY SUMMARY ───────────────────────────────────── */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Pipeline & Activity (Last 30 Days)</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pipeline</p>
              </div>
              <p className="text-xl font-bold font-mono text-foreground">{fmt(pipelineCreated)}</p>
              <p className="text-[10px] text-muted-foreground">generated</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Meetings</p>
              </div>
              <p className="text-xl font-bold font-mono text-foreground">{totalMeetings}</p>
              <p className="text-[10px] text-muted-foreground">booked</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Calls</p>
              </div>
              <p className="text-xl font-bold font-mono text-foreground">{totalCalls}</p>
              <p className="text-[10px] text-muted-foreground">dialed</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Prospecting</p>
              </div>
              <p className="text-xl font-bold font-mono text-foreground">{avgProspectingMin}m</p>
              <p className="text-[10px] text-muted-foreground">avg/day</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-purple-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Focus</p>
              </div>
              <p className="text-xl font-bold font-mono text-foreground">{avgFocusBlocks}m</p>
              <p className="text-[10px] text-muted-foreground">avg blocks/day</p>
            </div>
          </div>
        </section>

        {/* ── OUTCOMES vs BENCHMARK ─────────────────────────────────────────── */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Outcomes (Last 5 Days)</h3>
          <OutcomesMetrics
            rep={rep}
            topCohortOutcomes={{
              avgMeetingsPerWeek: topCohortMeetingsWeek,
              avgPipelinePerWeek: topCohortPipelineWeek,
            }}
          />
        </section>

        <TopPerformerBaseline benchmark={benchmark} />

        {/* ── REP HEADER CARD ────────────────────────────────────────────────── */}
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
                  <span>{teamName}</span>
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

        {/* ── PATTERN SCORES ─────────────────────────────────────────────────── */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Pattern Scores vs Top Cohort</h3>
          <RepScoreCards scores={rep.scores} benchmark={benchmark} />
        </section>

        <RepInsightPanels rep={rep} />

        {/* ── HOT vs COLD TIMES ──────────────────────────────────────────────── */}
        {activity.length > 0 && (
          <section className="rounded-lg border border-border bg-card p-5">
            <HourlyHeatmap activities={activity} />
          </section>
        )}

        {/* ── ACTIVE ACCOUNTS ────────────────────────────────────────────────── */}
        {repAccounts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Active Accounts</h3>
              {totalActiveAccounts > 10 && (
                <Link
                  href={`/reps/${rep.id}/accounts`}
                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                >
                  View all {totalActiveAccounts}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {activeStatuses.map(status => {
                const accounts = accountsByStatus.get(status) ?? []
                if (accounts.length === 0) return null
                return (
                  <div key={status}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium", STATUS_COLORS[status])}>
                        {STATUS_LABELS[status]}
                      </span>
                      <span className="text-xs text-muted-foreground">{accounts.length}</span>
                    </div>
                    <div className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
                      {accounts.slice(0, totalActiveAccounts > 10 ? 3 : accounts.length).map(account => {
                        const touches = pulseTouches(touchesByAccount.get(account.id) ?? [])
                        const heat = heatLabel(account.heatScore)
                        return (
                          <Link
                            key={account.id}
                            href={`/accounts/${account.id}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted shrink-0">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground truncate">{account.name}</p>
                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", HEAT_DOT[heat])} title={heat} />
                              </div>
                              {account.industry && (
                                <p className="text-xs text-muted-foreground truncate">{account.industry}</p>
                              )}
                            </div>
                            <div className="shrink-0">
                              <AccountPulse touches={touches} width={100} height={24} />
                            </div>
                            <div className="text-right shrink-0 min-w-[56px]">
                              <p className="text-xs font-medium text-foreground">{account.heatScore}</p>
                              <p className="text-[10px] text-muted-foreground">heat</p>
                            </div>
                          </Link>
                        )
                      })}
                      {totalActiveAccounts > 10 && accounts.length > 3 && (
                        <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/20">
                          +{accounts.length - 3} more in this stage
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <WorkflowTimeline activity={rep.recentActivity} />
        <CoachingNotes />
      </main>
    </div>
  )
}
