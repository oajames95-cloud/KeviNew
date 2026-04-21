import type { Rep, DailyActivity, RepTarget, CoachingInsight, PatternShift } from "@/types"

export type SignalType =
  | "momentum"
  | "risk"
  | "efficiency-issue"
  | "drop-off"
  | "positive-outlier"
  | "pacing_risk"
  | "pattern_shift"
  | "coaching_ready"

export interface ManagerSignal {
  id: string
  repId: string
  repName: string
  type: SignalType
  headline: string
  supportText: string
  category: string
  priority: number // 1 = highest
  timestamp: Date
  actionable?: boolean
  actionLabel?: string
  relatedTargetId?: string
  relatedCoachingInsightId?: string
}

/**
 * Generate comprehensive signals combining activity analysis with target pacing and coaching insights
 */
export function generateSignals(
  reps: Rep[],
  targets?: Map<string, RepTarget[]>,
  insights?: Map<string, CoachingInsight[]>
): ManagerSignal[] {
  const signals: ManagerSignal[] = []
  let signalId = 0

  // Generate activity-based signals (existing logic)
  const activitySignals = generateActivitySignals(reps)
  signals.push(...activitySignals)

  // Generate target pacing signals (new logic)
  if (targets) {
    const pacingSignals = generateTargetPacingSignals(reps, targets)
    signals.push(...pacingSignals)
  }

  // Generate coaching readiness signals (new logic)
  if (insights) {
    const coachingSignals = generateCoachingSignals(reps, insights)
    signals.push(...coachingSignals)
  }

  // Deduplicate and prioritize
  const uniqueSignals = Array.from(
    new Map(signals.map((s) => [s.repId + s.type, s])).values()
  )

  return uniqueSignals.sort((a, b) => a.priority - b.priority).slice(0, 10) // Top 10 signals
}

/**
 * Activity-based signals (existing logic)
 */
