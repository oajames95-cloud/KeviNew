import type {
  Team,
  Rep,
  CoachingInsight,
  CoachingSession,
  DataSource,
  TrustSetting,
  TeamSummary,
  PatternShift,
  Manager,
  Tenant,
} from "@/types"

// ─────────────────────────────────────────────
// Tenant + Manager
// ─────────────────────────────────────────────

export const mockTenant: Tenant = {
  id: "t_01",
  name: "Apex Revenue Co.",
  slug: "apex-revenue",
  plan: "enterprise",
  createdAt: "2024-01-15",
}

export const mockManager: Manager = {
  id: "m_01",
  tenantId: "t_01",
  name: "Jordan Rivera",
  email: "jordan@apexrevenue.com",
  role: "manager",
  teamIds: ["team_01", "team_02"],
}

// ─────────────────────────────────────────────
// Teams
// ─────────────────────────────────────────────

export const mockTeams: Team[] = [
  {
    id: "team_01",
    tenantId: "t_01",
    name: "West Enterprise",
    managerId: "m_01",
    repCount: 8,
    avgPatternMatch: 72,
    avgDriftScore: 28,
    createdAt: "2024-01-15",
  },
  {
    id: "team_02",
    tenantId: "t_01",
    name: "East Mid-Market",
    managerId: "m_01",
    repCount: 6,
    avgPatternMatch: 58,
    avgDriftScore: 42,
    createdAt: "2024-02-01",
  },
]

// ─────────────────────────────────────────────
// Reps
// ─────────────────────────────────────────────

