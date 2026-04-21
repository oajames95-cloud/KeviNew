'use client'

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { calculatePaceStatus, formatMetricName } from "@/lib/coaching/target-utils"

interface CoachingTarget {
  id: string
  metric_type: string
  target_value: number
  current_value: number
  target_period: 'daily' | 'weekly' | 'monthly'
  start_date: string
  end_date: string
  created_at: string
}

interface ActiveCoachingPlanProps {
  targets: CoachingTarget[]
  repName: string
}

export function ActiveCoachingPlan({ targets, repName }: ActiveCoachingPlanProps) {
  if (!targets || targets.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Active Coaching Plan</h3>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No active coaching targets. Start a session to set goals.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <h3 className="text-base font-semibold text-foreground">Active Coaching Plan</h3>

      {targets.map((target) => {
        const percent = (target.current_value / target.target_value) * 100
        const status = calculatePaceStatus(
          target.current_value,
          target.target_value,
          target.start_date,
          target.end_date,
          target.target_period
        )

        const statusConfig = {
          on_track: {
            color: 'bg-emerald-100 text-emerald-700',
            label: 'On track',
          },
          at_risk: {
            color: 'bg-amber-100 text-amber-700',
            label: 'At risk',
          },
          behind: {
            color: 'bg-red-100 text-red-700',
            label: 'Behind',
          },
        }

        const config = statusConfig[status]
        const metricName = formatMetricName(target.metric_type as any, target.target_period)
        const endDate = new Date(target.end_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })

        return (
          <div key={target.id} className="space-y-2 pb-4 border-b last:border-b-0 last:pb-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{metricName}</p>
                <p className="text-xs text-muted-foreground">
                  {target.current_value} of {target.target_value} • Due {endDate}
                </p>
              </div>
              <Badge className={cn('text-xs font-medium', config.color)}>
                {config.label}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-foreground">{Math.min(Math.round(percent), 100)}%</span>
              </div>
              <Progress 
                value={Math.min(percent, 100)} 
                className="h-2 bg-slate-200"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Set in coaching session — {new Date(target.created_at).toLocaleDateString()}
            </p>
          </div>
        )
      })}
    </div>
  )
}
