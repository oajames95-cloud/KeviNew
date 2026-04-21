import type { Rep, DailyActivity } from "@/types"

export type SignalType =
  | "momentum"
  | "risk"
  | "efficiency-issue"
  | "drop-off"
  | "positive-outlier"

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
}

export function generateSignals(reps: Rep[]): ManagerSignal[] {
  const signals: ManagerSignal[] = []
  let signalId = 0

  reps.forEach((rep) => {
    if (!rep.recentActivity || rep.recentActivity.length < 5) {
      return // Not enough data
    }

    const recentDays = rep.recentActivity.slice(0, 5) // Last 5 days
    const previousDays = rep.recentActivity.slice(5, 10) // 5 days before that
    const last7 = recentDays
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

    const fourWeekAvg = {
      prospecting: avg(last14.map((d) => d.timeProspecting)),
      calls: avg(last14.map((d) => d.callsDialed)),
      meetings: avg(last14.map((d) => d.meetingsBooked)),
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
    const meetingToPipelineRatio = recentAvg.meetings / Math.max(recentAvg.prospecting, 1)
    const projectedWeeklyMeetings = (recentAvg.meetings * 7) / 5 // Extrapolate to 7 days
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
    if (
      recentAvg.meetings > previousAvg.meetings * 1.2 &&
      previousAvg.meetings > 0
    ) {
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

  // Deduplicate and prioritize
  const uniqueSignals = Array.from(
    new Map(signals.map((s) => [s.repId + s.type, s])).values()
  )

  return uniqueSignals.sort((a, b) => a.priority - b.priority).slice(0, 6) // Top 6 signals
}

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