export const mockReps: Rep[] = [
  {
    id: "rep_01",
    tenantId: "t_01",
    teamId: "team_01",
    managerId: "m_01",
    name: "Priya Sharma",
    email: "priya@apexrevenue.com",
    role: "Senior SDR",
    hireDate: "2022-06-01",
    trend: "improving",
    scores: {
      topRepSimilarity: 88,
      workflowDrift: 12,
      prospectingFocusTime: 82,
      followUpDiscipline: 91,
      outboundVelocity: 79,
      signalConfidence: 94,
    },
    recentActivity: generateActivity(180, 28, 85, 45, 60, 40, 45, 22, 95, 22, 0.42, 18, 3.2, 0.88),
    dataSourceIds: ["ds_01", "ds_02", "ds_03"],
  },
  {
    id: "rep_02",
    tenantId: "t_01",
    teamId: "team_01",
    managerId: "m_01",
    name: "Marcus Chen",
    email: "marcus@apexrevenue.com",
    role: "SDR",
    hireDate: "2023-03-15",
    trend: "stable",
    scores: {
      topRepSimilarity: 74,
      workflowDrift: 26,
      prospectingFocusTime: 68,
      followUpDiscipline: 72,
      outboundVelocity: 65,
      signalConfidence: 81,
    },
    recentActivity: generateActivity(150, 18, 72, 38, 55, 35, 40, 28, 78, 18, 0.34, 14, 2.1, 0.71),
    dataSourceIds: ["ds_01", "ds_02"],
  },
  {
    id: "rep_03",
    tenantId: "t_01",
    teamId: "team_01",
    managerId: "m_01",
    name: "Aaliya Torres",
    email: "aaliya@apexrevenue.com",
    role: "SDR",
    hireDate: "2023-08-20",
    trend: "drifting",
    scores: {
      topRepSimilarity: 51,
      workflowDrift: 49,
      prospectingFocusTime: 44,
      followUpDiscipline: 38,
      outboundVelocity: 52,
      signalConfidence: 76,
    },
    recentActivity: generateActivity(95, 12, 55, 28, 45, 25, 60, 48, 48, 12, 0.21, 9, 1.2, 0.44),
    dataSourceIds: ["ds_01", "ds_03"],
  },
  {
    id: "rep_04",
    tenantId: "t_01",
    teamId: "team_01",
    managerId: "m_01",
    name: "Devon Brooks",
    email: "devon@apexrevenue.com",
    role: "Senior SDR",
    hireDate: "2022-01-10",
    trend: "improving",
    scores: {
      topRepSimilarity: 83,
      workflowDrift: 17,
      prospectingFocusTime: 79,
      followUpDiscipline: 84,
      outboundVelocity: 88,
      signalConfidence: 90,
    },
    recentActivity: generateActivity(175, 32, 80, 42, 58, 42, 42, 20, 88, 20, 0.39, 16, 2.8, 0.82),
    dataSourceIds: ["ds_01", "ds_02", "ds_04"],
  },
  {
    id: "rep_05",
    tenantId: "t_01",
    teamId: "team_02",
    managerId: "m_01",
    name: "Sam Nguyen",
    email: "sam@apexrevenue.com",
    role: "SDR",
    hireDate: "2024-01-08",
    trend: "at-risk",
    scores: {
      topRepSimilarity: 34,
      workflowDrift: 66,
      prospectingFocusTime: 29,
      followUpDiscipline: 22,
      outboundVelocity: 31,
      signalConfidence: 62,
    },
    recentActivity: generateActivity(65, 8, 40, 18, 35, 20, 85, 62, 28, 8, 0.14, 6, 0.5, 0.22),
    dataSourceIds: ["ds_01"],
  },
  {
    id: "rep_06",
    tenantId: "t_01",
    teamId: "team_02",
    managerId: "m_01",
    name: "Keisha Owens",
    email: "keisha@apexrevenue.com",
    role: "SDR",
    hireDate: "2023-05-01",
    trend: "stable",
    scores: {
      topRepSimilarity: 67,
      workflowDrift: 33,
      prospectingFocusTime: 71,
      followUpDiscipline: 68,
      outboundVelocity: 60,
      signalConfidence: 78,
    },
    recentActivity: generateActivity(140, 20, 68, 36, 52, 32, 48, 32, 72, 16, 0.31, 13, 1.8, 0.66),
    dataSourceIds: ["ds_01", "ds_02"],
  },
  {
    id: "rep_07",
    tenantId: "t_01",
    teamId: "team_02",
    managerId: "m_01",
    name: "Rafael Diaz",
    email: "rafael@apexrevenue.com",
    role: "Senior SDR",
    hireDate: "2022-09-12",
    trend: "drifting",
    scores: {
      topRepSimilarity: 59,
      workflowDrift: 41,
      prospectingFocusTime: 55,
      followUpDiscipline: 48,
      outboundVelocity: 62,
      signalConfidence: 74,
    },
    recentActivity: generateActivity(120, 16, 62, 32, 48, 28, 55, 42, 58, 14, 0.26, 11, 1.4, 0.52),
    dataSourceIds: ["ds_01", "ds_03"],
  },
]

function generateActivity(
  timeProspecting: number,     // min/day - calls, connects
  timeResearching: number,     // min/day - pre-call prep
  timeInApollo: number,        // min/day 
  timeInLinkedIn: number,      // min/day
  timeInCRM: number,           // min/day
  timeInSequencer: number,     // min/day
  timeInEmail: number,         // min/day
  contextSwitches: number,     // switches/day
  focusBlocksMin: number,      // uninterrupted prospecting min
  calls: number,
  connectRate: number,
  emails: number,
  meetings: number,
  followUpRate: number,
) {
  const days = ["2025-01-06", "2025-01-07", "2025-01-08", "2025-01-09", "2025-01-10"]
  return days.map((date) => ({
    date,
    timeProspecting: Math.round(timeProspecting * (0.85 + Math.random() * 0.3)),
    timeResearching: Math.round(timeResearching * (0.8 + Math.random() * 0.4)),
    timeBuildingLists: Math.round(12 * (0.7 + Math.random() * 0.5)),
    timeInApollo: Math.round(timeInApollo * (0.9 + Math.random() * 0.2)),
    timeInLinkedIn: Math.round(timeInLinkedIn * (0.85 + Math.random() * 0.3)),
    timeInCRM: Math.round(timeInCRM * (0.8 + Math.random() * 0.4)),
    timeInSequencer: Math.round(timeInSequencer * (0.75 + Math.random() * 0.5)),
    timeInEmail: Math.round(timeInEmail * (0.9 + Math.random() * 0.2)),
    timeInCalendar: Math.round(8 * (0.8 + Math.random() * 0.4)),
    idleTime: Math.round(Math.random() * 30),
    contextSwitches: Math.round(contextSwitches * (0.9 + Math.random() * 0.2)),
    focusBlocksMin: Math.round(focusBlocksMin * (0.8 + Math.random() * 0.4)),
    workdayMinutes: 480,
    callsDialed: Math.round(calls * (0.85 + Math.random() * 0.3)),
    connectRate: Math.round(connectRate * 100 * (0.9 + Math.random() * 0.2)),
    emailsSent: Math.round(emails * (0.8 + Math.random() * 0.4)),
    meetingsBooked: Math.round(meetings * (0.7 + Math.random() * 0.6)),
    followUpRate: Math.round(followUpRate * 100 * (0.85 + Math.random() * 0.3)),
  }))
}

