import { ScoreBadge, ScoreBar } from "@/components/shared/score-badge"
import type { PatternScore, TopCohortBenchmark } from "@/types"

const METRICS: {
  key: keyof PatternScore
  label: string
  desc: string
  isDrift?: boolean
}[] = [
  {
    key: "topRepSimilarity",
    label: "Top Rep Similarity",
    desc: "How closely this rep's daily workflow mirrors top performers",
  },
  {
    key: "workflowDrift",
    label: "Workflow Drift",
    desc: "How far the current workflow has shifted from winning habits (lower is better)",
    isDrift: true,
  },
  {
    key: "prospectingFocusTime",
    label: "Prospecting Focus",
    desc: "Uninterrupted prospecting blocks per day vs. top cohort",
  },
  {
    key: "followUpDiscipline",
    label: "Follow-up Discipline",
    desc: "Speed and consistency of follow-ups on open threads",
  },
  {
    key: "outboundVelocity",
    label: "Outbound Velocity",
    desc: "Emails, calls, and sequences per day vs. top-cohort average",
  },
  {
    key: "signalConfidence",
    label: "Data Coverage",
    desc: "How complete the underlying browser activity data is",
  },
]

interface RepScoreCardsProps {
  scores: PatternScore
  benchmark: TopCohortBenchmark
}

export function RepScoreCards({ scores, benchmark }: RepScoreCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {METRICS.map(({ key, label, desc, isDrift }) => {
        const score = scores[key]
        const top = benchmark[key as keyof TopCohortBenchmark]
        const delta = isDrift ? score - top : score - top

        return (
          <div
            key={key}
            className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{desc}</p>
              </div>
              <ScoreBadge score={score} size="sm" />
            </div>
            <ScoreBar score={score} isDrift={isDrift} />
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Top cohort: {top}</span>
              <span
                className={
                  isDrift
                    ? delta > 0
                      ? "text-destructive"
                      : "text-success"
                    : delta >= 0
                    ? "text-success"
                    : "text-destructive"
                }
              >
                {delta > 0 ? `+${delta}` : delta} vs top
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
