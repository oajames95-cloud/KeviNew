// ============================================================
// lib/targets/types.ts
// The ONE canonical target vocabulary. Pure types + metadata, safe to import
// from both client and server. Replaces the divergent TargetMetricType unions
// previously duplicated in lib/coaching/targets.ts, target-progress.ts and
// target-utils.ts.
// ============================================================

export type MetricType =
  | 'meetings_booked'
  | 'pipeline_created'
  | 'prospecting_minutes'
  | 'positive_replies'
  | 'sqls_booked'

export type TargetPeriod = 'daily' | 'weekly' | 'monthly'

// gte = "at least" (most targets). lte = "at most" (e.g. future: context switches).
export type Comparison = 'gte' | 'lte'

// Where an effective target came from. This is the field that makes the
// Targets tab honest — no guessing by comparing values.
export type TargetSource = 'override' | 'team_playbook' | 'org_playbook' | 'none'

export type PaceStatus = 'on_track' | 'at_risk' | 'behind' | 'no_target'

export interface TargetWindow {
  startDate: string // yyyy-mm-dd
  endDate: string   // yyyy-mm-dd
}

// The resolver's answer to: "what is this rep's target for this metric, right now?"
export interface EffectiveTarget {
  metric: MetricType
  value: number | null // null only when source === 'none'
  period: TargetPeriod
  comparison: Comparison
  source: TargetSource
  sessionId?: string | null // set when source === 'override'
  targetId?: string | null  // coaching_targets.id (override) or playbook_targets.id (default)
  window: TargetWindow
}

// An effective target combined with the rep's actual tracked value.
export interface TargetStatus extends EffectiveTarget {
  actual: number
  paceStatus: PaceStatus
  pacePercent: number // actual ÷ expected-by-now, ×100, rounded
}

export const METRIC_TYPES: MetricType[] = [
  'meetings_booked',
  'pipeline_created',
  'prospecting_minutes',
  'positive_replies',
  'sqls_booked',
]

export interface MetricMeta {
  label: string
  unit: 'count' | 'currency' | 'minutes' | 'percent'
  defaultComparison: Comparison
}

export const METRIC_META: Record<MetricType, MetricMeta> = {
  meetings_booked:    { label: 'Meetings booked',  unit: 'count',    defaultComparison: 'gte' },
  pipeline_created:   { label: 'Pipeline created', unit: 'currency', defaultComparison: 'gte' },
  prospecting_minutes:{ label: 'Prospecting time', unit: 'minutes',  defaultComparison: 'gte' },
  positive_replies:   { label: 'Positive replies', unit: 'count',    defaultComparison: 'gte' },
  sqls_booked:        { label: 'SQLs booked',      unit: 'count',    defaultComparison: 'gte' },
}
