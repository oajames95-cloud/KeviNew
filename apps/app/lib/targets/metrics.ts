// ============================================================
// lib/targets/metrics.ts
// Server-only. The ONE place that maps a MetricType to its real data column and
// computes a rep's actual value over a window. Replaces calculateTargetProgress
// (coaching/targets.ts) and calculateCurrentValue (coaching/target-progress.ts),
// both of which used column names that do not match this database.
//
// Verified column map (against the live schema):
//   meetings_booked     -> rep_outcomes.meetings_booked        (sum)   date col: outcome_date
//   pipeline_created    -> rep_outcomes.pipeline_created       (sum)   date col: outcome_date
//   sqls_booked         -> rep_outcomes.qualified_meetings     (sum)   date col: outcome_date
//   positive_replies    -> rep_outcomes.positive_replies       (sum)   date col: outcome_date
//   prospecting_minutes -> rep_daily_metrics.prospecting_minutes (avg/day) date col: metric_date
// ============================================================

import { createClient } from '@/lib/supabase/server'
import type { MetricType } from './types'

const OUTCOMES_DATE = 'outcome_date'
const DAILY_DATE = 'metric_date'

// Metrics that are a SUM of a rep_outcomes column.
const OUTCOME_SUM: Partial<Record<MetricType, string>> = {
  meetings_booked: 'meetings_booked',
  pipeline_created: 'pipeline_created',
  sqls_booked: 'qualified_meetings',
  positive_replies: 'positive_replies',
}

function sum(rows: any[], col: string): number {
  return (rows || []).reduce((s, r) => s + (Number(r[col]) || 0), 0)
}
function avg(rows: any[], col: string): number {
  if (!rows || rows.length === 0) return 0
  return sum(rows, col) / rows.length
}

// Single rep, single metric. The primitive — use on the rep page where each
// metric may have its own override window.
export async function calculateActual(
  repId: string,
  metric: MetricType,
  startDate: string,
  endDate: string
): Promise<number> {
  const supabase = await createClient()
  try {
    const outcomeCol = OUTCOME_SUM[metric]
    if (outcomeCol) {
      const { data } = await supabase
        .from('rep_outcomes')
        .select(outcomeCol)
        .eq('rep_id', repId)
        .gte(OUTCOMES_DATE, startDate)
        .lte(OUTCOMES_DATE, endDate)
      return Math.round(sum(data || [], outcomeCol))
    }
    if (metric === 'prospecting_minutes') {
      const { data } = await supabase
        .from('rep_daily_metrics')
        .select('prospecting_minutes')
        .eq('rep_id', repId)
        .gte(DAILY_DATE, startDate)
        .lte(DAILY_DATE, endDate)
      return Math.round(avg(data || [], 'prospecting_minutes'))
    }
    return 0
  } catch (e) {
    console.error('[targets] calculateActual error:', e)
    return 0
  }
}

export type ActualsByRep = Map<string, Partial<Record<MetricType, number>>>

// Batched: every metric for many reps over ONE shared window, in two queries
// total (outcomes + daily metrics). This is what the Targets tab matrix reads,
// so a 12-rep team is 2 queries, not 60. Use this when all reps share a display
// window (the common case); use calculateActual for per-rep override windows.
export async function calculateActualsForReps(
  repIds: string[],
  startDate: string,
  endDate: string
): Promise<ActualsByRep> {
  const result: ActualsByRep = new Map(repIds.map((id) => [id, {}]))
  if (repIds.length === 0) return result

  const supabase = await createClient()

  const [{ data: outcomes }, { data: daily }] = await Promise.all([
    supabase
      .from('rep_outcomes')
      .select('rep_id, meetings_booked, pipeline_created, qualified_meetings, positive_replies')
      .in('rep_id', repIds)
      .gte(OUTCOMES_DATE, startDate)
      .lte(OUTCOMES_DATE, endDate),
    supabase
      .from('rep_daily_metrics')
      .select('rep_id, prospecting_minutes')
      .in('rep_id', repIds)
      .gte(DAILY_DATE, startDate)
      .lte(DAILY_DATE, endDate),
  ])

  // Outcomes: sums.
  for (const row of outcomes || []) {
    const r = result.get(row.rep_id)
    if (!r) continue
    r.meetings_booked = (r.meetings_booked || 0) + (Number(row.meetings_booked) || 0)
    r.pipeline_created = (r.pipeline_created || 0) + (Number(row.pipeline_created) || 0)
    r.sqls_booked = (r.sqls_booked || 0) + (Number(row.qualified_meetings) || 0)
    r.positive_replies = (r.positive_replies || 0) + (Number(row.positive_replies) || 0)
  }

  // Daily metrics: prospecting minutes averaged per active day.
  const prospAccum = new Map<string, { sum: number; n: number }>()
  for (const row of daily || []) {
    const acc = prospAccum.get(row.rep_id) || { sum: 0, n: 0 }
    acc.sum += Number(row.prospecting_minutes) || 0
    acc.n += 1
    prospAccum.set(row.rep_id, acc)
  }
  for (const [repId, acc] of prospAccum) {
    const r = result.get(repId)
    if (r) r.prospecting_minutes = acc.n ? Math.round(acc.sum / acc.n) : 0
  }

  // Round outcome sums.
  for (const r of result.values()) {
    if (r.meetings_booked != null) r.meetings_booked = Math.round(r.meetings_booked)
    if (r.pipeline_created != null) r.pipeline_created = Math.round(r.pipeline_created)
    if (r.sqls_booked != null) r.sqls_booked = Math.round(r.sqls_booked)
    if (r.positive_replies != null) r.positive_replies = Math.round(r.positive_replies)
  }

  return result
}
