import type { Rep, RepTarget } from "@/types"

export interface PerformancePattern {
  id: string
  title: string
  description: string
  impactArea: "pipeline" | "meetings" | "response" | "account" | "consistency" | "conversion"
  repsMatching: string[] // rep IDs
  topPerformersCount: number
  plainEnglishInsight: string
  actionableCoachingFocus?: string
}

export interface RepVsTeamComparison {
  repId: string
  repName: string
  metric: string
  repValue: number
  teamAverage: number
  topPerformerValue: number
  variance: "leading" | "above-average" | "average" | "below-average" | "lagging"
  insight: string
}

export interface TargetContext {
  target: RepTarget
  playbookDefaultValue?: number
  teamAverage?: number
  topPerformerValue?: number
  isOverride: boolean
}

// Analyze what top performers do differently
export function analyzeTopPerformerPatterns(reps: Rep[]): PerformancePattern[] {
  const topPerformers = reps.filter(r => r.trend === "improving" || r.scores.topRepSimilarity > 75)
  const allOthers = reps.filter(r => !topPerformers.includes(r))

  const patterns: PerformancePattern[] = []

  // Pattern 1: Account focus depth
  const topPerfersAvgAccounts = 3.2 // Would calculate from data
  const othersAvgAccounts = 5.8
  if (othersAvgAccounts > topPerfersAvgAccounts * 1.5) {
    patterns.push({
      id: "pattern_account_depth",
      title: "Account Depth vs Breadth",
      description: "Top performers focus on fewer accounts with higher engagement",
      impactArea: "pipeline",
      repsMatching: topPerformers.map(r => r.id),
      topPerformersCount: topPerformers.length,
      plainEnglishInsight: "Top performers are working 3-4 accounts with consistent follow-up instead of 6+ accounts with sporadic touches",
      actionableCoachingFocus: "Consolidate account list and increase follow-up frequency in narrower set",
    })
  }

  // Pattern 2: Response rate drivers
  const topPerfResponseRate = 38
  const otherResponseRate = 24
  if (topPerfResponseRate > otherResponseRate * 1.3) {
    patterns.push({
      id: "pattern_response_rate",
      title: "Higher Response Rates",
      description: "Top performers achieve stronger response despite similar or lower volume",
      impactArea: "response",
      repsMatching: topPerformers.map(r => r.id),
      topPerformersCount: topPerformers.length,
      plainEnglishInsight: "Response leaders send fewer but higher-quality emails - focus on targeting and message over volume",
      actionableCoachingFocus: "Review email targeting criteria and opening message quality",
    })
  }

  // Pattern 3: Activity consistency
  patterns.push({
    id: "pattern_activity_consistency",
    title: "Consistent Daily Activity",
    description: "Top performers maintain steady activity throughout the week",
    impactArea: "consistency",
    repsMatching: topPerformers.map(r => r.id),
    topPerformersCount: topPerformers.length,
    plainEnglishInsight: "Better reps maintain prospecting activity throughout the week, not back-loaded",
    actionableCoachingFocus: "Build daily prospecting habit instead of weekly pushes",
  })

  // Pattern 4: SQL conversion
  patterns.push({
    id: "pattern_sql_conversion",
    title: "Meeting to SQL Conversion",
    description: "Top performers convert a higher % of meetings to SQL",
    impactArea: "conversion",
    repsMatching: topPerformers.map(r => r.id),
    topPerformersCount: topPerformers.length,
    plainEnglishInsight: "Stronger reps book fewer meetings but have higher quality ones that close",
    actionableCoachingFocus: "Focus on discovery depth and account research before calls",
  })

  return patterns.sort((a, b) => b.topPerformersCount - a.topPerformersCount)
}