function generateActivitySignals(reps: Rep[]): ManagerSignal[] {
  const signals: ManagerSignal[] = []
  let signalId = 0

  reps.forEach((rep) => {
    if (!rep.recentActivity || rep.recentActivity.length < 5) {
      return // Not enough data
    }

    const recentDays = rep.recentActivity.slice(0, 5) // Last 5 days
    const previousDays = rep.recentActivity.slice(5, 10) // 5 days before that
    const last14 = rep.recentActivity.slice(0, 14)

    // Calculate averages
    const recentAvg = {
      prospecting: avg(recentDays.map((d) => d.timeProspecting)),
      calls: avg(recentDays.map((d) => d.callsDialed)),
      meetings: avg(recentDays.map((d) => d.meetingsBooked)),
      replies: avg(recentDays.map((d) => d.followUpRate)),
      connects: avg(recentDays.map((d) => d.connectRate)),
    }

    const previousAvg = {
      prospecting: avg(previousDays.map((d) => d.timeProspecting)),
      calls: avg(previousDays.map((d) => d.callsDialed)),
      meetings: avg(previousDays.map((d) => d.meetingsBooked)),
      replies: avg(previousDays.map((d) => d.followUpRate)),
      connects: avg(previousDays.map((d) => d.connectRate)),
    }

    // Check for inactivity block today
    const today = recentDays[0]
    if (today.timeProspecting === 0 && today.callsDialed === 0) {
      const yesterdayMeetings = recentDays[1]?.meetingsBooked || 0
      if (yesterdayMeetings > 0) {
        signals.push({
          id: `signal_${signalId++}`,
          repId: rep.id,
          repName: rep.name,
          type: "drop-off",
          headline: `${rep.name} has no activity recorded today and may miss booked-meeting pace`,
          supportText: `No prospecting activity or calls recorded. Last booked meeting: ${yesterdayMeetings} meeting${yesterdayMeetings === 1 ? "" : "s"}`,
          category: "Inactivity",
          priority: 1,
          timestamp: new Date(),
        })
      }
    }

    // Momentum: building more pipeline than usual
    const pipelineChangePercent = (
      ((recentAvg.prospecting - previousAvg.prospecting) / Math.max(previousAvg.prospecting, 1)) *
      100
    ).toFixed(0)
    if (recentAvg.prospecting > previousAvg.prospecting * 1.25 && previousAvg.prospecting > 0) {
      signals.push({
        id: `signal_${signalId++}`,
        repId: rep.id,
        repName: rep.name,
        type: "momentum",
        headline: `${rep.name} is building more pipeline than usual`,
        supportText: `Prospecting time is ${pipelineChangePercent}% above recent average`,
        category: "Momentum",
        priority: 3,
        timestamp: new Date(),
      })
    }

    // Risk: projected to fall behind SQL pace based on replies/activity
    const projectedWeeklyMeetings = (recentAvg.meetings * 7) / 5
    if (projectedWeeklyMeetings < 8 && recentAvg.prospecting > 0) {
      const replyDropPercent = (
        ((recentAvg.replies - previousAvg.replies) / Math.max(previousAvg.replies, 0.01)) *
        100
      ).toFixed(0)
      if (recentAvg.replies < previousAvg.replies * 0.85 && previousAvg.replies > 0) {
        signals.push({
          id: `signal_${signalId++}`,
          repId: rep.id,
          repName: rep.name,
          type: "risk",
          headline: `${rep.name}'s reply volume suggests they may fall behind pipeline pace this week`,
          supportText: `Reply rate is down ${replyDropPercent}% week-over-week despite ongoing outreach activity`,
          category: "At risk",
          priority: 2,
          timestamp: new Date(),
        })
      }
    }

    // Efficiency issue: high activity but weak outcomes
    if (
      recentAvg.prospecting > previousAvg.prospecting * 1.15 &&
      previousAvg.prospecting > 0 &&
      recentAvg.meetings <= previousAvg.meetings * 0.95
    ) {
      const activityPercent = (
        ((recentAvg.prospecting - previousAvg.prospecting) / previousAvg.prospecting) *
        100
      ).toFixed(0)
      signals.push({
        id: `signal_${signalId++}`,
        repId: rep.id,
        repName: rep.name,
        type: "efficiency-issue",
        headline: `${rep.name} sent ${activityPercent}% more outreach but booked meetings have not moved`,
        supportText: `Activity up but outcomes flat. May need to review targeting or messaging.`,
        category: "Activity mismatch",
        priority: 2,
        timestamp: new Date(),
      })
    }

    // Drop-off: replies down, activities stable or declining
    if (recentAvg.replies < previousAvg.replies * 0.8 && previousAvg.replies > 0) {
      const dropPercent = (
        ((previousAvg.replies - recentAvg.replies) / previousAvg.replies) *
        100
      ).toFixed(0)
      const dayStreak = getConsecutiveDaysBelow(recentDays.slice(0, 3), recentAvg.replies)
      signals.push({
        id: `signal_${signalId++}`,
        repId: rep.id,
        repName: rep.name,
        type: "drop-off",
        headline: `${rep.name}'s replies dropped ${dropPercent}% which puts SQL pace at risk`,
        supportText: `This is the ${dayStreak > 1 ? `${dayStreak} straight` : "second"} day of lower engagement. Monitor for sustained trend.`,
        category: "Drop-off",
        priority: 2,
        timestamp: new Date(),
      })
    }

    // Positive outlier: pacing ahead on SQL or strong metrics
    if (recentAvg.meetings > previousAvg.meetings * 1.2 && previousAvg.meetings > 0) {
      const weeklyPace = (recentAvg.meetings * 7) / 5
      const percent = (
        ((recentAvg.meetings - previousAvg.meetings) / previousAvg.meetings) *
        100
      ).toFixed(0)
      signals.push({
        id: `signal_${signalId++}`,
        repId: rep.id,
        repName: rep.name,
        type: "positive-outlier",
        headline: `${rep.name} is pacing ahead of their usual pipeline creation this week`,
        supportText: `Meetings booked are ${percent}% above recent average — on pace for ~${weeklyPace.toFixed(0)} meetings weekly`,
        category: "Positive outlier",
        priority: 4,
        timestamp: new Date(),
      })
    }

    // Stable but strong activity mismatch detection
    if (
      Math.abs(recentAvg.prospecting - previousAvg.prospecting) < previousAvg.prospecting * 0.1 &&
      previousAvg.prospecting > 50
    ) {
      const meetingChangePercent = (
        ((recentAvg.meetings - previousAvg.meetings) / Math.max(previousAvg.meetings, 0.5)) *
        100
      ).toFixed(0)
      if (recentAvg.prospecting > 0 && recentAvg.meetings < previousAvg.meetings * 0.9) {
        signals.push({
          id: `signal_${signalId++}`,
          repId: rep.id,
          repName: rep.name,
          type: "drop-off",
          headline: `${rep.name}'s activity is stable but pipeline creation is trending down`,
          supportText: `Prospecting time unchanged, but meetings down ${meetingChangePercent}%. May indicate targeting or conversion issue.`,
          category: "Needs review",
          priority: 3,
          timestamp: new Date(),
        })
      }
    }
  })

  return signals
}

