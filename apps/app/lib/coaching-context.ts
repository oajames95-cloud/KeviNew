import type { Rep, RepTarget } from "@/types"

export interface SessionContext {
  whyItMatters: string
  currentMetrics: Record<string, number>
  targetPatterns: string[]
}

/**
 * Generate plain-English context for why this coaching session is happening
 */
export function generateSessionContext(rep: Rep, allReps: Rep[]): SessionContext {
  const recentDays = rep.recentActivity?.slice(0, 5) || []
  const previousDays = rep.recentActivity?.slice(5, 10) || []

  if (recentDays.length === 0) {
    return {
      whyItMatters: "Not enough activity data to generate session context",
      currentMetrics: {},
      targetPatterns: [],
    }
  }

  // Calculate averages
  const recentAvg = {
    prospecting: avg(recentDays.map(d => d.timeProspecting)),
    meetings: avg(recentDays.map(d => d.meetingsBooked)),
    calls: avg(recentDays.map(d => d.callsDialed)),
    replies: avg(recentDays.map(d => d.followUpRate)),
    connects: avg(recentDays.map(d => d.connectRate)),
  }

  const previousAvg = {
    prospecting: avg(previousDays.map(d => d.timeProspecting)),
    meetings: avg(previousDays.map(d => d.meetingsBooked)),
    calls: avg(previousDays.map(d => d.callsDialed)),
    replies: avg(previousDays.map(d => d.followUpRate)),
    connects: avg(previousDays.map(d => d.connectRate)),
  }

  // Get team benchmarks
  const topPerformers = allReps.filter(r => r.scores.topRepSimilarity > 75)
  const topPerformersMeetings = avg(topPerformers.map(r => avg(r.recentActivity?.map(a => a.meetingsBooked) || [0])))

  // Build metrics snapshot
  const currentMetrics: Record<string, number> = {
    "Meetings booked (this week)": Math.round(recentAvg.meetings * 5),
    "Prospecting time (daily avg)": Math.round(recentAvg.prospecting / 60),
    "Reply rate (%)": Math.round(recentAvg.replies),
    "Connect rate (%)": Math.round(recentAvg.connects),
  }

  // Detect patterns
  const patterns: string[] = []

  // Pattern 1: Activity and outcome mismatch
  if (recentAvg.prospecting > previousAvg.prospecting * 1.2 && recentAvg.meetings <= previousAvg.meetings) {
    patterns.push(
      `High activity, flat outcomes: ${rep.name} is sending 20%+ more outreach but not booking more meetings. This suggests messaging or account selection needs review.`
    )
  }

  // Pattern 2: Weak reply rate despite activity
  if (recentAvg.prospecting > 0 && recentAvg.replies < 20) {
    patterns.push(
      `Low reply rate (${Math.round(recentAvg.replies)}%) despite consistent outreach. Focus this session on message quality and audience fit.`
    )
  }

  // Pattern 3: Below team average
  const teamAvgMeetings = avg(allReps.flatMap(r => r.recentActivity?.map(a => a.meetingsBooked) || [0]))
  if (recentAvg.meetings < teamAvgMeetings * 0.8) {
    patterns.push(
      `Pipeline creation is ${Math.round((1 - recentAvg.meetings / teamAvgMeetings) * 100)}% below team average. Diagnose whether this is an activity issue or a conversion issue.`
    )
  }

  // Pattern 4: Account scatter (many accounts, low depth)
  if (rep.scores.topRepSimilarity < 50) {
    patterns.push(
      `Activity pattern differs from top performers—may indicate account scatter or inconsistent prospecting rhythm. Top performers typically focus on 3-4 core accounts.`
    )
  }

  // Build the why-it-matters narrative
  let whyItMatters = ""

  if (patterns.length > 0) {
    whyItMatters = patterns[0]
    if (patterns.length > 1) {
      whyItMatters += ` Additionally, ${patterns[1].toLowerCase()}`
    }
  } else if (recentAvg.meetings < 4) {
    whyItMatters = `Pipeline creation is trending low (${Math.round(recentAvg.meetings * 5)} meetings expected this week). This session should focus on diagnosing whether it's an activity volume issue, targeting issue, or conversion issue.`
  } else {
    whyItMatters = `${rep.name} is on track for pipeline but there may be opportunities to improve efficiency or consistency. This session will focus on finding leverage points for improvement.`
  }

  return {
    whyItMatters,
    currentMetrics,
    targetPatterns: patterns,
  }
}

/**
 * Generate suggested coaching objectives based on performance data
 */
export function suggestCoachingObjectives(rep: Rep, allReps: Rep[]): string[] {
  const recentDays = rep.recentActivity?.slice(0, 5) || []
  const previousDays = rep.recentActivity?.slice(5, 10) || []

  if (recentDays.length === 0) return []

  const recentAvg = {
    prospecting: avg(recentDays.map(d => d.timeProspecting)),
    meetings: avg(recentDays.map(d => d.meetingsBooked)),
    replies: avg(recentDays.map(d => d.followUpRate)),
  }

  const previousAvg = {
    prospecting: avg(previousDays.map(d => d.timeProspecting)),
    meetings: avg(previousDays.map(d => d.meetingsBooked)),
  }

  const objectives: string[] = []

  // Suggest based on actual issues
  if (recentAvg.replies < 20) {
    objectives.push("Improve reply rate")
  }

  if (recentAvg.meetings < 4) {
    objectives.push("Increase meetings booked")
  }

  if (recentAvg.prospecting < 3600) {
    // Less than 1 hour per day
    objectives.push("Rebuild prospecting consistency")
  }

  if (recentAvg.prospecting > previousAvg.prospecting * 1.2 && recentAvg.meetings <= previousAvg.meetings) {
    objectives.push("Improve conversion quality")
  }

  if (rep.scores.topRepSimilarity < 50) {
    objectives.push("Align with top performer patterns")
  }

  return objectives.length > 0 ? objectives : ["Improve reply rate", "Increase meetings booked"]
}

// Helper function
function avg(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return numbers.reduce((a, b) => a + b, 0) / numbers.length
}
