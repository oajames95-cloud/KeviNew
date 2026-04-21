"use client"

import type { RepTarget, RepTargetMetric } from "@/types"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface TargetWithContext {
  target: RepTarget
  playbookDefault?: number
  teamAverage?: number
  topPerformerValue?: number
  isOverride: boolean
}

interface TargetContextProps {
  targets: TargetWithContext[]
  showOverrideOnly?: boolean
}

function getMetricLabel(metric: RepTargetMetric): string {
  const labels: Record<RepTargetMetric, string> = {
    emails_sent: "Emails Per Day",
    prospecting_time: "Prospecting Hours",
    meetings_booked: "Meetings Per Week",
    pipeline_created: "Pipeline Created",
    response_rate: "Response Rate %",
    open_rate: "Open Rate %",
    account_activity: "Accounts Touched",
    calls_dialed: "Calls Per Day",
  }
  return labels[metric] || metric
}

function getMetricUnit(metric: RepTargetMetric): string {
  if (metric.includes("rate")) return "%"
  if (metric === "prospecting_time") return "hrs"
  if (metric === "meetings_booked") return "/wk"
  if (metric === "calls_dialed" || metric === "emails_sent") return "/day"
  return ""
}

export function TargetContext({ targets, showOverrideOnly = false }: TargetContextProps) {
  const displayTargets = showOverrideOnly ? targets.filter(t => t.isOverride) : targets

  if (displayTargets.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {displayTargets.map((tc) => (
        <div
          key={tc.target.id}
          className={cn(
            "rounded-lg border p-4",
            tc.isOverride
              ? "bg-blue-50 border-blue-200"
              : "bg-slate-50 border-slate-200"
          )}
        >
          <div className="flex items-start gap-3">
            {tc.isOverride ? (
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-medium text-foreground">
                  {getMetricLabel(tc.target.metric)}
                </h4>
                <span className="text-lg font-bold text-foreground tabular-nums">
                  {tc.target.targetValue}{getMetricUnit(tc.target.metric)}
                </span>
              </div>

              {tc.isOverride && (
                <p className="text-xs text-blue-700 font-medium mb-2">
                  Rep-specific coaching target (overrides team default)
                </p>
              )}

              {!tc.isOverride && (
                <p className="text-xs text-slate-600 mb-2">
                  Team default from Playbook
                </p>
              )}

              {tc.target.notes && (
                <p className="text-xs text-foreground/75 mb-2 italic">"{tc.target.notes}"</p>
              )}

              {/* Context row */}
              <div className="grid grid-cols-2 gap-2 text-xs mt-2 pt-2 border-t border-current/10">
                {tc.playbookDefault !== undefined && (
                  <div>
                    <p className="text-foreground/60">Team Default</p>
                    <p className="font-medium text-foreground">
                      {tc.playbookDefault}{getMetricUnit(tc.target.metric)}
                    </p>
                  </div>
                )}
                {tc.topPerformerValue !== undefined && (
                  <div>
                    <p className="text-foreground/60">Top Performers</p>
                    <p className="font-medium text-emerald-700">
                      {tc.topPerformerValue}{getMetricUnit(tc.target.metric)}
                    </p>
                  </div>
                )}
              </div>

              {tc.target.status === "completed" && tc.target.completedAt && (
                <div className="mt-2 flex items-center gap-1 text-xs text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" />
                  Achieved on {new Date(tc.target.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
