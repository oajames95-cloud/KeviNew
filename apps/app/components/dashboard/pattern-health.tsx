import { ScoreBar } from "@/components/shared/score-badge"
import type { TopCohortBenchmark, PatternScore } from "@/types"

const METRICS: { key: keyof PatternScore; label: string; description: string; isDrift?: boolean }[] = [
  { key: "topRepSimilarity", label: "Top Rep Similarity", description: "Workflow mix & execution alignment" },
  { key: "prospectingFocusTime", label: "Prospecting Focus", description: "Uninterrupted prospecting blocks" },
  { key: "followUpDiscipline", label: "Follow-up Discipline", description: "Follow-up speed & consistency" },
  { key: "prepQuality", label: "Prep Quality", description: "Research time before outreach" },
  { key: "workflowDrift", label: "Workflow Drift", description: "Deviation from winning patterns", isDrift: true },
  { key: "signalConfidence", label: "Data Coverage", description: "Browser activity data quality & completeness" },
]

interface PatternHealthProps {
  topCohort: TopCohortBenchmark
  teamMedian: PatternScore
}

export function PatternHealth({ topCohort, teamMedian }: PatternHealthProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Workflow Habits: Top Reps vs. Team</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Top cohort vs. team median across 6 behaviors
        </p>
      </div>
      <div className="p-4 space-y-4">
        {/* Legend */}
        <div className="flex items-center gap-5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-primary inline-block" />
            Top cohort
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
            Team median
          </span>
        </div>

        {/* Metrics */}
        <div className="space-y-3">
          {METRICS.map(({ key, label, description, isDrift }) => {
            const topVal = topCohort[key as keyof TopCohortBenchmark]
            const medVal = teamMedian[key]
            const delta = isDrift
              ? medVal - topVal   // drift: lower is better, so positive delta = team worse
              : topVal - medVal   // others: higher is better

            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{description}</p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="text-primary font-semibold">{topVal}</span>
                    <span className="text-muted-foreground">{medVal}</span>
                    {delta !== 0 && (
                      <span
                        className={
                          delta > 0
                            ? "text-warning"
                            : "text-success"
                        }
                      >
                        {delta > 0 ? `+${delta}` : delta} gap
                      </span>
                    )}
                  </div>
                </div>
                {/* Stacked bars */}
                <div className="space-y-1">
                  <ScoreBar score={topVal} isDrift={isDrift} />
                  <ScoreBar score={medVal} isDrift={isDrift} className="opacity-40" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
