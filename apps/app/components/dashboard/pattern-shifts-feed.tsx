import { TrendingUp, TrendingDown } from "lucide-react"
import type { PatternShift, PatternScore } from "@/types"
import { cn } from "@/lib/utils"

const metricLabels: Record<keyof PatternScore, string> = {
  topRepSimilarity: "Rep Similarity",
  workflowDrift: "Workflow Drift",
  prospectingFocusTime: "Prospecting Focus",
  followUpDiscipline: "Follow-up Discipline",
  outboundVelocity: "Outbound Velocity",
  signalConfidence: "Data Coverage",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

interface PatternShiftsFeedProps {
  shifts: PatternShift[]
}

export function PatternShiftsFeed({ shifts }: PatternShiftsFeedProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Workflow Shifts</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Notable behavior changes in the last 7 days
        </p>
      </div>
      <div className="divide-y divide-border/50">
        {shifts.map((shift) => {
          const isPositive =
            shift.metric === "workflowDrift" ? shift.direction === "down" : shift.direction === "up"
          return (
            <div key={shift.id} className="px-4 py-3 flex items-start gap-2.5">
              <div
                className={cn(
                  "w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5",
                  isPositive ? "bg-success/10" : "bg-warning/10"
                )}
              >
                {shift.direction === "up" ? (
                  <TrendingUp
                    className={cn("w-3.5 h-3.5", isPositive ? "text-success" : "text-warning")}
                  />
                ) : (
                  <TrendingDown
                    className={cn("w-3.5 h-3.5", isPositive ? "text-success" : "text-warning")}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{shift.repName}</span>
                  <span className="text-xs text-muted-foreground">
                    {metricLabels[shift.metric]}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-mono font-semibold",
                      isPositive ? "text-success" : "text-warning"
                    )}
                  >
                    {shift.direction === "up" ? "+" : "-"}
                    {shift.magnitude} pts
                  </span>
                </div>
                {shift.notes && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {shift.notes}
                  </p>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {formatDate(shift.date)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
