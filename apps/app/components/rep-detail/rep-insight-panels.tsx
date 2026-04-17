import { ArrowDown, ArrowUp, Lightbulb, GitCompare, Clock, AlertCircle } from "lucide-react"
import type { Rep } from "@/types"
import { mockTeamSummary } from "@/lib/mock-data"

interface RepInsightPanelsProps {
  rep: Rep
}

const benchmark = mockTeamSummary.topCohortBenchmark

const DIFFERENCES = (rep: Rep) => [
  {
    metric: "Top Rep Similarity",
    repVal: rep.scores.topRepSimilarity,
    topVal: benchmark.topRepSimilarity,
    better: rep.scores.topRepSimilarity >= benchmark.topRepSimilarity,
    delta: rep.scores.topRepSimilarity - benchmark.topRepSimilarity,
    context: "Top reps spend ~180 min/day prospecting with a consistent workflow rhythm — Apollo, LinkedIn, then sequencer.",
    severity: rep.scores.topRepSimilarity < 60 ? "critical" : rep.scores.topRepSimilarity < 75 ? "warning" : "good",
  },
  {
    metric: "Follow-up Discipline",
    repVal: rep.scores.followUpDiscipline,
    topVal: benchmark.followUpDiscipline,
    better: rep.scores.followUpDiscipline >= benchmark.followUpDiscipline,
    delta: rep.scores.followUpDiscipline - benchmark.followUpDiscipline,
    context: "Top reps follow up within 24h on 90%+ of open threads. Stale threads = missed pipeline.",
    severity: rep.scores.followUpDiscipline < 60 ? "critical" : rep.scores.followUpDiscipline < 75 ? "warning" : "good",
  },
  {
    metric: "Outbound Velocity",
    repVal: rep.scores.outboundVelocity,
    topVal: benchmark.outboundVelocity,
    better: rep.scores.outboundVelocity >= benchmark.outboundVelocity,
    delta: rep.scores.outboundVelocity - benchmark.outboundVelocity,
    context: "Top reps average 28+ min/day in research before outreach. Less prep = lower connect quality.",
    severity: rep.scores.outboundVelocity < 60 ? "critical" : rep.scores.outboundVelocity < 75 ? "warning" : "good",
  },
  {
    metric: "Prospecting Focus",
    repVal: rep.scores.prospectingFocusTime,
    topVal: benchmark.prospectingFocusTime,
    better: rep.scores.prospectingFocusTime >= benchmark.prospectingFocusTime,
    delta: rep.scores.prospectingFocusTime - benchmark.prospectingFocusTime,
    context: "Top reps protect 90+ min uninterrupted prospecting blocks. Fragmented time = fewer connects.",
    severity: rep.scores.prospectingFocusTime < 60 ? "critical" : rep.scores.prospectingFocusTime < 75 ? "warning" : "good",
  },
]

const SUGGESTED_ACTIONS = (rep: Rep) => {
  const actions = []
  if (rep.scores.followUpDiscipline < 60)
    actions.push({ label: "Audit open threads together", desc: "Pull up the sequencer in the 1:1. Find the 3 most recent threads that went cold and walk through what happened. Set a daily EOD follow-up habit." })
  if (rep.scores.outboundVelocity < 60)
    actions.push({ label: "Build a pre-call research habit", desc: "Share the top-cohort research checklist (LinkedIn, CRM, news). Suggest 15-min research blocks before each calling cluster. Consider co-researching one prospect together." })
  if (rep.scores.prospectingFocusTime < 60)
    actions.push({ label: "Protect prospecting blocks", desc: "Look at the rep's calendar together. Identify what's fragmenting the morning. Block 9–11am as a no-Slack, no-meetings prospecting window for one week." })
  if (rep.scores.topRepSimilarity < 60)
    actions.push({ label: "Reset daily workflow structure", desc: "Compare this rep's daily tool sequence to the top-cohort pattern. Identify 1–2 workflow habits to shift — start time, tool order, or prospecting volume." })
  if (actions.length === 0)
    actions.push({ label: "Reinforce what is working", desc: "This rep is on track. Use the next 1:1 to name what they are doing well and identify one habit to raise from good to great." })
  return actions
}

