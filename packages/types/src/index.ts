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
  contextSwitches: number
  focusBlocksMin: number
  workdayMinutes: number
}

export interface PatternScore {
  topRepSimilarity: number
  workflowDrift: number
  prospectingFocusTime: number
  followUpDiscipline: number
  outboundVelocity: number
  signalConfidence: number
}

export interface TopCohortBenchmark {
  topRepSimilarity: number
  workflowDrift: number
  prospectingFocusTime: number
  followUpDiscipline: number
  outboundVelocity: number
  signalConfidence: number
}

// ─────────────────────────────────────────────
// Activity History (daily workflow snapshots)
// ─────────────────────────────────────────────

export interface DailyActivity extends WorkflowActivity {
  callsDialed: number
  connectRate: number
  emailsSent: number
  meetingsBooked: number
  followUpRate: number
}

export interface PatternShift {
  id: string
  repId: string
  repName: string
  date: string
  metric: keyof PatternScore
  direction: "up" | "down"
  magnitude: number
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
  | "outbound velocity"
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

export interface CoachingSession {
  id: string
  tenantId: string
  repId: string
  repName: string
  managerId: string
  scheduledAt: string // ISO datetime
  duration: number // minutes
  status: "scheduled" | "completed" | "cancelled"
  coachingItemId?: string // Link to related coaching insight
  talkingPoints: TalkingPoint[]
  actionItems: ActionItem[]
  notes?: string
  completedAt?: string
}

export interface TalkingPoint {
  id: string
  text: string
  checked: boolean
}

export interface ActionItem {
  id: string
  text: string
  dueDate?: string
  completed: boolean
  completedAt?: string
}

// ─────────────────────────────────────────────
// Rep Targets (Coaching commitments)
// ─────────────────────────────────────────────

export type RepTargetMetric = 
  | "emails_sent"
  | "prospecting_time"
  | "meetings_booked"
  | "pipeline_created"
  | "response_rate"
  | "open_rate"
  | "account_activity"
  | "calls_dialed"

export interface RepTarget {
  id: string
  tenantId: string
  repId: string
  createdFromSessionId?: string
  metric: RepTargetMetric
  targetValue: number
  timeFrame: "daily" | "weekly" | "monthly"
  accountScope?: string
  notes?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  status: "active" | "completed" | "cancelled"
}

export type TargetPaceStatus = "on-track" | "watch" | "behind"

export interface RepTargetProgress {
  target: RepTarget
  currentValue: number
  paceStatus: TargetPaceStatus
  progress: number
  daysRemaining: number
  projectedAtCompletion: number
}

// ─────────────────────────────────────────────
// Accounts & Touches
// ─────────────────────────────────────────────

export type AccountStatus =
  | "cold"
  | "touched"
  | "engaged"
  | "booked"
  | "qualified"
  | "pipeline"
  | "closed_lost"

export type TouchChannel =
  | "email"
  | "linkedin_message"
  | "linkedin_connect"
  | "linkedin_inmail"
  | "call"
  | "voicemail"
  | "sequence"
  | "meeting_booked"
  | "meeting_held"
  | "referral"

export type TouchDirection = "outbound" | "inbound"

export interface Account {
  id: string
  organizationId: string
  name: string
  domain: string | null
  industry: string | null
  employeeCount: number | null
  source: string | null
  externalId: string | null
  assignedRepId: string | null
  status: AccountStatus
  heatScore: number
  progressScore: number
  firstTouchedAt: string | null
  lastTouchedAt: string | null
  lastResponseAt: string | null
  stageEnteredAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AccountTouch {
  id: string
  accountId: string
  contactId: string | null
  repId: string
  organizationId: string
  channel: TouchChannel
  direction: TouchDirection
  touchType: string | null
  subject: string | null
  bodyPreview: string | null
  responseReceived: boolean
  responseAt: string | null
  touchedAt: string
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
// Accounts - Action-to-Result tracking
// ─────────────────────────────────────────────

export type AccountStage = "prospecting" | "discovery" | "evaluation" | "negotiation" | "closed-won" | "closed-lost"
export type AccountHeat = "cold" | "warm" | "hot"
export type TouchChannel = "email" | "call" | "linkedin" | "meeting" | "sms"
export type TouchDirection = "outbound" | "inbound"
export type TouchOutcome = "no_response" | "positive" | "negative" | "neutral" | "meeting_booked" | "deal_moved"

export interface Account {
  id: string
  tenantId: string
  name: string
  domain?: string
  industry?: string
  employeeCount?: number
  annualRevenue?: number
  stage: AccountStage
  heat: AccountHeat
  ownerId: string // rep_id
  ownerName: string
  createdAt: string
  lastTouchAt?: string
  daysSinceLastTouch: number
  totalTouches: number
  touchesLast7Days: number
  touchesLast30Days: number
  meetingsBooked: number
  pipelineValue?: number
  winProbability?: number
  contacts: AccountContact[]
}

export interface AccountContact {
  id: string
  accountId: string
  name: string
  title?: string
  email?: string
  phone?: string
  isPrimary: boolean
  touchCount: number
  lastTouchAt?: string
}

export interface AccountTouch {
  id: string
  accountId: string
  contactId?: string
  repId: string
  repName: string
  channel: TouchChannel
  direction: TouchDirection
  outcome: TouchOutcome
  subject?: string
  notes?: string
  timestamp: string
  durationMinutes?: number
  nextStepScheduled?: boolean
}

export interface AccountTransition {
  id: string
  accountId: string
  fromStage: AccountStage
  toStage: AccountStage
  triggeredBy: string // touch_id
  timestamp: string
  daysInPreviousStage: number
}

export interface AccountPattern {
  repId: string
  repName: string
  avgTouchesToMeeting: number
  avgDaysToMeeting: number
  preferredChannelMix: Record<TouchChannel, number>
  avgTouchesPerWeek: number
  conversionRate: number
  winRate: number
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
