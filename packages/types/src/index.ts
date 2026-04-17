// ─────────────────────────────────────────────
// Tenant / Auth context
// ─────────────────────────────────────────────

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: "starter" | "growth" | "enterprise"
  createdAt: string
}

export interface Manager {
  id: string
  tenantId: string
  name: string
  email: string
  avatarUrl?: string
  role: "manager" | "admin" | "viewer"
  teamIds: string[]
}

// ─────────────────────────────────────────────
// Team
// ─────────────────────────────────────────────

export interface Team {
  id: string
  tenantId: string
  name: string
  managerId: string
  repCount: number
  avgPatternMatch: number
  avgDriftScore: number
  createdAt: string
}

// ─────────────────────────────────────────────
// Rep
// ─────────────────────────────────────────────

export type RepTrend = "improving" | "stable" | "drifting" | "at-risk"

export interface Rep {
  id: string
  tenantId: string
  teamId: string
  managerId: string
  name: string
  email: string
  avatarUrl?: string
  role: string
  hireDate: string
  trend: RepTrend
  scores: PatternScore
  recentActivity: DailyActivity[]
  dataSourceIds: string[]
}

// ─────────────────────────────────────────────
// Workflow Activity - Observable via Chrome Extension
// ─────────────────────────────────────────────

export interface WorkflowActivity {
  date: string
  // Objective workflow time buckets (minutes)
  timeProspecting: number
  timeResearching: number
  timeBuildingLists: number
  timeInApollo: number
  timeInLinkedIn: number
  timeInCRM: number
  timeInSequencer: number
  timeInEmail: number
  timeInCalendar: number
  idleTime: number
  // Derived engagement metrics
  contextSwitches: number
  focusBlocksMin: number  // uninterrupted prospecting/research
  workdayMinutes: number
}

export interface PatternScore {
  topRepSimilarity: number        // 0–100: how closely rep mirrors top performers (based on workflow mix)
  workflowDrift: number           // 0–100: deviation from winning workflow habits (higher = more drift)
  prospectingFocusTime: number    // 0–100: uninterrupted prospecting blocks quality
  followUpDiscipline: number      // 0–100: timeliness & consistency of follow-ups  
  prepQuality: number             // 0–100: research time before outreach
  signalConfidence: number        // 0–100: reliability of the underlying browser activity data
}

export interface TopCohortBenchmark {
  topRepSimilarity: number
  workflowDrift: number
  prospectingFocusTime: number
  followUpDiscipline: number
  prepQuality: number
  signalConfidence: number
}

// ─────────────────────────────────────────────
// Activity History (daily workflow snapshots)
// ─────────────────────────────────────────────

export interface DailyActivity extends WorkflowActivity {
  // Sales outcomes
  callsDialed: number
  connectRate: number   // percentage
  emailsSent: number
  meetingsBooked: number
  followUpRate: number  // percentage
}

export interface PatternShift {
  id: string
  repId: string
  repName: string
  date: string
  metric: keyof PatternScore
  direction: "up" | "down"
  magnitude: number   // delta
  notes?: string
}

// ─────────────────────────────────────────────
// Coaching
// ─────────────────────────────────────────────

export type CoachingSeverity = "critical" | "high" | "medium" | "low"
export type CoachingStatus = "new" | "reviewing" | "coached" | "watchlist"
export type CoachingTheme =
  | "workflow mix"
  | "prospecting focus"
  | "prep quality"
  | "follow-up discipline"
  | "winning habits"
  | "focus blocks"
  | "signal confidence"

export interface CoachingInsight {
  id: string
  tenantId: string
  repId: string
  repName: string
  teamId: string
  teamName: string
  managerId: string
  severity: CoachingSeverity
  status: CoachingStatus
  theme: CoachingTheme
  reason: string
  recommendedAction: string
  flaggedAt: string
  updatedAt: string
  metrics: Partial<PatternScore>
  notes?: CoachingNote[]
}

export interface CoachingNote {
  id: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
}

// ─────────────────────────────────────────────
// Data Sources
// ─────────────────────────────────────────────

export type DataSourceStatus = "connected" | "disconnected" | "error" | "pending"

export interface DataSource {
  id: string
  tenantId: string
  name: string
  type: "crm" | "email" | "calendar" | "dialer" | "sequencer" | "custom"
  provider: string
  status: DataSourceStatus
  lastSyncAt?: string
  collectsFields: string[]
  doesNotCollect: string[]
  retentionDays: number
}

// ─────────────────────────────────────────────
// Trust / Privacy settings
// ─────────────────────────────────────────────

export interface TrustSetting {
  id: string
  tenantId: string
  retentionDays: number
  roleAccess: RoleAccess[]
  auditLoggingEnabled: boolean
  lastReviewedAt: string
  reviewedBy: string
}

export interface RoleAccess {
  role: "admin" | "manager" | "viewer" | "rep"
  canViewIndividualScores: boolean
  canViewTeamAggregates: boolean
  canViewRawActivity: boolean
  canExportData: boolean
  canManageSettings: boolean
}

// ─────────────────────────────────────────────
// Dashboard summary
// ─────────────────────────────────────────────

export interface TeamSummary {
  totalReps: number
  repsDrifting: number
  repsImproving: number
  coachingOpportunitiesThisWeek: number
  avgSignalConfidence: number
  patternShifts: PatternShift[]
  repsNeedingAttention: Rep[]
  topCohortBenchmark: TopCohortBenchmark
  teamMedian: PatternScore
}
