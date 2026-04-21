"use client"

import Link from "next/link"
import { ChevronLeft, Plus, Menu, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CoachingSessionPanel } from "./coaching-session-panel"
import { CoachingWorkflow } from "./coaching-workflow"
import { generateSessionContext } from "@/lib/coaching-context"
import { saveCoachingSession } from "@/lib/coaching/sessions"
import { HourlyHeatmap } from "./hourly-heatmap"
import { QualityMetrics } from "./quality-metrics"
import { CRMAccountActivity } from "./crm-account-activity"
import { TargetPacing } from "@/components/shared/target-pacing"
import { TimeFilter, type TimeRange } from "@/components/shared/time-filter"
import { RepComparison } from "./rep-comparison"
import { TargetContext } from "@/components/shared/target-context"
import { compareRepToTeam } from "@/lib/performance-patterns"
import type { Rep, RepTrend, RepTarget } from "@/types"
import { cn } from "@/lib/utils"

interface CoachingHubProps {
  rep: Rep
  targets?: RepTarget[]
  allReps?: Rep[]  // For comparisons
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("")
}

function TrendBadge({ trend }: { trend: RepTrend }) {
  const config = {
    "at-risk": { label: "At Risk", icon: TrendingDown, className: "bg-red-100 text-red-700" },
    "drifting": { label: "Drifting", icon: TrendingDown, className: "bg-amber-100 text-amber-700" },
    "stable": { label: "Stable", icon: Minus, className: "bg-slate-100 text-slate-600" },
    "improving": { label: "Improving", icon: TrendingUp, className: "bg-emerald-100 text-emerald-700" },
  }
  const { label, icon: Icon, className } = config[trend]
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", className)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

function getWeekDelta(current: number): { value: number; isPositive: boolean } {
  const delta = Math.floor(Math.random() * 15) - 5
  return { value: Math.abs(delta), isPositive: delta >= 0 }
}

export function CoachingHub({ rep, targets = [], allReps = [] }: CoachingHubProps) {
  const { toggle } = useMobileSidebar()
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>("week")

  // Generate team comparisons if all reps provided
  const comparisons = allReps.length > 0 ? compareRepToTeam(rep, allReps) : []
  
  // Generate session context for the workflow
  const sessionContext = allReps.length > 0 ? generateSessionContext(rep, allReps) : undefined

  const handleOpenSession = () => {
    setIsWorkflowOpen(true)
  }

  const handleSaveSession = async (plan: any) => {
    try {
      // Call server action to save to Supabase
      const result = await saveCoachingSession(
        rep.id,
        rep.tenantId,
        plan,
        undefined // coachingItemId optional
      )

      if (result.success) {
        toast.success(`Session saved. ${result.targetsCount || 0} target${(result.targetsCount || 0) !== 1 ? 's' : ''} set for ${rep.name}.`)
        setIsWorkflowOpen(false)
      } else {
        toast.error(result.error || 'Failed to save session')
      }
    } catch (error) {
      console.error('[v0] Error saving session:', error)
      toast.error('An error occurred while saving')
    }
  }

  const metrics = [
    { label: "Similarity", value: rep.scores.topRepSimilarity, delta: getWeekDelta(rep.scores.topRepSimilarity), suffix: "%" },
    { label: "Focus Time", value: rep.scores.prospectingFocusTime, delta: getWeekDelta(rep.scores.prospectingFocusTime), suffix: "%" },
    { label: "Follow-up", value: rep.scores.followUpDiscipline, delta: getWeekDelta(rep.scores.followUpDiscipline), suffix: "%" },
    { label: "Velocity", value: rep.scores.outboundVelocity, delta: getWeekDelta(rep.scores.outboundVelocity), suffix: "%" },
  ]

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="flex items-center gap-4 px-6 h-14">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden -ml-2"
            onClick={toggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="flex items-center gap-3">
            <Link
              href="/reps"
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{rep.name}</h1>
              <p className="text-xs text-muted-foreground">{rep.role}</p>
            </div>
          </div>
          <div className="ml-auto">
            <Button size="sm" onClick={handleOpenSession} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Open Coaching Session
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Hero Insight Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-14 h-14 shrink-0">
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {initials(rep.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-foreground">{rep.name}</h2>
                  <TrendBadge trend={rep.trend} />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{rep.role}</p>
                <p className="text-xs text-muted-foreground">{rep.email}</p>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1">
                <div className="text-4xl font-bold text-foreground tabular-nums">
                  {rep.scores.topRepSimilarity}%
                </div>
                <p className="text-xs text-muted-foreground">Top Rep Similarity</p>
              </div>
            </div>
          </div>

          {/* Time Filter */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Activity & Metrics</h2>
            <TimeFilter value={timeRange} onChange={setTimeRange} />
          </div>

          {/* Week-over-Week Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    {metric.value}{metric.suffix}
                  </span>
                  <span className={cn(
                    "inline-flex items-center text-xs font-medium mb-1",
                    metric.delta.isPositive ? "text-emerald-600" : "text-red-600"
                  )}>
                    {metric.delta.isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {metric.delta.value}%
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">vs last week</p>
              </div>
            ))}
          </div>

          {/* Hourly Heatmap */}
          <div className="rounded-xl border border-border bg-card p-6">
            <HourlyHeatmap activities={rep.recentActivity} />
          </div>

          {/* Quality Metrics & Target Pacing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality Metrics */}
            <div className="rounded-xl border border-border bg-card p-6">
              <QualityMetrics 
                responseRate={42 + Math.random() * 20}
                openRate={58 + Math.random() * 25}
                weeklyTrend={{
                  responseRate: Math.random() * 10 - 3,
                  openRate: Math.random() * 12 - 4,
                }}
              />
            </div>

            {/* Rep vs Team Comparison */}
            {comparisons.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <RepComparison comparisons={comparisons} />
              </div>
            )}
          </div>

          {/* Active Targets with Context */}
          {targets.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-base font-semibold text-foreground">Active Coaching Targets</h3>
              <TargetContext 
                targets={targets.map(t => ({
                  target: t,
                  isOverride: true,
                  playbookDefault: 100, // Would come from playbook
                }))}
              />
            </div>
          )}

          {/* CRM Account Activity */}
          <div className="rounded-xl border border-border bg-card p-6">
            <CRMAccountActivity repName={rep.name} />
          </div>
          <details className="group rounded-xl border border-border bg-card">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
              <h3 className="text-sm font-semibold text-foreground">Full Score Breakdown</h3>
              <ChevronLeft className="w-4 h-4 text-muted-foreground transition-transform group-open:-rotate-90" />
            </summary>
            <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted-foreground">Top Rep Similarity</p>
                <p className="text-lg font-semibold text-foreground">{rep.scores.topRepSimilarity}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Workflow Drift</p>
                <p className="text-lg font-semibold text-amber-600">{rep.scores.workflowDrift}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prospecting Focus</p>
                <p className="text-lg font-semibold text-foreground">{rep.scores.prospectingFocusTime}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Follow-up Discipline</p>
                <p className="text-lg font-semibold text-foreground">{rep.scores.followUpDiscipline}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Outbound Velocity</p>
                <p className="text-lg font-semibold text-foreground">{rep.scores.outboundVelocity}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Signal Confidence</p>
                <p className="text-lg font-semibold text-foreground">{rep.scores.signalConfidence}%</p>
              </div>
            </div>
          </details>
        </div>
      </main>

      {/* Coaching Workflow */}
      <CoachingWorkflow
        rep={rep}
        isOpen={isWorkflowOpen}
        onClose={() => setIsWorkflowOpen(false)}
        onSave={handleSaveSession}
        sessionContext={sessionContext}
      />
    </div>
  )
}