// ─────────────────────────────────────────────
// Pattern Shifts
// ─────────────────────────────────────────────

export const mockPatternShifts: PatternShift[] = [
  {
    id: "ps_01",
    repId: "rep_03",
    repName: "Aaliya Torres",
    date: "2025-01-10",
    metric: "followUpDiscipline",
    direction: "down",
    magnitude: 18,
    notes: "Follow-up rate dropped 18% after new sequencer rollout — check if it's capacity or tooling issue",
  },
  {
    id: "ps_02",
    repId: "rep_01",
    repName: "Priya Sharma",
    date: "2025-01-09",
    metric: "topRepSimilarity",
    direction: "up",
    magnitude: 11,
    notes: "Time in prospecting increased 18 min/day — consistent workflow alignment",
  },
  {
    id: "ps_03",
    repId: "rep_05",
    repName: "Sam Nguyen",
    date: "2025-01-10",
    metric: "prospectingFocusTime",
    direction: "down",
    magnitude: 22,
    notes: "Context switches up to 62/day, prospecting focus blocks dropped 35 min — fragmented workflow",
  },
  {
    id: "ps_04",
    repId: "rep_04",
    repName: "Devon Brooks",
    date: "2025-01-08",
    metric: "outboundVelocity",
    direction: "up",
    magnitude: 14,
    notes: "Research time up to 32 min/day avg — spending more time preparing for calls",
  },
  {
    id: "ps_05",
    repId: "rep_07",
    repName: "Rafael Diaz",
    date: "2025-01-07",
    metric: "workflowDrift",
    direction: "down",
    magnitude: 8,
    notes: "Email time normalized, prospecting time stabilized after coaching session",
  },
]

// ─────────────────────────────────────────────
// Coaching Queue
// ─────────────────────────────────────────────

