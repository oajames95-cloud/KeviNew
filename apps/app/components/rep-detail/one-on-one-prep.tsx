"use client"

import { useState } from "react"
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  MessageSquare,
  Target,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Rep } from "@/types"
import { mockCoachingInsights, mockTeamSummary } from "@/lib/mock-data"

interface OneOnOnePrepProps {
  rep: Rep
}

const benchmark = mockTeamSummary.topCohortBenchmark

function getTopGaps(rep: Rep) {
  const gaps = [
    { metric: "Top Rep Similarity", gap: benchmark.topRepSimilarity - rep.scores.topRepSimilarity, current: rep.scores.topRepSimilarity },
    { metric: "Follow-up Discipline", gap: benchmark.followUpDiscipline - rep.scores.followUpDiscipline, current: rep.scores.followUpDiscipline },
    { metric: "Pre-call Prep", gap: benchmark.prepQuality - rep.scores.prepQuality, current: rep.scores.prepQuality },
    { metric: "Prospecting Focus", gap: benchmark.prospectingFocusTime - rep.scores.prospectingFocusTime, current: rep.scores.prospectingFocusTime },
  ]
  return gaps.filter(g => g.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 2)
}

function getWins(rep: Rep) {
  const wins = []
  if (rep.scores.topRepSimilarity >= benchmark.topRepSimilarity) wins.push("Workflow rhythm matching top performers")
  if (rep.scores.followUpDiscipline >= benchmark.followUpDiscipline) wins.push("Follow-up cadence is strong")
  if (rep.scores.prepQuality >= benchmark.prepQuality) wins.push("Pre-call research time is solid")
  if (rep.scores.prospectingFocusTime >= benchmark.prospectingFocusTime) wins.push("Protecting prospecting focus blocks")
  if (rep.trend === "improving") wins.push("Positive workflow momentum this week")
  return wins.slice(0, 2)
}

function getTalkingPoints(rep: Rep) {
  const points: string[] = []
  const gaps = getTopGaps(rep)

  if (gaps.length > 0) {
    points.push(`"I noticed your ${gaps[0].metric.toLowerCase()} is at ${gaps[0].current}. What's getting in the way?"`)
  }

  if (rep.trend === "drifting" || rep.trend === "at-risk") {
    points.push(`"Walk me through a typical morning — when do you start prospecting and what does that first hour look like?"`)
  }

  if (rep.scores.followUpDiscipline < 60) {
    points.push(`"Can you pull up a thread that went cold recently? Let's look at what happened together."`)
  }

  if (rep.scores.prospectingFocusTime < 60) {
    points.push(`"What's breaking up your prospecting blocks — meetings, Slack, something else?"`)
  }

  const wins = getWins(rep)
  if (wins.length > 0) {
    points.push(`"${wins[0]} — what are you doing to keep that consistent?"`)
  }

  points.push(`"What's one thing I can do to make this week easier for you?"`)

  return points.slice(0, 4)
}

function getCommitment(rep: Rep) {
  const gaps = getTopGaps(rep)
  if (gaps.length === 0) return "Maintain current momentum — check back in next week"

  const commitments: Record<string, string> = {
    "Top Rep Similarity": "Commit to following the daily workflow sequence — Apollo first, then LinkedIn, then sequencer — for 5 days",
    "Follow-up Discipline": "Clear all open threads before EOD each day this week. Review the list together on Friday.",
    "Pre-call Prep": "Add a 15-min research block before each calling cluster. Use the top-cohort checklist.",
    "Prospecting Focus": "Block 9–11am as a no-meetings, no-Slack prospecting window for the next week",
  }

  return commitments[gaps[0].metric] || "Pick one workflow habit to focus on and check in daily for 5 days"
}

export function OneOnOnePrep({ rep }: OneOnOnePrepProps) {
  const [expanded, setExpanded] = useState(true)
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())
  
  const activeInsight = mockCoachingInsights.find(
    (ci) => ci.repId === rep.id && ci.status !== "coached"
  )
  const gaps = getTopGaps(rep)
  const wins = getWins(rep)
  const talkingPoints = getTalkingPoints(rep)
  const commitment = getCommitment(rep)

  const toggleItem = (index: number) => {
    const next = new Set(checkedItems)
    if (next.has(index)) next.delete(index)
    else next.add(index)
    setCheckedItems(next)
  }

  return (
    <div className="rounded-lg border-2 border-primary/30 bg-primary/5">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <ClipboardList className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-semibold text-foreground">1:1 Prep Brief</h2>
            <p className="text-[11px] text-muted-foreground">Quick reference for your coaching conversation</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          {/* Active coaching item banner */}
          {activeInsight && (
            <div className="p-3 rounded-md bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">Open coaching item: {activeInsight.theme}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{activeInsight.recommendedAction}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-4">
              {/* Gaps to address */}
              {gaps.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                    <Target className="w-3.5 h-3.5 text-destructive" />
                    Gaps to Address
                  </h3>
                  <ul className="space-y-1.5">
                    {gaps.map((g) => (
                      <li key={g.metric} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-destructive mt-1.5 shrink-0" />
                        <span><span className="font-medium text-foreground">{g.metric}</span> — {g.gap} pts below top reps</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Wins to acknowledge */}
              {wins.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-success" />
                    Wins to Acknowledge
                  </h3>
                  <ul className="space-y-1.5">
                    {wins.map((w, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-success mt-1.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right column: Talking points */}
            <div>
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                Suggested Questions
              </h3>
              <ul className="space-y-2">
                {talkingPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <button
                      onClick={() => toggleItem(i)}
                      className="mt-0.5 shrink-0"
                      aria-label={checkedItems.has(i) ? "Uncheck" : "Check"}
                    >
                      {checkedItems.has(i) ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-muted-foreground/50" />
                      )}
                    </button>
                    <span className={cn(
                      "text-xs leading-relaxed",
                      checkedItems.has(i) ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Commitment prompt */}
          <div className="pt-3 border-t border-border">
            <h3 className="text-xs font-semibold text-foreground mb-1.5">Commitment to Close With</h3>
            <p className="text-xs text-muted-foreground italic">&quot;{commitment}&quot;</p>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-2 pt-1">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Print Prep Sheet
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
              Copy to Clipboard
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