/**
 * Target pacing signals - show rep progress toward coaching targets
 */
function generateTargetPacingSignals(reps: Rep[], targets: Map<string, RepTarget[]>): ManagerSignal[] {
  const signals: ManagerSignal[] = []
  let signalId = 0

  reps.forEach((rep) => {
    const repTargets = targets.get(rep.id) || []

    for (const target of repTargets.filter((t) => t.status === "active")) {
      const daysIntoFrame = calculateDaysIntoFrame(target.timeFrame, new Date())

      // Only generate signal if 20%+ into the time frame
      if (daysIntoFrame < 0.2) continue

      // Mock: Get current value (would come from real data)
      const currentValue = 42
      const expectedValue = (target.targetValue / getDaysInFrame(target.timeFrame)) * daysIntoFrame
      const pacePercent = (currentValue / expectedValue) * 100

      if (pacePercent < 70) {
        signals.push({
          id: `pace_${target.id}_${signalId++}`,
          repId: rep.id,
          repName: rep.name,
          type: "pacing_risk",
          headline: `${rep.name} is behind pace on ${target.metric}`,
          supportText: `At ${Math.round(pacePercent)}% of target pace for this ${target.timeFrame}. ${target.notes ? `Note: "${target.notes}"` : ""}`,
          category: "Target Progress",
          priority: pacePercent < 50 ? 1 : 2,
          timestamp: new Date(),
          actionable: true,
          actionLabel: "Check in",
          relatedTargetId: target.id,
        })
      }
    }
  })

  return signals
}

/**
 * Coaching readiness signals - surface flagged insights ready for session
 */
function generateCoachingSignals(reps: Rep[], insights: Map<string, CoachingInsight[]>): ManagerSignal[] {
  const signals: ManagerSignal[] = []
  let signalId = 0
  const now = new Date()

  reps.forEach((rep) => {
    const repInsights = insights.get(rep.id) || []

    for (const insight of repInsights) {
      // Only surface if flagged recently (within last 7 days)
      const flaggedDaysAgo = Math.floor(
        (now.getTime() - new Date(insight.flaggedAt).getTime()) / (1000 * 60 * 60 * 24)
      )

      if (flaggedDaysAgo > 7) continue

      signals.push({
        id: `coaching_${insight.id}_${signalId++}`,
        repId: rep.id,
        repName: rep.name,
        type: "coaching_ready",
        headline: `Coaching opportunity: ${rep.name} — ${insight.theme}`,
        supportText: insight.reason,
        category: "Coaching",
        priority: insight.severity === "critical" ? 1 : insight.severity === "high" ? 2 : 3,
        timestamp: new Date(insight.flaggedAt),
        actionable: true,
        actionLabel: "Schedule session",
        relatedCoachingInsightId: insight.id,
      })
    }
  })

  return signals
}

// ─────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────

function avg(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return numbers.reduce((a, b) => a + b, 0) / numbers.length
}

function getConsecutiveDaysBelow(days: DailyActivity[], threshold: number): number {
  let count = 0
  for (const day of days) {
    if (day.followUpRate < threshold) {
      count++
    } else {
      break
    }
  }
  return Math.max(1, count)
}

function calculateDaysIntoFrame(timeFrame: "daily" | "weekly" | "monthly", now: Date): number {
  const day = now.getDate()

  switch (timeFrame) {
    case "daily":
      return 1 // Always 100% through the day
    case "weekly": {
      const monday = new Date(now)
      const dayOfWeek = monday.getDay()
      monday.setDate(monday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
      const daysSinceMonday = Math.floor((now.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24))
      return daysSinceMonday / 7
    }
    case "monthly": {
      return day / 31
    }
  }
}

function getDaysInFrame(timeFrame: "daily" | "weekly" | "monthly"): number {
  switch (timeFrame) {
    case "daily":
      return 1
    case "weekly":
      return 7
    case "monthly":
      return 31
  }
}

/**
 * Group signals by type for display organization
 */
export function groupSignalsByType(signals: ManagerSignal[]): Record<string, ManagerSignal[]> {
  return signals.reduce((groups, signal) => {
    if (!groups[signal.type]) {
      groups[signal.type] = []
    }
    groups[signal.type].push(signal)
    return groups
  }, {} as Record<string, ManagerSignal[]>)
}

/**
 * Get only high-priority signals for alert display
 */
export function getHighPrioritySignals(signals: ManagerSignal[], limit = 5): ManagerSignal[] {
  return signals.filter((s) => s.priority <= 2).slice(0, limit)
}