export const mockCoachingInsights: CoachingInsight[] = [
  {
    id: "ci_01",
    tenantId: "t_01",
    repId: "rep_05",
    repName: "Sam Nguyen",
    teamId: "team_02",
    teamName: "East Mid-Market",
    managerId: "m_01",
    severity: "critical",
    status: "new",
    theme: "workflow mix",
    reason: "Spending 85 min/day in email vs 65 min prospecting. Context switches 62/day (2.5x top reps). Workflow structure needs immediate reset.",
    recommendedAction: "Schedule 30-min 1:1 focused on daily workflow blocks. Build time-blocking template together starting with prospecting window.",
    flaggedAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-01-10T09:00:00Z",
    metrics: { topRepSimilarity: 34, workflowDrift: 66, prospectingFocusTime: 29, followUpDiscipline: 22 },
    notes: [],
  },
  {
    id: "ci_02",
    tenantId: "t_01",
    repId: "rep_03",
    repName: "Aaliya Torres",
    teamId: "team_01",
    teamName: "West Enterprise",
    managerId: "m_01",
    severity: "high",
    status: "reviewing",
    theme: "follow-up discipline",
    reason: "Follow-up discipline dropped from 56 to 38 in 7 days. Correlates with sequencer tool rollout. May be process friction.",
    recommendedAction: "Review sequence cadence and tooling. Is this a capability gap or a setup issue with the new tool?",
    flaggedAt: "2025-01-09T14:00:00Z",
    updatedAt: "2025-01-10T10:30:00Z",
    metrics: { followUpDiscipline: 38, topRepSimilarity: 51 },
    notes: [
      {
        id: "n_01",
        authorId: "m_01",
        authorName: "Jordan Rivera",
        content: "Checked her recent activity — the drop started day 1 of sequencer rollout. She&apos;s spending 60+ min/day in email now vs 35 before. May need hands-on tool training.",
        createdAt: "2025-01-10T10:30:00Z",
      },
    ],
  },
  {
    id: "ci_03",
    tenantId: "t_01",
    repId: "rep_07",
    repName: "Rafael Diaz",
    teamId: "team_02",
    teamName: "East Mid-Market",
    managerId: "m_01",
    severity: "medium",
    status: "watchlist",
    theme: "prospecting focus",
    reason: "Prospecting focus blocks averaging 55 min vs 85+ for top reps. Context switches climbing to 42/day. Focus is fragmenting.",
    recommendedAction: "Discuss morning routine and focus block protection. Recommend quiet hours / DND blocks on calendar.",
    flaggedAt: "2025-01-07T11:00:00Z",
    updatedAt: "2025-01-09T08:00:00Z",
    metrics: { prospectingFocusTime: 55, followUpDiscipline: 48 },
    notes: [],
  },
  {
    id: "ci_04",
    tenantId: "t_01",
    repId: "rep_02",
    repName: "Marcus Chen",
    teamId: "team_01",
    teamName: "West Enterprise",
    managerId: "m_01",
    severity: "medium",
    status: "new",
    theme: "outbound velocity",
    reason: "Research/prep time at 18 min/day vs 28+ for top reps. Spending 72 min in Apollo/LinkedIn — not balanced with research time.",
    recommendedAction: "Share top-performer pre-call checklist. Schedule a co-work session to model research workflow with Priya.",
    flaggedAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-01-10T08:00:00Z",
    metrics: { outboundVelocity: 65, topRepSimilarity: 74 },
    notes: [],
  },
  {
    id: "ci_05",
    tenantId: "t_01",
    repId: "rep_06",
    repName: "Keisha Owens",
    teamId: "team_02",
    teamName: "East Mid-Market",
    managerId: "m_01",
    severity: "low",
    status: "coached",
    theme: "winning habits",
    reason: "Top Rep Similarity improving (now 67). Workflow is stabilizing. Good trajectory on prospecting time allocation.",
    recommendedAction: "Acknowledge progress in next 1:1. Identify next focus area — possibly CRM usage optimization.",
    flaggedAt: "2025-01-05T09:00:00Z",
    updatedAt: "2025-01-08T16:00:00Z",
    metrics: { topRepSimilarity: 67, workflowDrift: 33 },
    notes: [
      {
        id: "n_02",
        authorId: "m_01",
        authorName: "Jordan Rivera",
        content: "Great 1:1 — she&apos;s aware of the gaps. We built a daily schedule template and she&apos;s tracking it. Will recheck in 2 weeks.",
        createdAt: "2025-01-08T16:00:00Z",
      },
    ],
  },
]

// ─────────────────────────────────────────────
// Coaching Sessions (Scheduled 1:1s)
// ─────────────────────────────────────────────

const today = new Date()
const todayStr = today.toISOString().split('T')[0]
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)
const tomorrowStr = tomorrow.toISOString().split('T')[0]