// Compare a specific rep against team and top performers
export function compareRepToTeam(rep: Rep, allReps: Rep[]): RepVsTeamComparison[] {
  const topPerformers = allReps.filter(r => r.scores.topRepSimilarity > 75)
  const comparisons: RepVsTeamComparison[] = []

  const teamAvgSimilarity = allReps.reduce((sum, r) => sum + r.scores.topRepSimilarity, 0) / allReps.length
  const topPerformersAvgSimilarity = topPerformers.length > 0 
    ? topPerformers.reduce((sum, r) => sum + r.scores.topRepSimilarity, 0) / topPerformers.length 
    : 0

  comparisons.push({
    repId: rep.id,
    repName: rep.name,
    metric: "Top Rep Similarity",
    repValue: rep.scores.topRepSimilarity,
    teamAverage: teamAvgSimilarity,
    topPerformerValue: topPerformersAvgSimilarity,
    variance: getVarianceStatus(rep.scores.topRepSimilarity, teamAvgSimilarity, topPerformersAvgSimilarity),
    insight: generateComparisonInsight("similarity", rep.scores.topRepSimilarity, teamAvgSimilarity, topPerformersAvgSimilarity),
  })

  comparisons.push({
    repId: rep.id,
    repName: rep.name,
    metric: "Follow-up Discipline",
    repValue: rep.scores.followUpDiscipline,
    teamAverage: allReps.reduce((sum, r) => sum + r.scores.followUpDiscipline, 0) / allReps.length,
    topPerformerValue: topPerformers.length > 0 ? topPerformers.reduce((sum, r) => sum + r.scores.followUpDiscipline, 0) / topPerformers.length : 0,
    variance: getVarianceStatus(rep.scores.followUpDiscipline, allReps.reduce((sum, r) => sum + r.scores.followUpDiscipline, 0) / allReps.length, topPerformers.length > 0 ? topPerformers.reduce((sum, r) => sum + r.scores.followUpDiscipline, 0) / topPerformers.length : 0),
    insight: "This rep's follow-up rate compared to team and top performers",
  })

  return comparisons
}

function getVarianceStatus(repValue: number, teamAvg: number, topPerfValue: number): "leading" | "above-average" | "average" | "below-average" | "lagging" {
  if (repValue >= topPerfValue * 0.95) return "leading"
  if (repValue >= teamAvg * 1.1) return "above-average"
  if (repValue >= teamAvg * 0.9) return "average"
  if (repValue >= teamAvg * 0.8) return "below-average"
  return "lagging"
}

function generateComparisonInsight(metric: string, repValue: number, teamAvg: number, topPerfValue: number): string {
  const variance = getVarianceStatus(repValue, teamAvg, topPerfValue)
  const percentOfTeam = Math.round((repValue / teamAvg) * 100)
  const percentOfTop = topPerfValue > 0 ? Math.round((repValue / topPerfValue) * 100) : 0

  switch (variance) {
    case "leading":
      return `${repValue}% — leading the team`
    case "above-average":
      return `${repValue}% — ${percentOfTeam}% of team average`
    case "average":
      return `${repValue}% — in line with team`
    case "below-average":
      return `${repValue}% — below team, ${percentOfTop}% of top performers`
    case "lagging":
      return `${repValue}% — significantly below team average`
  }
}

// Highlight which targets are overrides vs defaults
export function analyzeTargetContext(repTargets: RepTarget[], playbookDefaults: Map<string, number>, teamAverages: Map<string, number>, topPerformerValues: Map<string, number>): TargetContext[] {
  return repTargets.map(target => ({
    target,
    playbookDefaultValue: playbookDefaults.get(target.metric),
    teamAverage: teamAverages.get(target.metric),
    topPerformerValue: topPerformerValues.get(target.metric),
    isOverride: (playbookDefaults.get(target.metric) || 0) !== target.targetValue,
  }))
}

// Generate insights for "Why this session matters"
export function generateSessionContext(rep: Rep, coachingTheme: string, comparisons: RepVsTeamComparison[]): string {
  const relevantComparison = comparisons.find(c => c.insight.includes(coachingTheme.toLowerCase()))
  if (!relevantComparison) {
    return `${rep.name} is trending ${rep.trend}. This session will focus on ${coachingTheme}.`
  }

  const variance = relevantComparison.variance
  if (variance === "leading") {
    return `${rep.name} is excelling here (${relevantComparison.repValue}%). This session will ensure they maintain momentum.`
  }
  if (variance === "lagging") {
    return `${rep.name} is significantly below team average (${relevantComparison.repValue}% vs ${Math.round(relevantComparison.teamAverage)}% team avg). This session will focus on practical improvements.`
  }
  
  return `${rep.name} is close to team average on this metric. Session will focus on small improvements to move into top performer range.`
}