function getSeverityColors(severity: string) {
  switch (severity) {
    case "critical":
      return { bg: "bg-destructive/5", border: "border-destructive/30", text: "text-destructive", icon: "text-destructive" }
    case "warning":
      return { bg: "bg-warning/5", border: "border-warning/30", text: "text-warning", icon: "text-warning" }
    default:
      return { bg: "bg-success/5", border: "border-success/30", text: "text-success", icon: "text-success" }
  }
}

export function RepInsightPanels({ rep }: RepInsightPanelsProps) {
  const diffs = DIFFERENCES(rep)
  const actions = SUGGESTED_ACTIONS(rep)
  const criticalGaps = diffs.filter(d => d.severity === "critical")

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Differences from top performers */}
      <div className="xl:col-span-1 rounded-lg border border-border bg-card">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Rep vs Top Performers
          </h2>
          {criticalGaps.length > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded">
              <AlertCircle className="w-3 h-3" />
              {criticalGaps.length} critical gap{criticalGaps.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="divide-y divide-border/50">
          {diffs.map((d) => {
            const colors = getSeverityColors(d.severity)
            return (
              <div key={d.metric} className={`px-5 py-3.5 ${colors.bg} border-l-2 ${colors.border}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-foreground">{d.metric}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-foreground">{d.repVal}</div>
                      <div className="text-[9px] text-muted-foreground">vs {d.topVal}</div>
                    </div>
                    {d.better ? (
                      <ArrowUp className={`w-3.5 h-3.5 ${colors.icon}`} />
                    ) : (
                      <ArrowDown className={`w-3.5 h-3.5 ${colors.icon}`} />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{d.context}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Daily workflow snapshot */}
      <div className="xl:col-span-1 rounded-lg border border-border bg-card">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Daily Workflow (Last 5 Days)</h2>
        </div>
        <div className="divide-y divide-border/50">
          {rep.recentActivity.slice(0, 5).map((day, i) => {
            const prospectingLow = day.timeProspecting < 150
            const switchesHigh = day.contextSwitches > 40
            const hasIssue = prospectingLow || switchesHigh
            
            return (
              <div key={day.date} className={`px-5 py-3.5 ${hasIssue ? "bg-warning/5 border-l-2 border-warning/30" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-foreground">
                    {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  {i === 0 && (
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Latest</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className={prospectingLow ? "bg-destructive/10 p-2 rounded" : "p-2"}>
                    <p className="text-muted-foreground font-semibold">Prospect</p>
                    <p className={`text-xs font-mono font-bold mt-0.5 ${prospectingLow ? "text-destructive" : "text-primary"}`}>{day.timeProspecting}m</p>
                  </div>
                  <div className="p-2">
                    <p className="text-muted-foreground font-semibold">Research</p>
                    <p className="text-xs font-mono font-bold mt-0.5 text-chart-2">{day.timeResearching}m</p>
                  </div>
                  <div className={switchesHigh ? "bg-destructive/10 p-2 rounded" : "p-2"}>
                    <p className="text-muted-foreground font-semibold">Switches</p>
                    <p className={`text-xs font-mono font-bold mt-0.5 ${switchesHigh ? "text-destructive" : "text-foreground"}`}>{day.contextSwitches}x</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Coaching actions */}
      <div className="xl:col-span-1 rounded-lg border border-border bg-card">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-warning" />
          <h2 className="text-sm font-semibold text-foreground">Coaching Actions</h2>
        </div>
        {actions.length === 0 ? (
          <div className="px-5 py-6 text-center">
            <p className="text-sm text-muted-foreground">No critical gaps detected.</p>
            <p className="text-[11px] text-muted-foreground mt-1">Rep is tracking well — focus on reinforcement in 1:1.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {actions.map((action) => (
              <div key={action.label} className="px-5 py-4 bg-warning/5 border-l-2 border-warning/30">
                <p className="text-xs font-bold text-foreground">{action.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{action.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