export const mockCoachingSessions: CoachingSession[] = [
  {
    id: "cs_01",
    tenantId: "t_01",
    repId: "rep_05",
    repName: "Sam Nguyen",
    managerId: "m_01",
    scheduledAt: `${todayStr}T10:00:00Z`,
    duration: 30,
    status: "scheduled",
    coachingItemId: "ci_01",
    talkingPoints: [
      { id: "tp_01", text: "Review daily workflow structure and time blocks", checked: false },
      { id: "tp_02", text: "Discuss email vs prospecting time balance (85 min vs 65 min)", checked: false },
      { id: "tp_03", text: "Build a time-blocking template together", checked: false },
      { id: "tp_04", text: "Set clear expectations for context switch reduction", checked: false },
    ],
    actionItems: [
      { id: "ai_01", text: "Create morning prospecting block (9-11am)", dueDate: tomorrowStr, completed: false },
      { id: "ai_02", text: "Limit email checks to 3x per day", dueDate: tomorrowStr, completed: false },
    ],
    notes: "",
  },
  {
    id: "cs_02",
    tenantId: "t_01",
    repId: "rep_03",
    repName: "Aaliya Torres",
    managerId: "m_01",
    scheduledAt: `${todayStr}T14:30:00Z`,
    duration: 30,
    status: "scheduled",
    coachingItemId: "ci_02",
    talkingPoints: [
      { id: "tp_05", text: "Understand how sequencer rollout is affecting workflow", checked: false },
      { id: "tp_06", text: "Review follow-up discipline drop (from 56 to 38)", checked: false },
      { id: "tp_07", text: "Identify if this is a training or process issue", checked: false },
    ],
    actionItems: [
      { id: "ai_03", text: "Complete sequencer training module", dueDate: tomorrowStr, completed: false },
    ],
    notes: "",
  },
  {
    id: "cs_03",
    tenantId: "t_01",
    repId: "rep_02",
    repName: "Marcus Chen",
    managerId: "m_01",
    scheduledAt: `${tomorrowStr}T11:00:00Z`,
    duration: 30,
    status: "scheduled",
    coachingItemId: "ci_04",
    talkingPoints: [
      { id: "tp_08", text: "Share top-performer pre-call research checklist", checked: false },
      { id: "tp_09", text: "Discuss balancing research time with outreach volume", checked: false },
    ],
    actionItems: [],
    notes: "",
  },
]

// ─────────────────────────────────────────────
// Rep Targets (Coaching commitments)
// ─────────────────────────────────────────────

export const mockRepTargets: RepTarget[] = [
  {
    id: "rt_01",
    tenantId: "t_01",
    repId: "rep_05",
    createdFromSessionId: "cs_01",
    metric: "prospecting_time",
    targetValue: 300, // 5 hours/day
    timeFrame: "daily",
    notes: "From Jan 10 coaching session — build morning prospecting block 9-11am",
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
    status: "active",
  },
  {
    id: "rt_02",
    tenantId: "t_01",
    repId: "rep_05",
    createdFromSessionId: "cs_01",
    metric: "emails_sent",
    targetValue: 18, // max per day (not min)
    timeFrame: "daily",
    notes: "Reduce email time to 3 checks/day max",
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
    status: "active",
  },
  {
    id: "rt_03",
    tenantId: "t_01",
    repId: "rep_03",
    metric: "follow_up_rate",
    targetValue: 45, // percentage
    timeFrame: "weekly",
    notes: "Get back to 50+ follow-up rate after sequencer ramp",
    createdAt: "2025-01-08T14:00:00Z",
    updatedAt: "2025-01-10T09:00:00Z",
    status: "active",
  },
  {
    id: "rt_04",
    tenantId: "t_01",
    repId: "rep_02",
    metric: "prospecting_time",
    targetValue: 360, // 6 hours/day target for stronger research
    timeFrame: "daily",
    notes: "Increase research/prep time from 18 to 28 min/day",
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-01-10T08:00:00Z",
    status: "active",
  },
  {
    id: "rt_05",
    tenantId: "t_01",
    repId: "rep_06",
    metric: "meetings_booked",
    targetValue: 6, // per week
    timeFrame: "weekly",
    notes: "Maintain momentum from recent coaching",
    createdAt: "2025-01-08T16:00:00Z",
    updatedAt: "2025-01-09T10:00:00Z",
    status: "active",
  },
]

export const mockDataSources = [
  {
    id: "ds_01",
    tenantId: "t_01",
    name: "Salesforce CRM",
    type: "crm",
    provider: "Salesforce",
    status: "connected",
    lastSyncAt: "2025-01-10T06:00:00Z",
    collectsFields: ["Call logs", "Activity timestamps", "Pipeline stage changes", "Email open metadata"],
    doesNotCollect: ["Email body content", "Call recordings", "Personal communications"],
    retentionDays: 90,
  },
  {
    id: "ds_02",
    tenantId: "t_01",
    name: "Google Calendar",
    type: "calendar",
    provider: "Google",
    status: "connected",
    lastSyncAt: "2025-01-10T07:30:00Z",
    collectsFields: ["Meeting duration", "Event count", "Focus block detection", "Prep time signals"],
    doesNotCollect: ["Meeting notes", "Attendee names", "Personal calendar events"],
    retentionDays: 60,
  },
  {
    id: "ds_03",
    tenantId: "t_01",
    name: "Outreach",
    type: "sequencer",
    provider: "Outreach",
    status: "connected",
    lastSyncAt: "2025-01-10T06:45:00Z",
    collectsFields: ["Sequence step completion", "Reply rates", "Follow-up timing", "Task completion"],
    doesNotCollect: ["Email body content", "Contact personal data", "Prospect information"],
    retentionDays: 90,
  },
  {
    id: "ds_04",
    tenantId: "t_01",
    name: "Gong",
    type: "dialer",
    provider: "Gong",
    status: "error",
    lastSyncAt: "2025-01-08T12:00:00Z",
    collectsFields: ["Call count", "Talk time", "Call timing patterns"],
    doesNotCollect: ["Call transcripts", "Call recordings", "Conversation content"],
    retentionDays: 30,
  },
]

// ─────────────────────────────────────────────
// Trust Settings
// ─────────────────────────────────────────────

export const mockTrustSetting: TrustSetting = {
  id: "ts_01",
  tenantId: "t_01",
  retentionDays: 90,
  auditLoggingEnabled: true,
  lastReviewedAt: "2025-01-05",
  reviewedBy: "Jordan Rivera",
  roleAccess: [
    {
      role: "admin",
      canViewIndividualScores: true,
      canViewTeamAggregates: true,
      canViewRawActivity: true,
      canExportData: true,
      canManageSettings: true,
    },
    {
      role: "manager",
      canViewIndividualScores: true,
      canViewTeamAggregates: true,
      canViewRawActivity: false,
      canExportData: true,
      canManageSettings: false,
    },
    {
      role: "viewer",
      canViewIndividualScores: false,
      canViewTeamAggregates: true,
      canViewRawActivity: false,
      canExportData: false,
      canManageSettings: false,
    },
    {
      role: "rep",
      canViewIndividualScores: true,
      canViewTeamAggregates: false,
      canViewRawActivity: false,
      canExportData: false,
      canManageSettings: false,
    },
  ],
}

// ─────────────────────────────────────────────
// Team Summary
// ─────────────────────────────────────────────

export const mockTeamSummary: TeamSummary = {
  totalReps: 14,
  repsDrifting: 3,
  repsImproving: 4,
  coachingOpportunitiesThisWeek: 5,
  avgSignalConfidence: 79,
  patternShifts: mockPatternShifts,
  repsNeedingAttention: mockReps.filter((r) =>
    r.trend === "drifting" || r.trend === "at-risk"
  ),
  topCohortBenchmark: {
    topRepSimilarity: 88,
    workflowDrift: 12,
    prospectingFocusTime: 84,
    followUpDiscipline: 90,
    outboundVelocity: 86,
    signalConfidence: 92,
  },
  teamMedian: {
    topRepSimilarity: 65,
    workflowDrift: 35,
    prospectingFocusTime: 61,
    followUpDiscipline: 60,
    outboundVelocity: 63,
    signalConfidence: 79,
  },
}
